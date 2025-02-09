/**
 * Convert AT URI to Bluesky app URL.
 * Initially from: https://github.com/bluesky-social/atproto/discussions/2523#discussioncomment-12096639
 */
export function uriToUrl(atUri: string): string | undefined {
  const regex = /^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/;
  const match = atUri.match(regex);

  if (!match) {
    return undefined; // Invalid AT URI format
  }

  const did = match[1];
  const collection = match[2];
  const rkey = match[3];

  if (collection === 'app.bsky.feed.post') {
    return `https://bsky.app/profile/${did}/post/${rkey}`;
  } else {
    return undefined; // Not a post record
  }
}
