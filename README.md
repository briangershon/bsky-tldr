# bsky-tldr

A JavaScript package for creating daily summary of Bluesky posts for those you follow.

Features:

- TypeScript definitions
- prettier for code formatting
- vitest for testing and code coverage (and GitHub Action)

## Example usage

Create an `.env` file in the root directory with the following content:

```bash
BLUESKY_USERNAME=
BLUESKY_PASSWORD=
```

Run the example with following commands:

```bash
npm install
npm run retrievePosts
```

See `./src/scripts/retrieve-posts.ts` for the code that runs.

## Developing locally

```bash
npm install
npm run dev
```

## Run tests or coverage reports

```bash
npm test
npm run coverage
```

## How to use this package locally with another project

```bash
# In your package directory
npm link

# In your test project directory
npm link your-package-name
```
