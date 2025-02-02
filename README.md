# bsky-tldr

A JavaScript package for creating daily summary of Bluesky posts for those you follow.

Features:

- TypeScript definitions
- prettier for code formatting
- vitest for testing and code coverage (and GitHub Action)

## Run locally

```bash
npm install
npm run watch
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
