import { AtpAgent } from '@atproto/api';
import 'dotenv/config';
import { BskyTldr } from '../lib/bsky-tldr';

async function main({
  feedToFollow,
  targetDate,
}: {
  feedToFollow: string;
  targetDate: string;
}) {
  const bluesky = new AtpAgent({
    service: 'https://bsky.social',
  });

  await bluesky.login({
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  });

  const service = new BskyTldr(bluesky);

  const follows = service.retrieveFollowsGenerator({ actor: feedToFollow });

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

await main({ feedToFollow: 'brianfive.xyz', targetDate: '20250201' });
