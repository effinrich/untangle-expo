# Feature-based Architecture — Reference

Detailed rationale, edge cases, and design decisions behind the convention.

## Why this shape

The layout exists so that, for any component folder, an agent or human can answer five questions without reading the component file:

| Question                                       | File        |
| ---------------------------------------------- | ----------- |
| What does this feature talk to on the network? | `api.ts`    |
| What stateful behavior does it have over time? | `hooks.ts`  |
| What does its data look like?                  | `types.ts`  |
| What fixed values and config does it use?      | `consts.ts` |
| What pure logic does it depend on?             | `utils.ts`  |

The component file becomes a wiring diagram you can read in 60 seconds: state declared at the top, partials composed at the bottom, props bridging them.

The like-named folder (`task-list/task-list.tsx`) is what makes this possible for every component, not just one per feature: each component or screen gets its own place for `types.ts`, `hooks.ts`, a test, and a story without prefixing any of them, and a feature can hold several screens side by side. Kebab-case everywhere keeps names identical across case-insensitive (Windows, macOS) and case-sensitive (Linux CI) file systems, so a `TaskList.tsx` vs `taskList.tsx` mismatch can never pass locally and fail in CI.

## File responsibilities in depth

### `<component>/<component>.tsx` — the component or screen

- Declares local state with `useState`, refs with `useRef`, derived values with `useMemo`.
- Calls feature hooks from `hooks.ts` to get server data and behaviors.
- Renders a tree of partials, passing data down and callbacks up.
- **Never** calls `useEffect`. If you need an effect, name it (`useFocusOnMount`, `useProactiveFeedback`) and put it in `hooks.ts`.
- **Never** calls `fetch`/`axios` or a React-Query/tRPC hook directly. Always go through `hooks.ts`.

### `types.ts` — the domain

- Domain models (`Attachment`, `Suggestion`, `Invoice`).
- Request/response shapes for `api.ts` functions.
- Prop contracts shared between partials.
- Anything `import type`-able. No runtime exports.

### `consts.ts` — the fixed values

- Option lists, lookup maps, colour and label maps, default values, library option objects (`SORT_OPTIONS`, `priorityStyles`, `completionConfetti`).
- Anything that was a literal declared inside a component body and does not depend on props or state.
- No functions with logic; those go in `utils.ts`.

### `api.ts` — the network

- Plain async functions: `input -> Promise<output>`.
- No React, no hooks. Pure I/O.
- Throws typed errors. Returns typed data.
- **Optional**: omit when the feature uses a fully typed client (tRPC, GraphQL codegen) and never touches raw HTTP. In that case the typed hooks in `hooks.ts` cover everything.

### `hooks.ts` — the behavior

- Wrappers around React-Query / tRPC / SWR / Apollo, named per feature (`useGenerateMutation`, `useUserQuery`).
- `useEffect`-based behaviors, each exported as a named hook (`useProactiveFeedback`, `useKeyboardShortcuts`).
- Domain hooks that compose multiple primitives (`useEditorActions(editor)` returning bound handlers).
- State plus handlers lifted out of a component in this folder (`useQuickAddForm`, `useTaskCardActions`). One file holds the hooks for every component in the folder.
- Imports from `api.ts`, `consts.ts`, and `utils.ts`. Never imported by them.

### `utils.ts` — the pure layer

- Static config objects (`editorConfig`, default form values, validation schemas).
- Pure helpers (`formatCurrency`, `dedupeBy`).
- Action helpers that perform side effects but take their dependencies as parameters:

  ```ts
  // ✅ Testable: caller injects the mutation and setters.
  export const submitForm = async (params: {
    values: FormValues;
    mutation: SubmitMutation;
    onSuccess?: () => void;
  }) => { ... };
  ```

- **Never** imports `react`, `useState`, etc. If it needs hooks, it's a hook, not a util.

### `partials/` — the presentation

- Each file is one component.
- Components receive props and emit callbacks. They may use `useRef`, `useMemo`, `useCallback`, and small amounts of local UI state (e.g. `useState(false)` for an open/closed toggle).
- They may call a named hook from `hooks.ts` for user-triggered actions (complete, save, "break down further").
- They may **not** call `useEffect`, `useQuery`, `useMutation`, `useSWR`, `fetch`, or `axios` in the component file. If a partial needs server data, the parent component is supposed to fetch it (through `hooks.ts`) and pass it down.
- Their types, constants, and hooks go in the component folder's `types.ts` / `consts.ts` / `hooks.ts` (the folder that holds `partials/`). `partials/` has no `types.ts` of its own.
- They stay flat kebab files (`partials/task-card.tsx`), not like-named folders, unless they need their own colliding siblings.

## Edge cases and decisions

### "The feature has no network code"

Skip `api.ts`. The validator allows it to be missing. If the feature uses a typed RPC client (tRPC), the typed hooks in `hooks.ts` cover the network surface and `api.ts` would be empty.

### "A partial needs server data"

Two options, prefer the first:

1. **Lift the fetch to the parent component.** The parent calls the hook and passes data + loading/error states down as props. Easier to test, easier to compose with siblings.
2. **Promote the partial.** If a partial is large enough to fetch its own data, move it to its own like-named component folder (or its own feature) with its own `hooks.ts`.

### "Two features need the same hook"

Move it out of `src/features/` (for example `src/shared/hooks/<name>.ts`, or the repo's existing shared folder). Features never reach into each other. The rule "features never import from siblings" exists so deleting a feature is always a `rm -r` away.

### "Action helpers need state"

In `utils.ts`, they accept the setters and clients as parameters. The component wires them up:

```ts
onCompose={() =>
  generateInitial({
    prompt,
    attachments,
    editor,
    mutation: generateMutation,
    onSuccess: () => {
      setPrompt('');
      setAttachments([]);
    },
  })
}
```

This keeps `utils.ts` framework-agnostic and unit-testable.

### "The component file is getting long"

Split partials further. If the component renders several commented sections of markup, each section probably wants to be its own partial — extract it. The component's job is wiring, not markup.

### "What should the component file be called?"

After its component, in kebab-case, inside a folder of the same name: `TaskList` -> `task-list/task-list.tsx`. Not `index.tsx` (every tab and stack trace would say `index`), and never at the feature root; the validator flags a `.tsx` there.

### "Where do tests and stories go?"

Beside the component in its folder: `task-list/task-list.test.tsx`, `task-list/task-list.stories.tsx`. Create them when you write them; the folder exists so they have a place without cluttering the feature root.

### "Is `main.tsx` / `App.tsx` a component?"

`main.tsx` (the entry that calls `createRoot`) and barrel `index.ts` files are not components; they stay plain kebab files. `App` is a component, so it gets `src/app/app.tsx` and the entry imports it from there.

### "Renaming `App.tsx` to `app.tsx` on Windows or macOS"

Case-only renames are invisible to case-insensitive file systems and to git with `core.ignorecase=true`. Prefer a real move into the like-named folder (`App.tsx` -> `app/app.tsx`), which changes the path, not just its case. If a case-only rename is unavoidable, rename in two steps (`App.tsx` -> `app-tmp.tsx` -> `app.tsx`) or use `git mv`.

### "Two features each have a `task-list/` folder"

Fine. Folder names are unique within their parent, like file names; the feature folder already disambiguates.

### "Should the types file be called `task-list.types.ts`?"

No. Files next to a component are named for what they hold: `types.ts`, `consts.ts`, `hooks.ts`, `utils.ts`. The folder already says which feature they belong to, and one file per kind per folder keeps imports predictable (`../types`, `./hooks`).

### "A partial has its own types or constants"

Put them in the parent component folder's files; that is the default. Give the partial its own folder (`partials/task-card/task-card.tsx` + `types.ts` + `consts.ts` + `hooks.ts`) only when its items would collide with the parent's or would make those files mostly about one partial. Its sub-partials then live in that folder's own `partials/`.

## Worked example: `src/features/tasks`

From the app this skill was extracted from (a task planner). In another project, copy the shape; these files will not exist there.

```
src/features/tasks/
  task-list/
    task-list.tsx     TaskList: filter/sort/search state, memoized derived lists, composes partials
    types.ts          TaskListProps, TaskCardProps, FilterTab, SortOption, SortOptionConfig
    consts.ts         SORT_OPTIONS, energy/priority weights, card colour maps, priorityCycle, completionConfetti
    hooks.ts          useQuickAddForm (list keeps the form state), useTaskCardActions (card state + handlers)
    utils.ts          getAllCategoryNames, getCategoryCounts, filterTasks, sortTasks, buildQuickAddTask, buildMarkdownPlan
    partials/
      category-filter-strip.tsx   energy-sort-strip.tsx   quick-add-form.tsx   sort-modal.tsx
      status-filter-tabs.tsx      task-search-controls.tsx
      task-list-empty-state.tsx   task-list-footer.tsx
      task-card.tsx               task-card-actions.tsx   task-card-category-menu.tsx
      task-card-first-step.tsx    task-card-meta.tsx      task-card-substeps.tsx
```

`TaskList` is the feature's only screen, so the feature root holds just `task-list/`; root-level `types.ts` etc. appear only when a second component folder shares something. The card's props, colour maps, and hook are small, so they live in `task-list/`'s files and `partials/` stays flat. A test would be `task-list/task-list.test.tsx`. `NewTaskInput` is also used by `src/shared/hooks/use-tasks.ts`, so it lives in `src/shared/types/task.ts`; everything else is used only inside `tasks` and stays there.

That app's other components follow the same two rules: `src/app/app.tsx`, `src/features/braindump/brain-dump-input/brain-dump-input.tsx`, `src/features/focus/focus/focus.tsx`. A feature-specific hook may be a standalone kebab-case `use-*.ts` file at its feature root; hooks shared across features live in `src/shared/hooks/`, such as `src/shared/hooks/use-audio-recorder.ts`.

## Multi-agent rule files

Each tool reads a different place, so the rules exist in several copies that must mean the same thing:

- **`AGENTS.md`**: read by most coding agents. Short: a pointer to this skill, the core rules, and durable workspace facts. Keep facts that are still true when editing it.
- **`CLAUDE.md`**: Claude Code reads this name, so it is one line, `@AGENTS.md`, and nothing else.
- **`.cursor/rules/*.mdc`**: YAML frontmatter with `description` plus either `alwaysApply: true` or `globs:` (comma-separated patterns, `alwaysApply: false`). Keep each under ~50 lines.
- **`.windsurf/rules/*.md`**: same body as the matching `.mdc`. Only the frontmatter differs: `trigger: always_on`, or `trigger: glob` with `globs:`.

The four topics:

| File                 | Scope          | Holds                                                                                        |
| -------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `00-core-principles` | always         | Naming, like-named folders, partials, sibling files, `src/shared/`, ~200 lines, docs, git    |
| `10-project-context` | always         | This repo only: apps, backend, data layer, feature paths, worked example, `package.json` commands |
| `20-frontend`        | `*.ts, *.tsx`  | One component per file, lint rules actually configured, hooks/consts/utils split, imports, deps |
| `30-testing`         | always         | Where tests and stories go, the real verify commands, browser check for UI changes           |

Rules are the enforceable summary; do not paste this skill into them. State only what the repo's config confirms (lint rules, scripts, ignore patterns). When a rule changes, edit `AGENTS.md`, both rule folders, and this skill together.

## When the convention does not apply

- **One-off scripts or demos.** Not worth the structure for a 50-line spike.
- **`src/lib/` infrastructure.** Library wiring (tRPC client, providers, query-client) is not a feature; it doesn't have a UI.
- **Pure presentational design-system components.** Live in `src/shared/ui/` or your design-system package, not in any feature.

## Anti-patterns the validator catches

| Smell                                                                 | Why it's bad                                                                                 |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `TaskList.tsx`, `useThing.ts` (lint: `unicorn/filename-case`)         | Case mismatches pass on Windows/macOS and break on Linux CI.                                 |
| `.tsx` at the feature root, or a folder without its like-named `.tsx` | No room for the component's siblings, test, or story; breaks the folder-matches-file lookup. |
| Second component in a component folder                                | Belongs in `partials/` or its own like-named folder.                                         |
| `useEffect` in a component file                                       | Hides time-dependent behavior in the component; should be a named hook in `hooks.ts`.        |
| `useQuery` / `useMutation` in a partial                               | Couples a presentational component to a server, blocking reuse.                              |
| `fetch(...)` in `hooks.ts`                                            | Mixes I/O with React state; makes the function impossible to test without a render.          |
| `: any` in a feature file                                             | Drops type safety; usually means a shape belongs in `types.ts`.                              |
| `import x from '../other-feature/...'`                                | Creates a graph between features and makes deletion a refactor.                              |
