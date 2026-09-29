---
name: feature-based-architecture
description: Feature-folder layout, one-component-per-file, and where types, constants, hooks, and helpers live in React apps. Use when creating a feature or component, splitting or slimming a large component, extracting types/consts/hooks/helpers, moving code into src/features/ or src/shared/, starting a new React project, or reviewing structure.
---

# Feature-based React architecture

A component file reads as markup plus wiring. Types, constants, hooks, and logic live in files named for what they hold (`types.ts`, `consts.ts`, `hooks.ts`, `utils.ts`), in the folder of the components that use them.

## Folder structure

Feature-local (only this feature uses it):

```
src/features/<feature>/
  <view>.tsx      One component: markup and wiring. The feature page may be index.tsx.
  types.ts        Types for every component in this folder, partials included.
  consts.ts       Constants and static config.
  hooks.ts        Hooks: state plus handlers, effects, server state.
  utils.ts        Pure helpers: filtering, sorting, formatting, payload building. No React.
  api.ts          Raw network calls. Omit when an app-wide client covers it.
  partials/
    <part>.tsx    One presentational component per file. Uses the feature-level files above.
    <part>/       Only when a partial needs its own types/consts/hooks that would collide:
      <part>.tsx
      types.ts  consts.ts  hooks.ts
```

Shared across features:

```
src/shared/
  ui/       <component>.tsx   one component per file
  hooks/    <concept>.ts      use-tasks.ts
  types/    <concept>.ts      task.ts, user.ts
  consts/   <concept>.ts      categories.ts
  utils/    <concept>.ts      dates.ts
```

Naming:

- Sibling files are named for what they hold, never prefixed with the component name: `task-list.tsx` + `types.ts`, not `task-list.types.ts`.
- One `types.ts` / `consts.ts` / `hooks.ts` / `utils.ts` per folder, covering every component in it. Create each only when it has content.
- `partials/` has no `types.ts` of its own; flat partials use the feature-level files. Prefer flat. Give a partial its own folder only when its types or consts would collide with, or crowd out, the feature-level ones.
- Shared files are named for the concept (`task.ts`, `use-tasks.ts`), never for a feature (`tasks.types.ts`). No `shared/types/index.ts` holding every type.
- Repos that already keep app-level code elsewhere (`src/services/`, `src/types/`, `src/data/`) keep those files; new cross-feature code goes in `src/shared/`.

## Extraction rule

Every type, constant, hook, and helper sits at the nearest folder that covers all its importers:

| Imported by | Goes in |
|---|---|
| Components in one feature (the view and its flat partials) | That feature's `types.ts` / `consts.ts` / `hooks.ts` / `utils.ts` |
| Only a partial that has its own folder | That folder's `types.ts` / `consts.ts` / `hooks.ts` |
| Another feature | `src/shared/<kind>/<concept>.ts` (components: `src/shared/ui/<name>.tsx`) |

When an importer appears in another feature, move the item to `src/shared/` then, not before.

## Rules

1. **One component per file**, named after it in the repo's filename case (`TaskCard` -> `task-card.tsx`). Every other component, including tiny unexported ones and provider wrappers, gets its own file.
2. **Component files are markup plus wiring**: state declarations, hook calls, short handlers that call props or helpers, and composed partials. Literal config, data shaping, and multi-step handlers move out.
3. **Props interfaces** may stay in the component file. When a hook, helper, or second file needs the props type, it moves to the folder's `types.ts`.
4. **Split for readability, not line count.** Ceiling: a component that fetches, derives state, and renders a long tree gets split. Hooks out, helpers out, sections into partials.
5. **Partials are presentational.** Props in, callbacks out; small local UI state is fine. They render data passed as props; user-triggered actions (a save, an AI call) may come from a hook in `hooks.ts`.
6. **Effects and server state live in hook files** (a folder's `hooks.ts`, or `src/shared/hooks/`).
7. **Raw `fetch` / `axios` inside a feature lives in `api.ts`.** App-wide clients live outside features.
8. **Helpers are pure**: no React, dependencies passed as parameters. Types are explicit; `any` only with a lint-disable comment.
9. **Features import only from themselves and shared code**, never from a sibling feature.

## Splitting a large component

Move code as-is; renames and logic rewrites belong in a separate change.

1. Types -> the folder's `types.ts`.
2. Constants and literal objects declared in the component body -> `consts.ts`.
3. Pure logic (filters, sorts, counts, formatters, payload builders) -> `utils.ts`, called from the component (inside `useMemo` if it already was).
4. State plus the handlers that use it -> a named hook in `hooks.ts`. State that must survive a child unmounting stays in the parent (as a hook the parent calls).
5. Each commented JSX section -> `partials/<name>.tsx`. The file is named after its component; a partial that only serves one parent carries that parent's name in its component name (`TaskCardActions` -> `task-card-actions.tsx`).
6. Type-check, lint, and confirm the UI renders and behaves the same.

## New project

1. Providers, query client, and API clients go in the entry file or `src/lib/`; `App` stays one component.
2. Scaffold each feature: `node <skill-dir>/scripts/scaffold.mjs <name>`, then delete stubs the feature does not use yet.
3. Turn on lint rules `react/no-multi-comp` and `unicorn/filename-case` as errors.
4. Create `src/shared/<kind>/` folders only when the first cross-feature item appears.

## Refactoring an existing app

Migrate incrementally: the file you touch moves toward the layout; everything else stays put.

1. Touching a large or rule-breaking file? Extract from that file using the steps above, and update its importers.
2. Untouched files keep their location and name, even when they predate the layout.
3. Finish one feature before starting the next. Moves across many features need the user's go-ahead.
4. Validate the features you migrated; report pre-existing violations in untouched files instead of fixing them.

## Scripts

Run from the repo root. `<skill-dir>` is this skill's folder (for example `.agents/skills/feature-based-architecture`).

- `scaffold.mjs <name | path>`: creates `src/features/<name>/` with stubs and an empty `partials/`. Refuses to overwrite.
- `validate.mjs [feature-path...]`: no arguments validates every folder under `src/features/`. Exits non-zero on violations: page count, root files other than `types.ts` / `consts.ts` / `hooks.ts` / `utils.ts` / `api.ts`, effects or server-state hooks outside `hooks.ts`, network calls outside `api.ts`, inline `any`, sibling-feature imports.

Worked example, rationale, and edge cases: [REFERENCE.md](REFERENCE.md).
