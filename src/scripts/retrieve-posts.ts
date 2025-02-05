import { AtpAgent } from '@atproto/api';
import 'dotenv/config';
import {
  BskyTldr,
  dailyPostsPerAuthor,
  DailyPostsPerAuthorResponse,
} from '../index';

/*
 * This function retrieves all posts for a given author's feed on a given date
 *   using `bsky-tldr` and `atproto` libraries.
 */
async function buildDailyPostsPerAuthor({
  feedToFollow,
  targetDate,
}: {
  feedToFollow: string;
  targetDate: string;
}): Promise<DailyPostsPerAuthorResponse> {
  const bluesky = new AtpAgent({
    service: 'https://bsky.social',
  });

  await bluesky.login({
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  });

  const service = new BskyTldr(bluesky);

  return dailyPostsPerAuthor({
    feedToFollow,
    targetDate,
    retrieveFollows: service.retrieveFollowsGenerator.bind(service),
    retrieveAuthorFeed: service.retrieveAuthorFeedGenerator.bind(service),
  });
}

const postsPerAuthorResponse = await buildDailyPostsPerAuthor({
  feedToFollow: 'brianfive.xyz',
  targetDate: '20250201',
});

console.debug(postsPerAuthorResponse);
