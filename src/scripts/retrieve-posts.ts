import { AtpAgent } from '@atproto/api';
import 'dotenv/config';
import {
  retrieveAuthorFeedGenerator,
  retrieveFollowsGenerator,
  DailyPostsFromFollowsResponse,
  getDailyPostsFromFollows,
  Post,
  uriToUrl,
} from '../index';

/*
 * This function retrieves all posts for a given author's feed on a given date
 *   using `bsky-tldr` and `atproto` libraries.
 */
async function buildDailyPostsFromFollows({
  sourceActor,
  targetDate,
}: {
  sourceActor: string;
  targetDate: string;
}): Promise<DailyPostsFromFollowsResponse> {
  const bluesky = new AtpAgent({
    service: 'https://bsky.social',
  });

  await bluesky.login({
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  });

  return getDailyPostsFromFollows({
    bluesky,
    sourceActor,
    targetDate,
    retrieveFollows: retrieveFollowsGenerator,
    retrieveAuthorFeed: retrieveAuthorFeedGenerator,
  });
}

const postsPerAuthorResponse = await buildDailyPostsFromFollows({
  sourceActor: 'brianfive.xyz',
  targetDate: '20250201',
});

console.debug(postsPerAuthorResponse);

const allPosts: Post[] = [];

// Loop through each user in the follows object
Object.values(postsPerAuthorResponse.follows).forEach((user) => {
  allPosts.push(...user.posts);
});

// demonstrate the uriToUrl function
console.log(`All ${allPosts.length} post URLs:`);
console.log(allPosts.map((post) => post.uri).map(uriToUrl));
