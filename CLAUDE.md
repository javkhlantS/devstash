# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- `yarn dev` — start dev server (Turbopack)
- `yarn build` — production build
- `yarn start` — serve production build
- `yarn lint` — run ESLint
- `yarn test` — run unit tests (Vitest)
- `yarn test:watch` — run tests in watch mode
- `yarn test:coverage` — run tests with coverage report

**IMPORTANT:** Do not add Claude to any commit messages

## Neon Database

- **Project:** `devstash` (ID: `crimson-dream-83612766`)
- **Development branch:** `br-noisy-tooth-a142t5mj` — always use this branch for queries and migrations
- **Production branch:** `br-gentle-art-a1sy8xgj` — DO NOT touch unless explicitly instructed
- Never run queries against other Neon projects unless specified
- Always pass the development `branchId` when using Neon MCP tools
