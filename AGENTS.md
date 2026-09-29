# Agent instructions

## React structure (`src/`)

- Before creating, moving, or splitting a component or feature file, or extracting types/consts/hooks/helpers, read `.agents/skills/feature-based-architecture/SKILL.md` and follow it.
- One React component per file, named after the component in kebab-case: `TaskCard` -> `task-card.tsx`. Each component or screen lives in a like-named folder (`task-list/task-list.tsx`); partials stay flat in `partials/`. `bun run lint` enforces one-per-file and kebab-case as errors (`react/no-multi-comp`, `unicorn/filename-case`).
- Refactors are incremental: bring the files you touch into line; leave untouched files where they are.
- Existing app-level code lives in `src/services/`, `src/types/`, `src/data/`; new cross-feature code goes in `src/shared/{ui,hooks,types,consts,utils}` per the skill. The native UI (`screens/`, root `hooks/`, `utils/`, `services/`, `components/task-card-mobile.tsx`) sits outside these rules but is linted.
- Verify with `bun run lint` and `bunx tsc --noEmit`.
- When code moves or is renamed, update every doc that names the old path (`HANDOFF.md`, `README.md`, `PLAN.md`, this file, the skill) in the same change.

## Learned User Preferences

- Prioritize small, readable files: component files are markup plus wiring; types, consts, hooks, and helpers go in sibling files.
- Sibling files beside a component are unprefixed (`types.ts`, `consts.ts`, `hooks.ts`, `utils.ts`), never `task-list.types.ts`.
- Keep the feature-based-architecture skill agent-agnostic and self-contained (no Claude-only paths, tool names, or plugin wrappers); the user reuses it across models and keeps a portable copy outside the repo.

## Learned Workspace Facts

- `AGENTS.md` is the single agent instruction file; `CLAUDE.md` only imports it with `@AGENTS.md`.
- `src/features/tasks/task-list/` is the reference example of the layout: `task-list.tsx` with sibling `types.ts`, `consts.ts`, `hooks.ts`, `utils.ts`, and components under `partials/`.
