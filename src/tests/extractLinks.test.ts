import { describe, expect, it } from 'vitest';
import { uriToUrl } from '../lib/uriToUrl';
import { extractLinks } from '../lib/bsky-tldr';
import { Main } from '@atproto/api/dist/client/types/app/bsky/richtext/facet';

describe('bsky-tldr: extractLinks()', () => {
  it('should have no links if undefined', async () => {
    const links = extractLinks(undefined);
    expect(links.length).toBe(0);
  });

  it('should have no links if there are facets, but not link ones', async () => {
    const facets = [
      {
        features: [
          {
            $type: 'app.bsky.richtext.facet#mention',
            did: 'did:plc:1234',
          },
        ],
      },
    ];
    const links = extractLinks([]);
    expect(links.length).toBe(0);
  });

  it('should have three links', async () => {
    const facets = [
      {
        features: [
          {
            $type: 'app.bsky.richtext.facet#link',
            uri: 'https://simonwillison.net/2025/Feb/6/sqlite-page-explorer/',
          },
        ],
      },
      {
        features: [
          {
            $type: 'app.bsky.richtext.facet#link',
            uri: 'https://simonwillison.net/2025/Feb/7/apsw-sqlite-query-explainer/',
          },
        ],
      },
      {
        features: [
          {
            $type: 'app.bsky.richtext.facet#link',
            uri: 'https://simonwillison.net/2025/Feb/7/sqlite-s3vfs/',
          },
        ],
      },
    ] as Main[];

    const links = extractLinks(facets);
    expect(links.length).toBe(3);

    expect(links[0]).toBe(
      'https://simonwillison.net/2025/Feb/6/sqlite-page-explorer/'
    );
    expect(links[1]).toBe(
      'https://simonwillison.net/2025/Feb/7/apsw-sqlite-query-explainer/'
    );
    expect(links[2]).toBe('https://simonwillison.net/2025/Feb/7/sqlite-s3vfs/');
  });
});
