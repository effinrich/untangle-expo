# Feature-based Architecture — Reference

Detailed rationale, edge cases, and design decisions behind the convention.

## Why this shape

The layout exists so that, for any feature, an agent or human can answer five questions without reading the page file:

| Question | File |
|---|---|
| What does this feature talk to on the network? | `api.ts` |
| What stateful behavior does it have over time? | `hooks.ts` |
| What does its data look like? | `types.ts` |
| What fixed values and config does it use? | `consts.ts` |
| What pure logic does it depend on? | `utils.ts` |

The page file becomes a wiring diagram you can read in 60 seconds: state declared at the top, partials composed at the bottom, props bridging them.

## File responsibilities in depth

### `<feature>.tsx` / `index.tsx` — the page

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
- They may **not** call `useEffect`, `useQuery`, `useMutation`, `useSWR`, `fetch`, or `axios` in the component file. If a partial needs server data, the page is supposed to fetch it and pass it down.
- Their types, constants, and hooks go in the feature-level `types.ts` / `consts.ts` / `hooks.ts`. `partials/` has no `types.ts` of its own.

## Edge cases and decisions

### "The feature has no network code"

Skip `api.ts`. The validator allows it to be missing. If the feature uses a typed RPC client (tRPC), the typed hooks in `hooks.ts` cover the network surface and `api.ts` would be empty.

### "A partial needs server data"

Two options, prefer the first:

1. **Lift the fetch to the page.** The page calls the hook and passes data + loading/error states down as props. Easier to test, easier to compose with siblings.
2. **Treat the partial as a feature.** If a partial is large enough to fetch its own data, split it into its own feature folder.

### "Two features need the same hook"

Move it out of `src/features/` (for example `src/shared/hooks/<name>.ts`, or the repo's existing shared folder). Features never reach into each other. The rule "features never import from siblings" exists so deleting a feature is always a `rm -r` away.

### "Action helpers need state"

In `utils.ts`, they accept the setters and clients as parameters. The page wires them up:

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

### "The page file is getting long"

Split partials further. If the page renders several commented sections of markup, each section probably wants to be its own partial — extract it. The page's job is wiring, not markup.

### "What should the page file be called?"

Name it after its component (`task-list.tsx` for `TaskList`) or use `index.tsx`. The validator accepts any single `.tsx` at the feature root. Pick one per repo and be consistent.

### "Should the types file be called `task-list.types.ts`?"

No. Files next to a component are named for what they hold: `types.ts`, `consts.ts`, `hooks.ts`, `utils.ts`. The folder already says which feature they belong to, and one file per kind per folder keeps imports predictable (`../types`, `./hooks`).

### "A partial has its own types or constants"

Put them in the feature-level files; that is the default. Give the partial its own folder (`partials/task-card/task-card.tsx` + `types.ts` + `consts.ts` + `hooks.ts`) only when its items would collide with the feature-level ones or would make those files mostly about one partial. Its sub-partials then live in the same folder.

## Worked example: `src/features/tasks`

```
src/features/tasks/
  task-list.tsx       TaskList: filter/sort/search state, memoized derived lists, composes partials
  types.ts            NewTaskInput, TaskListProps, TaskCardProps, FilterTab, SortOption, SortOptionConfig
  consts.ts           SORT_OPTIONS, energy/priority weights, card colour maps, priorityCycle, completionConfetti
  hooks.ts            useQuickAddForm (list keeps the form state), useTaskCardActions (card state + handlers)
  utils.ts            getAllCategoryNames, getCategoryCounts, filterTasks, sortTasks, buildQuickAddTask, buildMarkdownPlan
  partials/
    category-filter-strip.tsx   energy-sort-strip.tsx   quick-add-form.tsx   sort-modal.tsx
    status-filter-tabs.tsx      task-search-controls.tsx
    task-list-empty-state.tsx   task-list-footer.tsx
    task-card.tsx               task-card-actions.tsx   task-card-category-menu.tsx
    task-card-first-step.tsx    task-card-meta.tsx      task-card-substeps.tsx
```

The card's props, colour maps, and hook are small, so they live in the feature-level files and `partials/` stays flat. No item is used outside `tasks`, so nothing goes to `src/shared/`.

## When the convention does not apply

- **One-off scripts or demos.** Not worth the structure for a 50-line spike.
- **`src/lib/` infrastructure.** Library wiring (tRPC client, providers, query-client) is not a feature; it doesn't have a UI.
- **Pure presentational design-system components.** Live in `src/shared/ui/` or your design-system package, not in any feature.

## Anti-patterns the validator catches

| Smell | Why it's bad |
|---|---|
| `useEffect` in the page | Hides time-dependent behavior in the page; should be a named hook in `hooks.ts`. |
| `useQuery` / `useMutation` in a partial | Couples a presentational component to a server, blocking reuse. |
| `fetch(...)` in `hooks.ts` | Mixes I/O with React state; makes the function impossible to test without a render. |
| `: any` in a feature file | Drops type safety; usually means a shape belongs in `types.ts`. |
| `import x from '../other-feature/...'` | Creates a graph between features and makes deletion a refactor. |
