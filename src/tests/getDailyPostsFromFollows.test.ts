import { describe, expect, it, vi } from 'vitest';
import type { Follow, Post } from '../lib/bsky-tldr';
import { getDailyPostsFromFollows } from '../lib/getDailyPostsFromFollows';

describe('getDailyPostsFromFollows', () => {
  const mockFollow: Follow = {
    did: 'did:plc:1234',
    handle: 'test.bsky.app',
  };

  const mockPost: Post = {
    uri: 'at://did:plc:1234/app.bsky.feed.post/1234',
    content: 'Test post',
    createdAt: '2024-02-04T12:00:00Z',
    isRepost: false,
  };

  // Helper function to create async generator
  async function* createAsyncGenerator<T>(
    items: T[]
  ): AsyncGenerator<T, void, undefined> {
    for (const item of items) {
      yield item;
    }
  }

  it('should return empty follows object when no follows exist', async () => {
    const mockRetrieveFollows = vi.fn(() => createAsyncGenerator<Follow>([]));
    const mockRetrieveAuthorFeed = vi.fn(() => createAsyncGenerator<Post>([]));

    const result = await getDailyPostsFromFollows({
      sourceActor: 'did:plc:test',
      targetDate: '20240204',
      retrieveFollows: mockRetrieveFollows,
      retrieveAuthorFeed: mockRetrieveAuthorFeed,
    });

    expect(result).toEqual({ follows: {} });
    expect(mockRetrieveFollows).toHaveBeenCalledWith({ actor: 'did:plc:test' });
  });

  it('should return follows with empty posts when no posts exist', async () => {
    const mockRetrieveFollows = vi.fn(() =>
      createAsyncGenerator<Follow>([mockFollow])
    );
    const mockRetrieveAuthorFeed = vi.fn(() => createAsyncGenerator<Post>([]));

    const result = await getDailyPostsFromFollows({
      sourceActor: 'did:plc:test',
      targetDate: '20240204',
      retrieveFollows: mockRetrieveFollows,
      retrieveAuthorFeed: mockRetrieveAuthorFeed,
    });

    expect(result).toEqual({
      follows: {
        [mockFollow.did]: {
          handle: mockFollow.handle,
          posts: [],
        },
      },
    });
    expect(mockRetrieveAuthorFeed).toHaveBeenCalledWith({
      actor: mockFollow.did,
    });
  });

  it('should return follows with posts for the target date', async () => {
    const mockRetrieveFollows = vi.fn(() =>
      createAsyncGenerator<Follow>([mockFollow])
    );
    const mockRetrieveAuthorFeed = vi.fn(() =>
      createAsyncGenerator<Post>([mockPost])
    );

    const result = await getDailyPostsFromFollows({
      sourceActor: 'did:plc:test',
      targetDate: '20240204',
      retrieveFollows: mockRetrieveFollows,
      retrieveAuthorFeed: mockRetrieveAuthorFeed,
    });

    expect(result).toEqual({
      follows: {
        [mockFollow.did]: {
          handle: mockFollow.handle,
          posts: [mockPost],
        },
      },
    });
  });

  it('should filter out posts from different dates', async () => {
    const differentDatePost: Post = {
      ...mockPost,
      createdAt: '2024-02-03T12:00:00Z', // Different date
    };

    const mockRetrieveFollows = vi.fn(() =>
      createAsyncGenerator<Follow>([mockFollow])
    );
    const mockRetrieveAuthorFeed = vi.fn(() =>
      createAsyncGenerator<Post>([mockPost, differentDatePost])
    );

    const result = await getDailyPostsFromFollows({
      sourceActor: 'did:plc:test',
      targetDate: '20240204',
      retrieveFollows: mockRetrieveFollows,
      retrieveAuthorFeed: mockRetrieveAuthorFeed,
    });

    expect(result.follows[mockFollow.did].posts).toHaveLength(1);
    expect(result.follows[mockFollow.did].posts[0]).toEqual(mockPost);
  });

  it('should handle multiple follows', async () => {
    const secondFollow: Follow = {
      did: 'did:plc:5678',
      handle: 'another.bsky.app',
    };

    const secondPost: Post = {
      ...mockPost,
      uri: 'at://did:plc:5678/app.bsky.feed.post/5678',
    };

    const mockRetrieveFollows = vi.fn(() =>
      createAsyncGenerator<Follow>([mockFollow, secondFollow])
    );
    const mockRetrieveAuthorFeed = vi.fn(({ actor }: { actor: string }) =>
      createAsyncGenerator<Post>(
        actor === mockFollow.did ? [mockPost] : [secondPost]
      )
    );

    const result = await getDailyPostsFromFollows({
      sourceActor: 'did:plc:test',
      targetDate: '20240204',
      retrieveFollows: mockRetrieveFollows,
      retrieveAuthorFeed: mockRetrieveAuthorFeed,
    });

    expect(Object.keys(result.follows)).toHaveLength(2);
    expect(result.follows[mockFollow.did].posts[0]).toEqual(mockPost);
    expect(result.follows[secondFollow.did].posts[0]).toEqual(secondPost);
  });

  it('should stop processing posts once it encounters posts older than target date', async () => {
    const targetDatePost: Post = {
      ...mockPost,
      uri: 'uri1',
      createdAt: '2024-02-04T14:00:00Z',
    };
    const olderPost: Post = {
      ...mockPost,
      uri: 'uri2',
      createdAt: '2024-02-02T23:59:59Z', // Two days earlier
    };
    const neverReachedPost: Post = {
      ...mockPost,
      uri: 'uri3',
      createdAt: '2024-02-01T22:00:00Z', // Three days earlier - should never be processed
    };

    let processedPosts = 0;
    const mockRetrieveFollows = vi.fn(() =>
      createAsyncGenerator<Follow>([mockFollow])
    );
    const mockRetrieveAuthorFeed = vi.fn(async function* () {
      // Simulate chronologically descending order (newest to oldest)
      processedPosts++;
      yield targetDatePost;
      processedPosts++;
      yield olderPost;
      processedPosts++;
      yield neverReachedPost; // This should never be reached
    });

    const result = await getDailyPostsFromFollows({
      sourceActor: 'did:plc:test',
      targetDate: '20240204',
      retrieveFollows: mockRetrieveFollows,
      retrieveAuthorFeed: mockRetrieveAuthorFeed,
    });

    // Should have stopped after processing the olderPost
    expect(processedPosts).toBe(2);

    // Should ONLY include posts from target date (Feb 4th)
    const posts = result.follows[mockFollow.did].posts;
    expect(posts).toHaveLength(1);
    expect(posts[0]).toEqual(targetDatePost);

    // Make sure older posts are not included
    expect(posts.some((post) => post.uri === olderPost.uri)).toBe(false);
    expect(posts.some((post) => post.uri === neverReachedPost.uri)).toBe(false);
  });

  it('should sort posts from earliest to latest', async () => {
    const laterPost: Post = {
      ...mockPost,
      createdAt: '2024-02-04T14:00:00Z', // 2 hours later
    };
    const earlierPost: Post = {
      ...mockPost,
      createdAt: '2024-02-04T10:00:00Z', // 2 hours earlier
    };

    // Feed posts in random order
    const mockRetrieveFollows = vi.fn(() =>
      createAsyncGenerator<Follow>([mockFollow])
    );
    const mockRetrieveAuthorFeed = vi.fn(() =>
      createAsyncGenerator<Post>([laterPost, mockPost, earlierPost])
    );

    const result = await getDailyPostsFromFollows({
      sourceActor: 'did:plc:test',
      targetDate: '20240204',
      retrieveFollows: mockRetrieveFollows,
      retrieveAuthorFeed: mockRetrieveAuthorFeed,
    });

    const posts = result.follows[mockFollow.did].posts;
    expect(posts).toHaveLength(3);
    expect(posts[0]).toEqual(earlierPost);
    expect(posts[1]).toEqual(mockPost);
    expect(posts[2]).toEqual(laterPost);

    // Verify timestamps are in ascending order
    const timestamps = posts.map((post) => new Date(post.createdAt).getTime());
    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
  });

  it('should handle errors from retrieveFollows', async () => {
    const mockRetrieveFollows = vi.fn(() => {
      throw new Error('Failed to retrieve follows');
    });
    const mockRetrieveAuthorFeed = vi.fn(() => createAsyncGenerator<Post>([]));

    await expect(
      getDailyPostsFromFollows({
        sourceActor: 'did:plc:test',
        targetDate: '20240204',
        retrieveFollows: mockRetrieveFollows,
        retrieveAuthorFeed: mockRetrieveAuthorFeed,
      })
    ).rejects.toThrow('Failed to retrieve follows');
  });

  it('should handle errors from retrieveAuthorFeed', async () => {
    const mockRetrieveFollows = vi.fn(() =>
      createAsyncGenerator<Follow>([mockFollow])
    );
    const mockRetrieveAuthorFeed = vi.fn(() => {
      throw new Error('Failed to retrieve author feed');
    });

    await expect(
      getDailyPostsFromFollows({
        sourceActor: 'did:plc:test',
        targetDate: '20240204',
        retrieveFollows: mockRetrieveFollows,
        retrieveAuthorFeed: mockRetrieveAuthorFeed,
      })
    ).rejects.toThrow('Failed to retrieve author feed');
  });
});
