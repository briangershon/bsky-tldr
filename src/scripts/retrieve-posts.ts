import { Agent, CredentialSession } from '@atproto/api';
import 'dotenv/config';
import {
  DailyPostsFromFollowsResponse,
  getDailyPostsFromFollows,
  Post,
  retrieveAuthorFeedGenerator,
  retrieveFollowsGenerator,
  uriToUrl,
} from '../index';
import { targetDateRange } from '../lib/target-date';

/*
 * This function retrieves all posts for a given author's feed on a given date
 *   using `bsky-tldr` and `atproto` libraries.
 */
async function buildDailyPostsFromFollows({
  sourceActor,
  targetDate,
  timezoneOffset,
}: {
  sourceActor: string;
  targetDate: string;
  timezoneOffset?: number;
}): Promise<DailyPostsFromFollowsResponse> {
  const session = new CredentialSession(new URL('https://bsky.social'));

  await session.login({
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  });

  const bluesky = new Agent(session);

  return getDailyPostsFromFollows({
    bluesky,
    sourceActor,
    targetDate,
    timezoneOffset,
    retrieveFollows: retrieveFollowsGenerator,
    retrieveAuthorFeed: retrieveAuthorFeedGenerator,
  });
}

const postsPerAuthorResponse = await buildDailyPostsFromFollows({
  sourceActor: 'brianfive.xyz',
  targetDate: '20250201',
  timezoneOffset: -8, // posts for 2025-02-01, UTC-8, between 2025-02-01T08:00:00.000Z to 2025-02-02T07:59:59.999Z
});

console.log(JSON.stringify(postsPerAuthorResponse, null, 2));
const { startOfDay, endOfDay } = targetDateRange('20250201', -8);
console.log(
  `Retrieved posts for 20250201 for UTC-8: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`
);

const allPosts: Post[] = [];

// Loop through each user in the follows object
Object.values(postsPerAuthorResponse.follows).forEach((user) => {
  allPosts.push(...user.posts);
});

// demonstrate the uriToUrl function
console.log(`\nAll ${allPosts.length} post URLs:`);
console.log(allPosts.map((post) => post.uri).map(uriToUrl));
