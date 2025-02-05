import { AtpAgent } from '@atproto/api';
import 'dotenv/config';
import {
  BskyTldr,
  getDailyPostsFromFollows,
  DailyPostsFromFollowsResponse,
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

  const tldr = new BskyTldr(bluesky);

  return getDailyPostsFromFollows({
    sourceActor,
    targetDate,
    retrieveFollows: tldr.retrieveFollowsGenerator.bind(tldr),
    retrieveAuthorFeed: tldr.retrieveAuthorFeedGenerator.bind(tldr),
  });
}

const postsPerAuthorResponse = await buildDailyPostsFromFollows({
  sourceActor: 'brianfive.xyz',
  targetDate: '20250201',
});

console.debug(postsPerAuthorResponse);
