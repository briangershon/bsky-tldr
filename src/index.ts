// Import types
import type { Follow, Post } from './lib/bsky-tldr';
import type {
  AuthorFeed,
  DailyPostsFromFollows,
  DailyPostsFromFollowsResponse,
} from './lib/getDailyPostsFromFollows';

// Import functions and classes
import {
  retrieveAuthorFeedGenerator,
  retrieveFollowsGenerator,
} from './lib/bsky-tldr';
import { getDailyPostsFromFollows } from './lib/getDailyPostsFromFollows';
import { uriToUrl } from './lib/uriToUrl';

// Types
export type {
  AuthorFeed,
  DailyPostsFromFollows,
  DailyPostsFromFollowsResponse,
  Follow,
  Post,
};

// Core functionality
export {
  getDailyPostsFromFollows,
  retrieveAuthorFeedGenerator,
  retrieveFollowsGenerator,
  uriToUrl,
};
