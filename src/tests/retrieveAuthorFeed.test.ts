import { Agent } from '@atproto/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { retrieveAuthorFeed } from '../lib/bsky-tldr';

vi.mock('@atproto/api', () => ({
  Agent: vi.fn(),
}));

describe('retrieveAuthorFeed', () => {
  const ACTOR = 'test-actor';
  const TARGET_DATE = '20230415';

  interface MockPostOptions {
    $type?: 'app.bsky.feed.defs#postView';
    uri?: string;
    text?: string;
    cid?: string;
    author?: {
      did: string;
      handle: string;
    };
    createdAt?: string;
    isRepost?: boolean;
    facets?: Array<any>;
    indexedAt?: string;
  }

  function createMockPost(options: MockPostOptions = {}) {
    const {
      uri = 'at://did:plc:999',
      cid = 'bafyreif6nknxyiz4vogmctgg4ulvofykx52rdgfishob76y3yhx7wu4bye',
      author = {
        did: 'did:plc:2b2lqipf3vklnfslluzsqbye',
        handle: 'testacme.com',
      },
      text = 'Test post',
      createdAt = '2023-04-15T10:00:00Z',
      isRepost = false,
      facets = [],
      indexedAt = '2023-04-15T10:01:00Z',
    } = options;

    return {
      post: {
        uri,
        cid,
        author: {
          did: author.did,
          handle: author.handle,
        },
        indexedAt,
        record: {
          text,
          createdAt,
          facets,
        },
      },
      reason: isRepost
        ? { $type: 'app.bsky.feed.defs#reasonRepost' }
        : undefined,
    };
  }

  let mockBluesky;

  beforeEach(() => {
    mockBluesky = {
      getAuthorFeed: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if bluesky client is not initialized', async () => {
    const generator = retrieveAuthorFeed({
      bluesky: null as unknown as Agent,
      actor: ACTOR,
      targetDate: TARGET_DATE,
    });

    await expect(generator.next()).rejects.toThrow(
      'Bluesky client not initialized'
    );
  });

  it('should throw an error if getAuthorFeed fails', async () => {
    mockBluesky.getAuthorFeed.mockRejectedValueOnce(
      new Error('Failed to retrieve author feed: API error')
    );

    const generator = retrieveAuthorFeed({
      bluesky: mockBluesky,
      actor: ACTOR,
      targetDate: TARGET_DATE,
    });

    await expect(generator.next()).rejects.toThrow(
      'Failed to retrieve author feed: API error'
    );
  });

  it('should retrieve and filter posts within target date', async () => {
    const mockPosts = [
      createMockPost({
        uri: 'at://did:plc:123',
        text: 'Post 1',
        isRepost: false,
      }),
      createMockPost({
        uri: 'at://did:plc:456',
        text: 'Post 2',
        isRepost: false,
      }),
    ];

    mockBluesky.getAuthorFeed.mockResolvedValueOnce({
      data: { feed: mockPosts, cursor: null },
    });

    const generator = retrieveAuthorFeed({
      bluesky: mockBluesky,
      actor: ACTOR,
      targetDate: TARGET_DATE,
    });

    const result1 = await generator.next();
    const result2 = await generator.next();
    const result3 = await generator.next();

    expect(result1.value).toEqual({
      uri: 'at://did:plc:123',
      content: 'Post 1',
      createdAt: '2023-04-15T10:00:00Z',
      isRepost: false,
      links: [],
    });

    expect(result2.value).toEqual({
      uri: 'at://did:plc:456',
      content: 'Post 2',
      createdAt: '2023-04-15T10:00:00Z',
      isRepost: false,
      links: [],
    });

    expect(result3.done).toBe(true);

    expect(mockBluesky.getAuthorFeed).toHaveBeenCalledWith({
      actor: ACTOR,
      limit: 5,
      cursor: undefined,
    });
  });

  it('should handle pagination with cursor and stop when appropriate', async () => {
    const firstBatchPost = createMockPost({
      uri: 'at://did:plc:123',
      text: 'First batch post',
    });
    const secondBatchPost = createMockPost({
      uri: 'at://did:plc:456',
      text: 'Second batch post',
    });

    mockBluesky.getAuthorFeed
      .mockResolvedValueOnce({
        data: { feed: [firstBatchPost], cursor: 'next-page' },
      })
      .mockResolvedValueOnce({
        data: { feed: [secondBatchPost], cursor: null },
      });

    const generator = retrieveAuthorFeed({
      bluesky: mockBluesky,
      actor: ACTOR,
      targetDate: TARGET_DATE,
    });

    const result1 = await generator.next();
    const result2 = await generator.next();
    const result3 = await generator.next();

    expect(result1.value?.uri).toBe('at://did:plc:123');
    expect(result2.value?.uri).toBe('at://did:plc:456');
    expect(result3.done).toBe(true);

    expect(mockBluesky.getAuthorFeed).toHaveBeenCalledTimes(2);
    expect(mockBluesky.getAuthorFeed).toHaveBeenNthCalledWith(2, {
      actor: ACTOR,
      limit: 5,
      cursor: 'next-page',
    });
  });

  it('should stop retrieval when finding posts earlier than target date', async () => {
    const withinDatePost = createMockPost({
      uri: 'at://did:plc:123',
      text: 'Within date post',
    });
    const earlierPost = createMockPost({
      uri: 'at://did:plc:456',
      text: 'Earlier post',
      createdAt: '2023-04-14T10:00:00Z',
    });

    mockBluesky.getAuthorFeed.mockResolvedValueOnce({
      data: { feed: [withinDatePost, earlierPost], cursor: 'next-page' },
    });

    const generator = retrieveAuthorFeed({
      bluesky: mockBluesky,
      actor: ACTOR,
      targetDate: TARGET_DATE,
    });

    const result1 = await generator.next();
    const result2 = await generator.next();

    expect(result1.value?.uri).toBe('at://did:plc:123');
    expect(result2.done).toBe(true);

    // Should stop after first batch despite having a cursor
    expect(mockBluesky.getAuthorFeed).toHaveBeenCalledTimes(1);
  });

  it('should skip invalid posts and extract links from facets', async () => {
    const validPostWithLinks = {
      post: {
        uri: 'at://did:plc:123',
        cid: 'bafyreif6nknxyiz4vogmctgg4ulvofykx52rdgfishob76y3yhx7wu4bye',
        indexedAt: '2023-04-15T10:01:00Z',
        author: {
          did: 'did:plc:888',
          handle: 'testacme.com',
        },
        record: {
          text: 'Post with links',
          createdAt: '2023-04-15T10:00:00Z',
          facets: [
            {
              features: [
                {
                  $type: 'app.bsky.richtext.facet#link',
                  uri: 'https://example.com',
                },
                { $type: 'some.other.type' },
              ],
            },
            {
              features: [
                {
                  $type: 'app.bsky.richtext.facet#link',
                  uri: 'https://another-example.com',
                },
              ],
            },
          ],
        },
      },
    };

    const invalidPost = {
      post: { record: { text: 'Invalid post' } },
    };

    const validPost = createMockPost({
      uri: 'at://did:plc:456',
      cid: 'bafyreif6nknxyiz4vogmctgg4ulvofykx52rdgfishob76y3yhx7wu4bye',
      author: {
        did: 'did:plc:777',
        handle: 'testacme.com',
      },
      text: 'Valid post',
      createdAt: '2023-04-15T10:00:00Z',
      indexedAt: '2023-04-15T10:01:00Z',
    });

    mockBluesky.getAuthorFeed.mockResolvedValueOnce({
      data: {
        feed: [validPostWithLinks, invalidPost, validPost],
        cursor: null,
      },
    });

    const generator = retrieveAuthorFeed({
      bluesky: mockBluesky,
      actor: ACTOR,
      targetDate: TARGET_DATE,
    });

    const result1 = await generator.next();
    const result2 = await generator.next();
    const result3 = await generator.next();

    expect(result1.value?.uri).toBe('at://did:plc:123');
    expect(result1.value?.links).toEqual([
      'https://example.com',
      'https://another-example.com',
    ]);

    expect(result2.value?.uri).toBe('at://did:plc:456');
    expect(result3.done).toBe(true);
  });

  it('should respect custom batch size and timezone offset', async () => {
    const CUSTOM_BATCH_SIZE = 10;
    const CUSTOM_TIMEZONE_OFFSET = -300; // -5 hours in minutes

    const mockPost = createMockPost();

    mockBluesky.getAuthorFeed.mockResolvedValueOnce({
      data: { feed: [mockPost], cursor: null },
    });

    const generator = retrieveAuthorFeed({
      bluesky: mockBluesky,
      actor: ACTOR,
      targetDate: TARGET_DATE,
      batchSize: CUSTOM_BATCH_SIZE,
      timezoneOffset: CUSTOM_TIMEZONE_OFFSET,
    });

    await generator.next();

    expect(mockBluesky.getAuthorFeed).toHaveBeenCalledWith({
      actor: ACTOR,
      limit: CUSTOM_BATCH_SIZE,
      cursor: undefined,
    });
  });
});
