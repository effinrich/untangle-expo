---
trigger: glob
globs: **/*.ts,**/*.tsx
description: React and TypeScript conventions for .ts and .tsx files.
---

# Frontend (React / TSX)

- One component per `.tsx` file. The filename is the component name in kebab-case, inside a like-named folder: `Focus` -> `focus/focus.tsx`, `TaskList` -> `task-list/task-list.tsx`.
- oxlint (`.oxlintrc.json`) enforces `unicorn/filename-case` (kebab-case) and `react/no-multi-comp` as errors, plus `react/rules-of-hooks` and `react/exhaustive-deps`.
- Component files hold state, hook calls, short handlers, and composed partials. Effects and server state go in `hooks.ts`; literal config in `consts.ts`; pure logic in `utils.ts` (no React); shared prop types in `types.ts`.
- Partials are presentational: props in, callbacks out, small local UI state only.
- Imports go at the top of the file. No inline or dynamic imports without a documented reason.
- Do not add a dependency for something a few lines of code can do.
- Formatting is oxfmt: no semicolons, double quotes, trailing commas, width 100.
