import { AtpAgent } from '@atproto/api';
import 'dotenv/config';
import { BskyTldr } from '../lib/bsky-tldr';

async function main() {
  const bluesky = new AtpAgent({
    service: 'https://bsky.social',
  });

  await bluesky.login({
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  });

  const service = new BskyTldr(bluesky);

  const authorDid = 'brianfive.xyz';
  const targetDate = '20250201';
  // const authorDid = 'nodejs.org';
  // const targetDate = '20250121';

  const follows = service.retrieveFollowsGenerator({ actor: authorDid });

  let followIndex = 0;
  for await (const follow of follows) {
    const posts = service.retrieveAuthorFeedGenerator({ actor: follow.did });

    console.log(`Retrieving posts for follow ${follow.handle}`);

    let postIndex = 0;

    for await (const post of posts) {
      const createAt = post.createdAt.slice(0, 10).replace(/-/g, '');
      if (createAt < targetDate) {
        console.log('\n---\n');
        break;
      }

      if (createAt == targetDate) {
        console.log(
          'post',
          postIndex,
          post.createdAt,
          post.content.slice(0, 25)
        );
      }

      postIndex++;
    }

    followIndex++;
  }
}

main();
