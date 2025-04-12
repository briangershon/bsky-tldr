import { Agent, CredentialSession } from '@atproto/api';
import 'dotenv/config';
import {
  DailyPostsFromFollows,
  Post,
  retrieveAuthorFeedGenerator,
  retrieveFollowsGenerator,
  uriToUrl,
} from '../index';
import {
  earlierThenTargetDate,
  getYesterday,
  targetDateRange,
  withinTargetDate,
} from '../lib/target-date';

const SOURCE_ACTOR = 'brianfive.xyz';
const TARGET_DATE = getYesterday();
const TIMEZONE_OFFSET = -8;

const session = new CredentialSession(new URL('https://bsky.social'));

await session.login({
  identifier: process.env.BLUESKY_USERNAME!,
  password: process.env.BLUESKY_PASSWORD!,
});

const bluesky = new Agent(session);

const follows: DailyPostsFromFollows = {};

// Retrieve all follows
for await (const follow of retrieveFollowsGenerator({
  bluesky,
  actor: SOURCE_ACTOR,
})) {
  follows[follow.did] = {
    handle: follow.handle,
    posts: [],
  };
}

console.log(`Found ${Object.keys(follows).length} follows`);

// Retrieve and process posts for each follow
for (const [did, followData] of Object.entries(follows)) {
  const posts: Post[] = [];

  // Collect posts for the author
  let authorCount = 0;
  for await (const post of retrieveAuthorFeedGenerator({
    bluesky,
    actor: did,
  })) {
    const postTime = new Date(post.createdAt);

    // If post is from before target date, we can stop processing posts for this author
    if (earlierThenTargetDate(postTime, TARGET_DATE, TIMEZONE_OFFSET)) {
      break;
    }

    // Only include posts from target date (between start and end of day)
    if (withinTargetDate(postTime, TARGET_DATE, TIMEZONE_OFFSET)) {
      authorCount++;
      posts.push(post);
    }
  }

  if (authorCount > 0) {
    console.log(
      `${TARGET_DATE} ${TIMEZONE_OFFSET} | ${SOURCE_ACTOR} | ${authorCount
        .toString()
        .padStart(3, ' ')} posts | ${followData.handle}`
    );
  }

  // Sort posts by creation time (earliest to latest)
  followData.posts = posts.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

const { startOfDay, endOfDay } = targetDateRange('20250201', -8);
console.log(
  `Retrieved posts for ${TARGET_DATE} for UTC${TIMEZONE_OFFSET}: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`
);

const allPosts: Post[] = [];
Object.values(follows).forEach((user) => {
  allPosts.push(...user.posts);
});

console.log(`\nAll ${allPosts.length} post URLs:`);
console.log(allPosts.map((post) => post.uri).map(uriToUrl));
