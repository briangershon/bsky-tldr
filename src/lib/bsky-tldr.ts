import { Agent } from '@atproto/api';
import {
  isReasonRepost,
  validateFeedViewPost,
} from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import {
  isLink,
  Main,
} from '@atproto/api/dist/client/types/app/bsky/richtext/facet';
import { earlierThenTargetDate, withinTargetDate } from './target-date';

export interface Follow {
  did: string;
  handle: string;
}

export interface Post {
  uri: string;
  content: string;
  createdAt: string;
  isRepost: boolean;
  links: string[];
}

export async function* retrieveFollowsGenerator({
  bluesky,
  actor,
  batchSize = 50,
}: {
  bluesky: Agent;
  actor: string;
  batchSize?: number;
}): AsyncGenerator<Follow, void, undefined> {
  if (!bluesky) {
    throw new Error('Bluesky client not initialized');
  }

  let cursor: string | undefined = undefined;

  try {
    do {
      const response = await bluesky.getFollows({
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

export async function* retrieveAuthorFeedGenerator({
  bluesky,
  actor,
  batchSize = 5,
  targetDate,
  timezoneOffset = 0,
}: {
  bluesky: Agent;
  actor: string;
  batchSize?: number;
  targetDate: string;
  timezoneOffset?: number;
}): AsyncGenerator<Post, void, undefined> {
  if (!bluesky) {
    throw new Error('Bluesky client not initialized');
  }

  let cursor: string | undefined = undefined;
  let count = 0;

  try {
    do {
      const { data } = await bluesky.getAuthorFeed({
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
        const record = postView.record;

        const postTime = new Date(record.createdAt as string);

        // If post is from before target date, we can stop processing posts for this author
        if (earlierThenTargetDate(postTime, targetDate, timezoneOffset)) {
          return;
        }

        // Only include posts from target date (between start and end of day)
        if (withinTargetDate(postTime, targetDate, timezoneOffset)) {
          const facets = record.facets as Main[];
          const links = extractLinks(facets);

          yield {
            uri: postView.uri,
            content: (record.text as string) || '',
            createdAt: (record.createdAt as string) || '',
            isRepost: isReasonRepost(feedViewPost.reason),
            links,
          };
          count++;
        }
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

/**
 * Retrieve list of links from a post's facets.
 * @param facets
 * @returns
 */
export function extractLinks(facets: Main[] | undefined): string[] {
  if (!facets) {
    return [];
  }
  return facets
    .flatMap((facet) => facet.features)
    .filter((feature) => isLink(feature))
    .map((feature) => feature.uri);
}
