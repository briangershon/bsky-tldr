import { Agent, CredentialSession } from '@atproto/api';
import 'dotenv/config';
import {
  getDailyPostsFromFollows,
  Post,
  retrieveAuthorFeedGenerator,
  retrieveFollowsGenerator,
  uriToUrl,
} from '../index';
import { getYesterday, targetDateRange } from '../lib/target-date';

const SOURCE_ACTOR = 'brianfive.xyz';
const TARGET_DATE = getYesterday();
const TIMEZONE_OFFSET = -8;

const session = new CredentialSession(new URL('https://bsky.social'));

await session.login({
  identifier: process.env.BLUESKY_USERNAME!,
  password: process.env.BLUESKY_PASSWORD!,
});

const bluesky = new Agent(session);

const postsPerAuthorResponse = await getDailyPostsFromFollows({
  bluesky,
  sourceActor: SOURCE_ACTOR,
  targetDate: TARGET_DATE,
  timezoneOffset: TIMEZONE_OFFSET,
  retrieveFollows: retrieveFollowsGenerator,
  retrieveAuthorFeed: retrieveAuthorFeedGenerator,
});

const { startOfDay, endOfDay } = targetDateRange('20250201', -8);
console.log(
  `Retrieved posts for ${TARGET_DATE} for UTC${TIMEZONE_OFFSET}: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`
);

const allPosts: Post[] = [];
Object.values(postsPerAuthorResponse.follows).forEach((user) => {
  allPosts.push(...user.posts);
});

console.log(`\nAll ${allPosts.length} post URLs:`);
console.log(allPosts.map((post) => post.uri).map(uriToUrl));
