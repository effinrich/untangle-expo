---
trigger: always_on
description: How to work in this repo. File layout, file size, docs, refactors, and git.
---

# Core principles

Follow the feature-based-architecture skill for new projects and structural refactors: `.agents/skills/feature-based-architecture/SKILL.md` (user install: `~/.agents/skills/feature-based-architecture/SKILL.md`). Read it before creating, moving, or splitting a component or feature file.

## Layout

- Every file and folder name is kebab-case: `task-card.tsx`, `use-tasks.ts`, never `TaskCard.tsx`.
- One React component per file, named after the component (`TaskCard` -> `task-card.tsx`).
- Each component or screen lives in a like-named folder: `task-list/task-list.tsx`.
- Partials stay flat in `partials/`: `task-list/partials/task-card.tsx`.
- Sibling files are unprefixed and named for what they hold: `types.ts`, `consts.ts`, `hooks.ts`, `utils.ts`. Never `task-list.types.ts`.
- Code used by more than one feature goes in `src/shared/{ui,hooks,types,consts,utils}`. Features never import from a sibling feature.

## Files

- Keep files under ~200 lines. Split hooks, helpers, and JSX sections out before that.
- Component files are markup plus wiring. Types, constants, hooks, and helpers go in the sibling files.

## Changes

- Refactors move code; they do not change behavior. A behavior change is its own change, called what it is.
- Structural refactors are incremental: bring the files you touch into line and leave untouched files where they are.
- UI, look-and-feel, and aesthetic work is exempt: refactor it in broad strokes, repo-wide when warranted. Surface work is loosely coupled and swappable, like a VS Code theme. The incremental rule and the over-engineering guard cover logic and architecture, not visual design.
- When a file moves or is renamed, update every doc that names the old path in the same change (`AGENTS.md`, `HANDOFF.md`, `PLAN.md`, `mobile/README.md`, these rules, the skill). No follow-up.
- Commit at will; never ask before committing. Pushing is a separate, shared-state action and still needs the user's go-ahead.
