import { BskyTldr, type Follow, type Post } from './lib/bsky-tldr';
import {
  getDailyPostsFromFollows,
  type AuthorFeed,
  type DailyPostsFromFollows,
  type DailyPostsFromFollowsResponse,
} from './lib/getDailyPostsFromFollows';

export {
  BskyTldr,
  getDailyPostsFromFollows,
  type AuthorFeed,
  type DailyPostsFromFollows,
  type DailyPostsFromFollowsResponse,
  type Follow,
  type Post,
};

export default {
  BskyTldr,
  getDailyPostsFromFollows,
};
