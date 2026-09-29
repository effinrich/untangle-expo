# Untangle — Design Checkup

- **Mode:** checkup (report only, no fixes applied)
- **Register:** Product
- **Scope:** Web UI in `src/` (React DOM + Tailwind v4) **and** native UI in `screens/` + `components/` (React Native + NativeWind). `mobile/` does not exist on any branch.
- **Date:** 2026-09-29
- **Verdict:** **Block** (web). Native is close to shippable.

> Checkup reports findings only. Fixes happen when you run `/design a11y`, `/design interaction`, `/design responsive`, `/design typeset`, etc.

---

## Surfaces

| Surface | Score | Verdict |
|---|---|---|
| Web (`src/`, Tailwind DOM) | **25 / 60** | Block — seven HIGH escalation triggers standing |
| Native (`screens/`, `components/`) | **50 / 60** | Needs changes — no HIGH, but real gaps |

The native surface is the better-built half: real accessibility roles, labels, states, and hints; 44pt targets; safe-area handling; haptics; and `Alert` confirmations before destructive actions. Web is where the product is unsafe to ship.

---

## Observed renders

### Native — iPhone 17 / 16e simulator

Four captures supplied by the user, taken 6:32–6:52.

**Confirmed against the audit**

- The main screen matches the source read exactly: `Untangle` large title, "Welcome back. 5 steps are waiting when you're ready.", the composer with a visible label + helper + Speak/Untangle pair, "Next steps (5)", the Stuck card, then a task card with checkbox, meta line, and the amber "First step" block. Contrast, tap targets, and the amber-on-obsidian palette read correctly at device size.
- Finding 17 (parity) is visible rather than inferred: the card renders title, meta, and first step, with no substep checklist and no "Break down further" action.
- The sort sheet renders both radio groups with correct selected/unselected treatment, and draws radios as a checkmark inside a circle (finding 20).

**The 6:50 amber square — explained**

- That capture is the **app icon**, not a broken render. `assets/icon.png` and `assets/adaptive-icon.png` are both 628 bytes, and `icon.png` is a flat `#F5B800` square with no mark, no text, and square corners. Nothing in the app draws a sharp-cornered full-bleed amber block; every amber surface in the product is a rounded button or card. Logged as native finding 21.

### Web — browser at ~1200–1440px

Seven captures supplied by the user. This closes most of the web verification gap.

**Confirmed against the audit**

- The workspace renders as built: wordmark + tagline, the four nav links with "Workspace" active, Google Sign-In / Unstick Me / reset, the hero card with its ambient image and stat strip, the composer with battery, target-area and sparks rows, the category strip, and the energy/sort strip.
- Category meaning is not color-only on the strip: every hue carries a text label and a count.
- The momentum ledger renders its three stat cards and per-category progress rows, each with a `completed/total (%)` figure.
- The Focus modal ("One Thing Radar") and the Unstick modal in both states render as designed.

**New, from the renders**

- **The work is below the fold.** The task list does not appear in the first viewport at desktop width. The opening screen is header, hero card with marketing copy, an error banner, the composer with three pill rows, then two filter strips. The list surfaces only after scrolling past all of it. Logged as finding 21.
- **The accent is no longer an accent.** Roughly nine amber elements are visible simultaneously in one viewport: active nav, Unstick Me, hero eyebrow, selected battery pill, selected area pill, selected spark, two section headers, and the primary submit. Logged as finding 22.
- **AI categories escape the taxonomy.** The momentum breakdown rendered categories "Quick Win" and "Focus Project", neither of which exists in `DEFAULT_CATEGORIES`. Both fall through `getCategoryStyle` to the neutral fallback and render with a gray dot, so the color-coding that carries the product's meaning silently stops working. Logged as finding 24.
- **"Pick Another" is materially weaker than "Accept"** in the Unstick result. Logged as finding 23.

**Functional blocker — outside design scope**

- Web sign-in fails with `Firebase: Error (auth/unauthorized-domain)` — the web origin is not in Firebase Auth's authorized domains. This is a second, independent failure from the OAuth client's `Error 400: invalid_request`. Both block the same flow and both are console configuration, not design. Together they gate testing anything behind auth.

---

## TL;DR

Untangle is a genuinely authored product: obsidian canvas, an amber accent, an ADHD-first copy voice, and a dump → slice → focus flow. The native surface executes that well.

Web has two separate problems. The **access layer was never designed**: overlays have no dialog semantics, focus trap, Escape, or restore; controls are focusable with nothing visible to show focus landed, or mouse-only; delete has no undo; a placeholder is doing a label's job; looping motion ignores reduced motion. And the **composition does not serve the work**: the first viewport is a pitch, not an instrument, and the list a user came for sits below it. The renders also revoke my earlier Intentionality score — nine simultaneous accents is not a considered palette, it is a spray. See the revision below.

Native is in much better shape: a live-region platform gap, web-only features amputated, an offline banner styled as an error, a blank-screen edge on boot, a checkmark drawn inside a radio, and a placeholder app icon.

**Primary recommendation:** `/design a11y` first, scoped to web. It clears every escalation trigger at once.

---

## Heuristic scores

| # | Vital | Web | Native | Key finding |
|---|---|---|---|---|
| 1 | Intentionality | **5** | 10 | Web: coherent palette and voice, but the composition buries the work and the accent is spread across nine elements per viewport. Native: chosen and well-composed. |
| 2 | Readability | 5 | 10 | Web: placeholder ~2.5:1, micro-labels ~4.2:1, declared typeface never renders. Native: HIG ramp, documented contrast, tabular numerals. |
| 3 | Usability | 5 | 5 | Web has no undo. Native confirms deletes but amputates web-only features. |
| 4 | Responsiveness | 5 | 10 | Web: nav hidden below `md`, sub-16px inputs zoom on iOS. Native: safe areas, insets, keyboard handling, 44pt targets. |
| 5 | Speed | 5 | 10 | Web: two unused render-blocking font families, eager confetti import. Native: skeleton loaders, live queries. |
| 6 | Accessibility | 0 | 5 | Web: multiple standing escalation triggers. Native: strong, but live regions never fire on iOS. |

Web **25 / 60** · Native **50 / 60**. Six vitals × 10 points (Healthy 10 / Watch 5 / Critical 0).

**Revision from the previous pass:** Intentionality for web moved 10 → 5, taking the web total 30 → 25. The earlier 10 measured only whether the surface looked authored rather than assembled, which it does. The renders show a second question — whether the composition serves the work — and on web it does not.

---

## Cognitive load / risk

- **PASS** — Native composition fits the work: dump → slice → list → focus, with the list owning the first screen.
- **PASS** — Category meaning is never color-only where categories are known; every hue carries a label.
- **PASS** — Native reduced motion is sound: confetti sets `disableForReducedMotion`, the skeleton uses `useReducedMotion`, and Reanimated's layout animations default to `ReduceMotion.System` (verified in the installed source).
- **PASS** — Native destructive actions are confirmed with `Alert.alert` on a `destructive` style.
- **WATCH** — Both surfaces run on 12–14px text; fine for a dense instrument, but it compounds the contrast failures.
- **FAIL** — **Web composition**: the first viewport is hero copy plus three pill rows plus two filter strips. The instrument is behind the pitch.
- **FAIL** — **Web access layer**: semantics, focus rings, names, and modal behavior are largely absent.

---

## Findings — web

| # | Severity | Discipline | Location | Before | After | Why |
|---|---|---|---|---|---|---|
| 1 | HIGH | Accessibility | `src/features/focus/focus/focus.tsx:28`, `src/features/unstick/unstick-me-modal/unstick-me-modal.tsx:61`, `src/features/tasks/task-list/partials/sort-modal.tsx:14` | `<div className="fixed inset-0 z-50 …">` with no role, no key handler, background not inert | `role="dialog" aria-modal="true" aria-labelledby=…`; `inert` on `<main>`; Escape closes; move focus in on open, return it to the trigger on close | The background stays tabbable, Escape does nothing, and screen readers are never told a dialog opened. Mouse walks a path the keyboard cannot. |
| 2 | HIGH | Accessibility | `quick-add-form.tsx:81` (no replacement); weak color-only replacement at `brain-dump-input.tsx:41`, `focus-parking-lot.tsx:36`, `task-search-controls.tsx:25,42`, `quick-add-form.tsx:27,39,50,65,90` | `focus:outline-none` with no visible indicator (number input) or a 1px border-color change only | `focus-visible:ring-2 focus-visible:ring-amber-400` — the pattern already used on the task checkbox at `task-card.tsx:48` | Tab can land on a field with nothing visible to show it landed. The border-only variant is also a color-only cue. |
| 3 | HIGH | Accessibility | `task-card-substeps.tsx:16-33` | `<div onClick={…}>` wrapping a `<button>` whose only child is a `text-transparent` icon | One `<button role="checkbox" aria-checked={sub.completed}>` named by the step text, or `<label>` + `<input type="checkbox">` | The clickable row is not focusable, and the inner button announces no name. |
| 4 | HIGH | Accessibility | `task-card-actions.tsx:72`, `focus-parking-lot.tsx:61`, `app-auth-status.tsx:55`, `app-header.tsx:75`, `focus-top-bar.tsx:54`, `unstick-me-modal.tsx:83`, `sort-modal.tsx:34` | Icon-only buttons whose only name is a `title` attribute | Add `aria-label` (e.g. `aria-label="Remove task"`) | `title` is not a reliable accessible name and never appears on touch. |
| 5 | HIGH | Accessibility | `brain-dump-input.tsx:38-41`, `task-search-controls.tsx:37-42`, `focus-parking-lot.tsx:32-36` | No visible label; placeholder carries the meaning. `placeholder-neutral-600` (#525252) on `neutral-950` ≈ **2.5:1** | Add a visible `<label>` (visually hidden where the design forbids it); lift placeholder to `placeholder-neutral-400` (~7:1) | A field whose placeholder is doing the label's job, plus text below the 3:1 floor. |
| 6 | HIGH | Accessibility | `app-hero-banner.tsx:34`, `brain-dump-voice-button.tsx:23,33`, `brain-dump-audio-status.tsx:25` | `animate-pulse` / `animate-ping` loops run unconditionally | `motion-reduce:animate-none` on each, or gate behind a `prefers-reduced-motion` check | Decorative motion that runs regardless of the user's motion preference. Add a global `@media (prefers-reduced-motion: reduce)` rule to prevent recurrence. |
| 7 | HIGH | Interaction | `task-card-actions.tsx:72`, `task-list-footer.tsx:44`, `focus-parking-lot.tsx:61` | `onClick={() => onDelete(task.id)}` / `onClearCompleted` fire immediately | Undo toast ("Task removed · Undo"), or a confirm sheet for Clear Completed | Irreversible with no confirmation, no undo, and nothing marking it apart from a safe action. Native already does this correctly. |
| 8 | MEDIUM | Responsiveness | `src/web-app/partials/app-nav.tsx:12` | `<nav className="hidden md:flex …">` with no mobile replacement | Bottom tab bar or header segmented control below `md` | The view switcher is amputated on phones. |
| 9 | MEDIUM | Responsiveness | `brain-dump-input.tsx:41`, `quick-add-form.tsx:27,39,50,65,81,90`, `task-search-controls.tsx:25,42`, `focus-parking-lot.tsx:36` | `text-xs` (12px) / `text-sm` (14px) on inputs, selects, textarea | `text-base` (16px) below `sm:` | iOS Safari auto-zooms on focus and breaks the layout for any field under 16px. |
| 10 | MEDIUM | Interaction | `status-filter-tabs.tsx:23,34,47,58,69`, `category-filter-strip.tsx:43,63`, `energy-sort-strip.tsx:47`, `task-search-controls.tsx:25,42,50` | `min-h-[36px]` / `min-h-[38px]` targets | Raise to 44px | Adjacent targets under 44px get mis-tapped on touch. |
| 11 | MEDIUM | Type | `app/+html.tsx:12` | Loads Plus Jakarta Sans + JetBrains Mono; `DESIGN_SYSTEM.md:56` specifies Inter; no `fontFamily` configured | Apply the loaded family in the Tailwind theme, or drop the request and document the real stack | The intended typeface never renders and two families load render-blocking for nothing. |
| 12 | MEDIUM | Color | `src/data/categories.ts:6-56` vs `DESIGN_SYSTEM.md:40-46` | Code: Work=Blue, Admin=Purple, Errands=Cyan, Creative=Pink | Reconcile doc and code to one source of truth | The documented palette and the shipped palette disagree. |
| 13 | LOW | Voice | `brain-dump-input/consts.ts:9-11`, `task-list/consts.ts`, `status-filter-tabs.tsx:41,64` | Emoji inside labels ("Low 🔋", "≤5m Wins", "Deep Focus 🚀") | Plain text labels; keep emoji to icon slots | Inconsistent cross-platform rendering and noisy screen-reader output. |
| 14 | LOW | Motion | `sort-modal.tsx:14` | `animate-in fade-in duration-150` | Remove, or add `tailwindcss-animate` | The plugin is not installed, so the entrance never runs. |
| 15 | LOW | Accessibility | `app-nav.tsx:15-24` | Active nav button styled amber + underline only, no programmatic state | Add `aria-current="page"` | Sighted users get the underline; assistive tech gets nothing. |
| 21 | MEDIUM | Layout | `src/web-app/app.tsx:53-96`, `src/web-app/partials/app-hero-banner.tsx`, `src/features/braindump/brain-dump-input/brain-dump-input.tsx` | First viewport at 1200–1440px = header, hero card with marketing copy, banner, composer with three pill rows, and two filter strips. The task list is only reachable after scrolling past all of it | Demote the hero to a compact stat line, move the composer behind a toggle or below the list, and let the task list own the first viewport | The artifact the user opens the app for sits behind a pitch. This is composition, not polish: the instrument is buried under chrome. |
| 22 | MEDIUM | Color | `app-header.tsx:44-78`, `app-nav.tsx`, `brain-dump-energy-control.tsx`, `brain-dump-area-filter.tsx`, `brain-dump-sparks.tsx`, `brain-dump-footer.tsx`, `category-filter-strip.tsx` | Amber carries the active nav item, Unstick Me, the hero eyebrow, the selected battery pill, the selected area pill, the selected spark, two section headers, and the primary submit — ~9 amber elements visible at once | Give amber one job, the single primary action per screen; move selection state to a neutral fill with an amber border or check | Accent should be roughly 10% of the surface. Nine simultaneous accents is why the page reads busy despite genuinely good text contrast. |
| 23 | LOW | Interaction | `unstick-me-modal.tsx:186-192` | "Pick Another" is `text-neutral-400` on `neutral-900` beside a solid amber primary | Raise to `text-neutral-200` with a visible border, matching secondary buttons elsewhere | The retreat action is materially weaker than the commit action, so the design nudges the user into the primary by contrast rather than by choice. |
| 24 | MEDIUM | Surface | `src/data/categories.ts:58-68`, rendered in `category-filter-strip.tsx` and `dopamine-tracker.tsx` | AI output produced categories outside the taxonomy ("Quick Win", "Focus Project"); both fall through `getCategoryStyle` to the neutral fallback and render with a gray dot and no hue | Constrain generated categories to the known taxonomy, or extend the palette deliberately and document it | Two of six categories in the momentum breakdown were unbranded, so the color-coding that carries the product's meaning silently stopped working. Corroborates the web task-validation work already planned. |

---

## Findings — native

| # | Severity | Discipline | Location | Before | After | Why |
|---|---|---|---|---|---|---|
| 16 | MEDIUM | Accessibility | `components/status-banner/status-banner.tsx:26`, `screens/main-screen/partials/main-composer.tsx:51`, `components/text-field/text-field.tsx:50`, `screens/focus/partials/focus-timer.tsx:40`, `screens/main-screen/partials/main-task-skeleton.tsx:23` | `accessibilityLiveRegion="polite"` / `"assertive"` only | Pair each with `AccessibilityInfo.announceForAccessibility(...)` | RN declares `accessibilityLiveRegion` in `AccessibilityPropsAndroid`, so iOS never announces the error banner, inline field error, listening state, or skeleton. The codebase already uses the correct iOS path elsewhere (`main-screen/hooks.ts:46`, `unstick/hooks.ts:30`, `onboarding/hooks.ts:18`) — the error and status paths were missed. A failed async action produces no feedback for a screen-reader user on iOS. |
| 17 | MEDIUM | Surface | `components/task-card-mobile.tsx`, `screens/main-screen/main-screen.tsx` | Native card = complete + Start focus + delete; no substeps, no "Break down further"; no momentum view; no manual add | Port the substep checklist and the breakdown action; add the momentum ledger and quick-add | Same product loses capability on native. Adapt the interface, never amputate the feature. |
| 18 | LOW | Voice | `components/status-banner/status-banner.tsx:27,32` | `tone="offline"` still renders `bg-danger-muted border border-danger` + `text-danger-text` | Give offline a neutral or amber tone | Offline is transient, not a failure. Red overstates it. |
| 19 | LOW | Interaction | `screens/main-screen/main-screen.tsx:36`, `components/app-provider/app-provider.tsx:23` | `if (app.onboardingComplete === null) return null` while the splash is force-hidden after `SPLASH_MAX_MS` (4000ms) | Render a minimal loading state instead of `null` | If auth or storage hangs past 4s, the splash goes away and the user sees an empty canvas with no feedback. |
| 20 | LOW | Interaction | `components/option-row/option-row.tsx:31,35` | Selected radio renders a filled amber circle containing a `<Check>` glyph | Draw a dot for `role="radio"`; keep the check glyph for `role="checkbox"` | The circle shape says "radio", the checkmark says "confirmed". Two metaphors in one control, visible in the sort sheet. |
| 21 | LOW | Surface | `assets/icon.png`, `assets/adaptive-icon.png` | Both 628 bytes; `icon.png` is a flat `#F5B800` square with no mark, no text, square corners. `splash-icon.png` is properly designed (black field, amber sparkle, wordmark) | Design the app icon and adaptive foreground to match the splash mark | Every install shows a blank amber tile. This is the 6:50 capture: the icon during the launch transition, not a render bug. |

---

## Considered but rejected

| Location | Candidate | Rejected because |
|---|---|---|
| Web renders, all captures | "No visible focus rings" as confirming finding 2 | Nothing was focused in any capture, so a static screenshot cannot show a focus ring either way. Finding 2 rests on source, not on these renders. |
| `screens/main-screen/partials/main-task-list.tsx:35-37,65` | Ungated list motion (`FadeInDown`, `FadeOut`, `FadeIn`, `LinearTransition`) ignoring reduced motion | **Verified false.** Reanimated's `BaseAnimationBuilder` defaults to `ReduceMotion.System` (`BaseAnimationBuilder.js:8`) and `getReduceMotionFromConfig` resolves `System` to the live system value (`animation/util.js:71-75`), so these animations already honor the OS setting. |
| `screens/focus/partials/focus-timer.tsx:30` | Invalid `accessibilityRole="timer"` | **Verified valid.** `timer` is in RN 0.76's `AccessibilityRole` union (`ViewAccessibility.d.ts:216`). |
| `components/task-card-mobile.tsx:47` | Completed card bounded only by the decorative `divider` token | "Done" is also carried by line-through, tertiary text, and an accessible `", done"` label. |
| `src/data/categories.ts`, `dopamine-tracker.tsx` | Category hues and progress bars carrying meaning by color | Every hue sits beside a text label or a `completed/total (%)` figure. |
| `task-list/consts.ts:83`, `focus/consts.ts` | Confetti as decorative motion | Already guarded with `disableForReducedMotion: true`. |
| `brain-dump-footer.tsx:39`, `unstick-me-modal.tsx:124` | `animate-spin` loaders | Progress indication, not decorative or vestibular motion. |
| Web hero card | The ambient smoke image as a speed problem | It renders and is absolutely positioned inside a padded container, so it costs no layout shift. |
| All body copy | Web 12–14px base text | Consistent with the dense instrument register; the real defects are contrast and zoom, reported separately. |

---

## Verification

**Checks run**

- Read the full web UI implementation (shell, header/nav/footer, hero, brain dump, task list and partials, focus, unstick, momentum, tokens) and the full native UI (`screens/*`, `components/*`, `app/*` routes, `app.json`, app-provider).
- `grep` for reduced-motion / `animate-*`: web has 7 unconditional animations and 0 guards; native guards in the skeleton and onboarding pager.
- `grep` for `focus:outline-none` / `focus-visible` / `role=` / `aria-*` / keydown / `Escape`: web has 10 outline removals, 1 focus-visible ring, 0 dialog roles, 0 key handlers.
- `grep` for native `accessibilityLiveRegion` / `AccessibilityInfo` — the prop is used in 5 places, the iOS announcement API in 3 others.
- Read RN's `ViewAccessibility.d.ts` to confirm `accessibilityLiveRegion` is Android-only and `timer` is a valid role.
- Read Reanimated's `BaseAnimationBuilder.js`, `animation/util.js`, `ReducedMotion.js` for the reduce-motion default.
- `grep` for `substeps` / `breakdown` / `momentum` / `quick-add` across `screens/` — confirmed native omits them.
- Computed WCAG contrast for the flagged web tokens against their surfaces.
- **Native: four simulator captures examined** (main screen, sort sheet, boot state, OAuth error).
- **Web: seven browser captures examined** at ~1200–1440px (workspace at two task counts, task list with momentum ledger, Focus modal, Unstick modal in both states).
- Read `assets/icon.png` and `assets/splash-icon.png` directly to identify the 6:50 capture.

**Not verified**

- **Web at narrow widths.** No capture below ~1200px, so findings 8, 9, and 10 remain source-only: the `md` nav breakpoint, the sub-16px iOS focus-zoom, and the sub-44px targets have not been seen rendered.
- **Focus visibility.** No capture has a focused element, so finding 2 is unreproduced visually.
- **Web states**: empty, loading, and error states below the fold were not captured.
- Native runtime behaviour was not exercised: VoiceOver/TalkBack output and live-region behaviour remain gaps.

---

## Next modes

Sequenced, not parallel:

1. **Sign-in** — `Error 400: invalid_request` (OAuth client) plus `auth/unauthorized-domain` (Firebase Auth console). Functional, outside design scope, but gates everything behind auth.
2. **`/design a11y`** — web findings 1–6 and native finding 16. The escalation triggers, which a redesign will not fix.
3. **`/design smell`**, web and native — name what is wrong before repainting, now with renders to point at rather than inference.
4. **`/design redesign`**, web first, fed by this report and the smell report. Findings 21 and 22 are the brief: the list owns the first viewport, the accent gets one job. Native is not a redesign target; it needs `/design surface` for findings 17, 18, 20, 21.
5. **`/design finish`** as the pre-ship pass.

`/design deslop` is redundant once a full redesign is on the table.

**Verdict: Block** — web has seven HIGH escalation triggers standing, plus a broken sign-in and a composition that buries the work. Native has no HIGH; findings 16, 17, 20, and 21 close it to shippable.
