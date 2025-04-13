# bsky-tldr

Retrieve your daily Bluesky feed as simplified JSON, perfect for building feed readers or AI-powered summarization tools.

For example [Building an MCP Server to Explore My Bluesky Feed](https://www.briangershon.com/blog/bluesky-daily-mcp-server/) with code available at <https://github.com/briangershon/bluesky-daily-mcp>.

## Features

- Posts are retrieved for a specific day, with ability to specify the timezone offset.
- Posts from Bluesky feed are in a simplified JSON format.
- API:
  - `retrieveFollows()` retrieves follows from an author.
  - `retrieveAuthorFeed()` retrieves posts from an author, for a specific day.
  - `uriToUrl` converts a post uri to a public url to view post on the web.

Information returned for each post:

```json
{
  "uri": "at://did:plc:oeio7zuhrsvmlyhia7e44nk6/app.bsky.feed.post/3lgzvm46vhu2c",
  "content": "TIL about process.exitCode = 1;\n\nUseful if you want to mark a process as failed without immediately exiting it",
  "createdAt": "2025-01-31T11:32:00.769Z",
  "isRepost": false,
  "links": ["https://example.com"]
}
```

## How to integrate into your own project

Walk through the working code that retrieves posts for follows in `./scripts/retrieve-posts.ts`.

How to run it:

1. Create a new App password in Bluesky, and provide your `BLUESKY_USERNAME` and `BLUESKY_PASSWORD` in an `.env` file in your root directory. You can create these via `Bluesky account settings > Privacy & Security > App passwords`.

```bash
BLUESKY_USERNAME=
BLUESKY_PASSWORD=
```

2. Update script

Change `SOURCE_ACTOR`, `TARGET_DATE` and `TIMEZONE_OFFSET` in `./src/scripts/retrieve-posts.ts` to your Bluesky handle or `did`, a date in `yyyymmdd` format and a timezone offset in hours (e.g. `-8` for PST).

3. Run the script

```bash
npm install
npm run retrievePosts
```

## How to integrate into your own project

```bash
npm install @atproto/api
npm install bsky-tldr
```

Grab sample code from `./scripts/retrieve-posts.ts`.

## Data Structure

Here's the post data structure returned from our `retrieveAuthorFeed` function for viewing posts for a specific author:

```json
{
  "uri": "at://did:plc:oeio7zuhrsvmlyhia7e44nk6/app.bsky.feed.post/3lgzvm46vhu2c",
  "content": "TIL about process.exitCode = 1;\n\nUseful if you want to mark a process as failed without immediately exiting it",
  "createdAt": "2025-01-31T11:32:00.769Z",
  "isRepost": false,
  "links": []
}
```

Posts that include `uri`, `content`, `createdAt`, `isRepost` (`false` means it's an original by the author) and `links` which are the full links mentioned in the post.

If you need more information in your app, use `@atproto/api` library directly to retrieve the author's profile using their `did`, or the full post and replies via its `uri`.

## Help for Contributors to this project

### Local Development with watch mode

```bash
npm install
npm run dev
```

### Run tests or coverage reports

```bash
npm run test:watch
npm run coverage
```

### Testing package in another project

If you want to make changes to this package while testing it with another project:

```bash
# In your package directory
npm link

# In your test project directory
npm link your-package-name
```

### Steps for publishing package to NPM

After merging latest code to `main` branch:

1. Locally, `git checkout main && git pull`
2. `npm version patch` # or minor, or major
3. `git push --follow-tags`
4. A GitHub release is automatically written and published
