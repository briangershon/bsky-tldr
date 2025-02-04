# bsky-tldr

Bluesky feed overload? Too long, didn't read?

Skim a daily list of posts from people you follow, or use AI/LLMs to summarize them into text you can scan or feed to an agent.

## Installation

```bash
npm install bsky-tldr
```

## Example

For example, if `mattpocock.com` is one of your follows, and you want to browse or summarize their posts from January 31, 2025, you can use this library to retrieve the posts in a simple way.

Here's an example of a data structure you could build for viewing a user's posts. The user had two posts on January 31, 2025:

```json
{
  "did:plc:oeio7zuhrsvmlyhia7e44nk6": {
    "handle": "mattpocock.com",
    "posts": [
      {
        "uri": "at://did:plc:oeio7zuhrsvmlyhia7e44nk6/app.bsky.feed.post/3lgzvm46vhu2c",
        "content": "TIL about process.exitCode = 1;\n\nUseful if you want to mark a process as failed without immediately exiting it",
        "createdAt": "2025-01-31T11:32:00.769Z",
        "isRepost": false
      },
      {
        "uri": "at://did:plc:oeio7zuhrsvmlyhia7e44nk6/app.bsky.feed.post/3lh2c4nddwr2s",
        "content": "Is there a decent chunking algorithm library on NPM?\n\nI know Langchain and LlamaIndex have some, but figured there were probably some unbundled from frameworks.\n\nChunking: chunking text documents to be fed into a RAG system.",
        "createdAt": "2025-01-31T15:16:00.525Z",
        "isRepost": false
      }
    ]
  }
}
```

The author's `did` and `handle` are provided, along with posts that include `uri`, `content`, `createdAt`, and `isRepost`.

If you need more information, use `@atproto/api` library directly to retrieve the author's profile using their `did`, or the full post and replies via its `uri`.

## Run example

Create a new App password in Bluesky, and provide your `BLUESKY_USERNAME` and `BLUESKY_PASSWORD` in an `.env` file in your root directory. You can create these via `Bluesky account settings > Privacy & Security > App passwords`.

```bash
BLUESKY_USERNAME=
BLUESKY_PASSWORD=
```

Run the script via:

```bash
npm install
npm run retrievePosts
```

See `./src/scripts/retrieve-posts.ts` for the code.

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

After merging latest code to `main` branch, run the following commands:

```bash
npm version patch  # or minor/major
git push --follow-tags
```

Create a GitHub release.
