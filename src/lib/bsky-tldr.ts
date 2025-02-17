import { AtpAgent } from '@atproto/api';
import {
  isReasonRepost,
  validateFeedViewPost,
} from '@atproto/api/dist/client/types/app/bsky/feed/defs';

export interface Follow {
  did: string;
  handle: string;
}

export interface Post {
  uri: string;
  content: string;
  createdAt: string;
  isRepost: boolean;
}

export class BskyTldr {
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
        const response = await this.bluesky.getFollows({
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

        for (const feedViewPost of data.feed) {
          if (!validateFeedViewPost(feedViewPost)) {
            console.info('Invalid feed view post:', feedViewPost);
            continue;
          }

          const postView = feedViewPost.post;
          yield {
            uri: postView.uri,
            content: (postView.record.text as string) || '',
            createdAt: (postView.record.createdAt as string) || '',
            isRepost: isReasonRepost(feedViewPost.reason),
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
