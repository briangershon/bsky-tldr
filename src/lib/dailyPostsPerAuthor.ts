import { Follow, Post } from './bsky-tldr';

export interface DailyPostsPerAuthor {
  [author: string]: {
    handle: string;
    posts: Post[];
  };
}

export interface DailyPostsPerAuthorResponse {
  follows: DailyPostsPerAuthor;
}

/**
 * Daily posts per author.
 * @param feedToFollow is a Bluesky DID
 * @param targetDate is a date in the format 'YYYYMMDD'
 * @param retrieveFollows is a function that retrieves all follows for a given author
 * @param retrieveAuthorFeed is a function that retrieves all posts for a given author's feed on a given date
 * @returns DailyPostsPerAuthorResponse
 */
export async function dailyPostsPerAuthor({
  feedToFollow,
  targetDate,
  retrieveFollows,
  retrieveAuthorFeed,
}: {
  feedToFollow: string;
  targetDate: string;
  retrieveFollows: ({
    actor,
    batchSize,
  }: {
    actor: string;
    batchSize?: number;
  }) => AsyncGenerator<Follow, void, undefined>;
  retrieveAuthorFeed: ({
    actor,
    batchSize,
  }: {
    actor: string;
    batchSize?: number;
  }) => AsyncGenerator<Post, void, undefined>;
}): Promise<DailyPostsPerAuthorResponse> {
  const follows: DailyPostsPerAuthor = {};

  // Convert targetDate to start and end of day in ISO format
  const year = targetDate.slice(0, 4);
  const month = targetDate.slice(4, 6);
  const day = targetDate.slice(6, 8);
  const startOfDay = new Date(`${year}-${month}-${day}T00:00:00Z`).getTime();
  const endOfDay = new Date(`${year}-${month}-${day}T23:59:59.999Z`).getTime();

  // Retrieve all follows
  for await (const follow of retrieveFollows({ actor: feedToFollow })) {
    follows[follow.did] = {
      handle: follow.handle,
      posts: [],
    };
  }

  // Retrieve and process posts for each follow
  for (const [did, followData] of Object.entries(follows)) {
    const posts: Post[] = [];

    // Collect posts for the author
    for await (const post of retrieveAuthorFeed({ actor: did })) {
      const postTime = new Date(post.createdAt).getTime();

      // If post is from before target date, we can stop processing
      if (postTime < startOfDay) {
        break;
      }

      // Only include posts from target date (between start and end of day)
      if (postTime >= startOfDay && postTime <= endOfDay) {
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
