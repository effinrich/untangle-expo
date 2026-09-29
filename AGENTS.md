# Agent instructions

## React structure (`src/`)

- Before creating, moving, or splitting a component or feature file, or extracting types/consts/hooks/helpers, read `.agents/skills/feature-based-architecture/SKILL.md` and follow it.
- One React component per file, named after the component in kebab-case: `TaskCard` -> `task-card.tsx`. `bun run lint` enforces both (`react/no-multi-comp` errors, `unicorn/filename-case` warns).
- Refactors are incremental: bring the files you touch into line; leave untouched files where they are.
- Existing app-level code lives in `src/services/`, `src/types/`, `src/data/`; new cross-feature code goes in `src/shared/{ui,consts,types,hooks}` per the skill. `mobile/` is a separate Expo app outside these rules.
- Verify with `bun run lint` and `bunx tsc --noEmit`.

## Learned User Preferences

- Prioritize small, readable files: component files are markup plus wiring; types, consts, hooks, and helpers go in sibling files.
- Sibling files beside a component are unprefixed (`types.ts`, `consts.ts`, `hooks.ts`, `utils.ts`), never `task-list.types.ts`.
- Keep the feature-based-architecture skill agent-agnostic and self-contained (no Claude-only paths, tool names, or plugin wrappers); the user reuses it across models and keeps a portable copy outside the repo.

## Learned Workspace Facts

- `AGENTS.md` is the single agent instruction file; `CLAUDE.md` only imports it with `@AGENTS.md`.
- `src/features/tasks/` is the reference example of the layout: `task-list.tsx` with sibling `types.ts`, `consts.ts`, `hooks.ts`, `utils.ts`, and components under `partials/`.
