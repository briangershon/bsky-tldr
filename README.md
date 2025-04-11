# bsky-tldr

Bluesky feed overload? Too long, didn't read?

Skim a daily list of posts from people you follow, or use AI/LLMs to summarize them into text you can scan or feed to an agent.

Example usage:

- See the [Run Example Script](#run-example-script) section below for a demo of integration with this library.

- <https://github.com/briangershon/bluesky-daily-mcp> is an application using this package.

## Installation in your application

```bash
npm install @atproto/api
npm install bsky-tldr
```

## API

Exports from the library:

`getDailyPostsFromFollows` is the main function to retrieve daily posts from follows. See Data Structure Example below.

There are also utility functions that wrap the AtProto pagination with JavaScript generators:

- `retrieveAuthorFeedGenerator()` is a generator function to retrieve posts from an author and
- `retrieveFollowsGenerator` is a generator function to retrieve follows from an author.

And if you want to convert post `uri` to a public URL:

- `uriToUrl` is a utility function to convert a post uri to a public url to view post on the web.

## Data Structure Example

Here's the data structure built with our `getDailyPostsFromFollows` library function for viewing posts from your follows. If you're only following 1 user, and they had two posts on January 31, 2025:

```json
{
  "follows": {
    "did:plc:oeio7zuhrsvmlyhia7e44nk6": {
      "handle": "mattpocock.com",
      "posts": [
        {
          "uri": "at://did:plc:oeio7zuhrsvmlyhia7e44nk6/app.bsky.feed.post/3lgzvm46vhu2c",
          "content": "TIL about process.exitCode = 1;\n\nUseful if you want to mark a process as failed without immediately exiting it",
          "createdAt": "2025-01-31T11:32:00.769Z",
          "isRepost": false,
          "links": []
        },
        {
          "uri": "at://did:plc:oeio7zuhrsvmlyhia7e44nk6/app.bsky.feed.post/3lh2c4nddwr2s",
          "content": "Is there a decent chunking algorithm library on NPM?\n\nI know Langchain and LlamaIndex have some, but figured there were probably some unbundled from frameworks.\n\nChunking: chunking text documents to be fed into a RAG system.",
          "createdAt": "2025-01-31T15:16:00.525Z",
          "isRepost": false,
          "links": []
        }
      ]
    }
  }
}
```

The author's `did` and `handle` are provided, along with posts that include `uri`, `content`, `createdAt`, `isRepost` (`false` means it's an original by the author) and `links` which are the full links mentioned in the post.

If you need more information in your app, use `@atproto/api` library directly to retrieve the author's profile using their `did`, or the full post and replies via its `uri`.

## Run Example Script

1. Create a new App password in Bluesky, and provide your `BLUESKY_USERNAME` and `BLUESKY_PASSWORD` in an `.env` file in your root directory. You can create these via `Bluesky account settings > Privacy & Security > App passwords`.

```bash
BLUESKY_USERNAME=
BLUESKY_PASSWORD=
```

2. Update script:

First change `sourceActor` and `targetDate` in `./src/scripts/retrieve-posts.ts` to your Bluesky handle or `did`, and a date in `yyyymmdd` format.

```javascript
const postsPerAuthorResponse = await buildDailyPostsFromFollows({
  sourceActor: 'brianfive.xyz', // or 'did:plc:3cgdoyodzdnhugjjrazljkzq'
  targetDate: '20250201',
});
```

3. Run the script:

```bash
npm install
npm run retrievePosts
```

## Help for Contributors

### Local Development with watch mode

```bash
npm install
npm run dev
```

### Run tests or coverage reports

```bash
npm test
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
