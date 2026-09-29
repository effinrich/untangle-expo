---
trigger: always_on
description: Where tests and stories go, and how to verify changes in this repo.
---

# Testing and verification

## Tests and stories

- When they exist, tests and stories sit beside the component in its folder: `focus/focus.test.tsx`, `focus/focus.stories.tsx`.
- The repo has no test runner and no test script. Do not invent one or add test files unless asked.

## Verify every change

- `bun run lint`: 0 errors (existing warnings may stay).
- `bunx tsc --noEmit`: root tsconfig (web `src/`, `server.ts` and its `routes/` imports).
- Mobile source changed: `mobile/node_modules/.bin/tsc --noEmit -p mobile/tsconfig.json`. Never point the root TypeScript at the mobile tsconfig.
- Feature layout: `node .agents/skills/feature-based-architecture/scripts/validate.mjs`.
- Web UI changes: exercise the changed flow in the browser against the dev server (`bun run dev`, port 3000). Reuse a running server; do not start a second one.
