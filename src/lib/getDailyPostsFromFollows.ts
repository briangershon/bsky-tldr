import { Agent } from '@atproto/api';
import { Follow, Post } from './bsky-tldr';
import { earlierThenTargetDate, withinTargetDate } from './target-date';

export interface AuthorFeed {
  handle: string;
  posts: Post[];
}

export interface DailyPostsFromFollows {
  [author: string]: AuthorFeed;
}

export interface DailyPostsFromFollowsResponse {
  follows: DailyPostsFromFollows;
}

/**
 * Return the daily posts for each of your follows.
 * For example, if you follow 3 people, this will return all posts from those 3 people on a given date.
 * @param sourceActor this is the starting point for finding follows, a Bluesky actor name or DID.
 * @param targetDate is a date in the format 'YYYYMMDD'
 * @param retrieveFollows is an async generator function that retrieves all follows for a given author
 * @param retrieveAuthorFeed is an async generator function that retrieves all posts for a given author's feed on a given date
 * @returns DailyPostsFromFollowsResponse
 */
export async function getDailyPostsFromFollows({
  bluesky,
  sourceActor,
  targetDate,
  timezoneOffset = 0,
  retrieveFollows,
  retrieveAuthorFeed,
}: {
  bluesky: Agent;
  sourceActor: string;
  targetDate: string;
  timezoneOffset?: number;
  retrieveFollows: ({
    bluesky,
    actor,
    batchSize,
  }: {
    bluesky: Agent;
    actor: string;
    batchSize?: number;
  }) => AsyncGenerator<Follow, void, undefined>;
  retrieveAuthorFeed: ({
    bluesky,
    actor,
    batchSize,
  }: {
    bluesky: Agent;
    actor: string;
    batchSize?: number;
  }) => AsyncGenerator<Post, void, undefined>;
}): Promise<DailyPostsFromFollowsResponse> {
  const follows: DailyPostsFromFollows = {};

  // Retrieve all follows
  for await (const follow of retrieveFollows({ bluesky, actor: sourceActor })) {
    follows[follow.did] = {
      handle: follow.handle,
      posts: [],
    };
  }

  // Retrieve and process posts for each follow
  for (const [did, followData] of Object.entries(follows)) {
    const posts: Post[] = [];

    // Collect posts for the author
    for await (const post of retrieveAuthorFeed({ bluesky, actor: did })) {
      const postTime = new Date(post.createdAt);

      // If post is from before target date, we can stop processing posts for this author
      if (earlierThenTargetDate(postTime, targetDate, timezoneOffset)) {
        break;
      }

      // Only include posts from target date (between start and end of day)
      if (withinTargetDate(postTime, targetDate, timezoneOffset)) {
        posts.push(post);
      }
    }

    // Sort posts by creation time (earliest to latest)
    followData.posts = posts.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  return { follows };
}
