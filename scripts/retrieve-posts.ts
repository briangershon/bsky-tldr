import { AtpAgent } from '@atproto/api';
import 'dotenv/config';
import { BlueskyService } from '../src/lib/bluesky-generators';

async function main() {
  const bluesky = new AtpAgent({
    service: 'https://bsky.social',
  });

  await bluesky.login({
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  });

  const service = new BlueskyService(bluesky);

  const authorDid = 'brianfive.xyz';

  const follows = service.retrieveFollowsGenerator({ actor: authorDid });

  let followIndex = 0;
  for await (const follow of follows) {
    console.log('follow', followIndex, follow);
    followIndex++;
  }

  const posts = service.retrieveAuthorFeedGenerator({ actor: authorDid });

  let postIndex = 0;
  for await (const post of posts) {
    console.log('post', postIndex, post);
    postIndex++;
  }
}

main();
