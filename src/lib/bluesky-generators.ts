import { AtpAgent } from '@atproto/api';

export interface Follow {
  did: string;
  handle: string;
}

export interface Post {
  uri: string;
  content: string;
  createdAt: string;
}

export class BlueskyService {
  private bluesky: AtpAgent;

  constructor(agent: AtpAgent) {
    this.bluesky = agent;
  }

  async *retrieveFollowsGenerator({
    actor,
    batchSize = 50,
  }: {
    actor: string;
    batchSize?: number;
  }): AsyncGenerator<Follow, void, undefined> {
    if (!this.bluesky) {
      throw new Error('Bluesky client not initialized');
    }

    let cursor: string | undefined = undefined;

    try {
      do {
        const response = await this.bluesky.api.app.bsky.graph.getFollows({
          actor,
          limit: batchSize,
          cursor,
        });

        if (!response.success) {
          throw new Error('Failed to fetch follows');
        }

        for (const follow of response.data.follows) {
          yield {
            did: follow.did,
            handle: follow.handle,
          };
        }

        cursor = response.data.cursor;
      } while (cursor);
    } catch (error) {
      throw new Error(
        `Failed to retrieve follows: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async *retrieveAuthorFeedGenerator({
    actor,
    batchSize = 5,
  }: {
    actor: string;
    batchSize?: number;
  }): AsyncGenerator<Post, void, undefined> {
    if (!this.bluesky) {
      throw new Error('Bluesky client not initialized');
    }

    let cursor: string | undefined = undefined;
    let count = 0;

    try {
      do {
        const { data } = await this.bluesky.getAuthorFeed({
          actor,
          limit: batchSize,
          cursor,
        });

        for (const post of data.feed) {
          yield {
            uri: post.post.uri,
            content: post.post.record.text,
            createdAt: post.post.record.createdAt,
          };
          count++;
        }

        cursor = data.cursor;
      } while (cursor);
    } catch (error) {
      throw new Error(
        `Failed to retrieve author feed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
