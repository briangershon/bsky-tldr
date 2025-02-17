import { describe, expect, it } from 'vitest';
import { uriToUrl } from '../lib/uriToUrl';

describe('uriToUrl utility function', () => {
  it('should calculate correct url from uri', async () => {
    const uri = 'at://did:plc:123/app.bsky.feed.post/456';
    expect(uriToUrl(uri)).toBe('https://bsky.app/profile/did:plc:123/post/456');
  });
});
