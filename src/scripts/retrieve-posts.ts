import { AtpAgent } from '@atproto/api';
import 'dotenv/config';
import { BskyTldr, Post } from '../lib/bsky-tldr';

const postsPerAuthor = await buildPostsPerAuthor({
  feedToFollow: 'brianfive.xyz',
  targetDate: '20250201',
});

console.debug(postsPerAuthor);

// Helper types and logic below

interface PostsPerAuthor {
  [author: string]: {
    handle: string;
    posts: Post[];
  };
}

/*
 * This function retrieves all posts for a given author's feed on a given date
 *   using `bsky-tldr` and `atproto` libraries.
 */
async function buildPostsPerAuthor({
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

  const postsPerAuthor: PostsPerAuthor = {};

  const follows = service.retrieveFollowsGenerator({ actor: feedToFollow });

  let followIndex = 0;
  for await (const follow of follows) {
    const posts = service.retrieveAuthorFeedGenerator({ actor: follow.did });

    console.log(
      `Retrieving posts for follow ${follow.handle} on ${targetDate}`
    );

    let postIndex = 0;
    let authorsDailyPosts: Post[] = [];

    for await (const post of posts) {
      const createAt = post.createdAt.slice(0, 10).replace(/-/g, '');
      if (createAt < targetDate) {
        break;
      }

      if (createAt == targetDate) {
        authorsDailyPosts.push(post);
      }

      postIndex++;
    }

    if (authorsDailyPosts.length > 0) {
      console.log(
        `Found ${authorsDailyPosts.length} posts for ${follow.handle}`
      );

      postsPerAuthor[follow.did] = {
        handle: follow.handle,
        posts: authorsDailyPosts,
      };
    }

    followIndex++;
  }

  return { follows: postsPerAuthor };
}
