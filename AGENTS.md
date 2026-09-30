# Agent instructions

Canonical instructions for any agent.

> **Architecture skill, required:** follow the feature-based-architecture skill for new projects and for structural refactors (creating, moving, or splitting a component or feature file, or extracting types/consts/hooks/helpers). Use `.agents/skills/feature-based-architecture/SKILL.md` in this repo; outside it, the same skill is installed at `~/.agents/skills/feature-based-architecture/SKILL.md`.

`.cursor/rules/*.mdc` and `.windsurf/rules/*.md` carry the same rules for tools that do not load this file (`00-core-principles`, `10-project-context`, `20-frontend`, `30-testing`). Change a rule here, in both rule folders, and in the skill in the same edit.

## React structure (`src/`)

- One React component per file, named after the component in kebab-case: `TaskCard` -> `task-card.tsx`. Each component or screen lives in a like-named folder (`task-list/task-list.tsx`); partials stay flat in `partials/`. `bun run lint` enforces one-per-file and kebab-case as errors (`react/no-multi-comp`, `unicorn/filename-case`).
- Keep files under ~200 lines. Structural refactors move code without changing behavior and stay incremental: bring the files you touch into line; leave untouched files where they are.
- UI, look-and-feel, and aesthetic work is exempt from that rule: refactor it in broad strokes, repo-wide when warranted. Surface work is loosely coupled and cheaply swappable (a VS Code theme, not a routing layer), so the incremental rule and the over-engineering guard cover logic and architecture, not visual design.
- Existing app-level code lives in `src/services/`, `src/types/`, `src/data/`; new cross-feature code goes in `src/shared/{ui,hooks,types,consts,utils}` per the skill.
- Native screens live in `screens/<screen>/<screen>.tsx`, re-exported by one-line route files in `app/`. Shared native primitives live in `components/` (`button`, `text-field`, `option-row`, `screen`, `status-banner`, `task-card-mobile`). Web and native are one Expo app on one `package.json`.
- Tests are the default: spec first, then red, green, refactor. `bun test` is the runner; `bun run test:firestore` runs the Firestore rules and sync suite.
- Verify with `bun run lint` and `bunx tsc --noEmit`.
- When code moves or is renamed, update every doc that names the old path (`HANDOFF.md`, `mobile/README.md`, `PLAN.md`, this file, the rule folders, the skill) in the same change.
- Commit at will; never ask before committing. Pushing is a separate, shared-state action and still needs the user's go-ahead.

## Learned User Preferences

- Prioritize small, readable files: component files are markup plus wiring; types, consts, hooks, and helpers go in sibling files.
- Sibling files beside a component are unprefixed (`types.ts`, `consts.ts`, `hooks.ts`, `utils.ts`), never `task-list.types.ts`.
- Keep the feature-based-architecture skill agent-agnostic and self-contained (no Claude-only paths, tool names, or plugin wrappers); the user reuses it across models and keeps a portable copy outside the repo, which must stay identical to the repo copy.
- Name a screen's folder and file after its feature (`focus/focus.tsx`), not a descriptive variant like `focus-radar-modal`.
- Carve UI and design work out of the incremental-refactor and minimal-change rules. Refactoring UI, look and feel, and aesthetics should be done in broad strokes, repo-wide when warranted, especially when the current state is bad. The "only touch files you're already changing" rule exists for low-level coupled logic (routing, backend integration), not for surface work, which is interchangeable like a VS Code theme. Over-engineering concerns apply to functionality, the how and by what means, not to visual design.

## Learned Workspace Facts

- `AGENTS.md` is the canonical agent instruction file; `CLAUDE.md` only imports it with `@AGENTS.md`. `.cursor/rules/` and `.windsurf/rules/` mirror it for Cursor and Windsurf.
- Data layer is Firebase (Auth + Firestore), not Convex. The API is Expo Router server routes in `app/api/*+api.ts` (`untangle`, `unstick-me`, `breakdown-task`, `transcribe-audio`), sharing the Gemini client in `server/gemini.ts`.
- `src/features/tasks/task-list/` is the reference example of the layout: `task-list.tsx` with sibling `types.ts`, `consts.ts`, `hooks.ts`, `utils.ts`, and components under `partials/`.
- The focus screen is `src/features/focus/focus/focus.tsx` on web and `screens/focus/focus.tsx` on native (re-exported by `app/focus.tsx`).
