import { Agent, CredentialSession } from '@atproto/api';
import 'dotenv/config';
import { Post, retrieveAuthorFeed, retrieveFollows, uriToUrl } from '../index';
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

const allPosts: Post[] = [];

// Loop through all follows for SOURCE_ACTOR
for await (const follow of retrieveFollows({
  bluesky,
  actor: SOURCE_ACTOR,
})) {
  // Loop through all posts for a follow
  const posts: Post[] = [];
  for await (const post of retrieveAuthorFeed({
    bluesky,
    actor: follow.did,
    targetDate: TARGET_DATE,
    timezoneOffset: TIMEZONE_OFFSET,
  })) {
    posts.push(post);
  }

  if (posts.length > 0) {
    console.log(
      `${TARGET_DATE} ${TIMEZONE_OFFSET} | ${SOURCE_ACTOR} | ${posts.length
        .toString()
        .padStart(3, ' ')} posts | ${follow.handle}`
    );
  }

  allPosts.push(...posts);
}

const { startOfDay, endOfDay } = targetDateRange('20250201', -8);
console.log(
  `Retrieved posts for ${TARGET_DATE} for UTC${TIMEZONE_OFFSET}: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`
);

console.log(`\nAll ${allPosts.length} post URLs:`);
console.log(allPosts.map((post) => post.uri).map(uriToUrl));
