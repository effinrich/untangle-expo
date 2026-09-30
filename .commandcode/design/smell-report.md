# Untangle — Smell Report

- **Mode:** smell (report only, no fixes applied)
- **Pass:** second. Re-audited after the checkup and the first smell pass.
- **Register:** Product
- **Scope:** Web UI in `src/` (React DOM + Tailwind v4) and native UI in `screens/` + `components/` (React Native + NativeWind)
- **Score:** **2 / 10** — inverted: 10 is clean
- **Verdict:** **IDENTITY FAILURE**

> Smell never executes a mode. It names the odor and picks the tool. Fixes happen when you run `/design redesign`, `/design typeset`, `/design relayout`, `/design recolor`, `/design interaction`, or `/design writing`.

---

## What changed on this pass

The score is unchanged, because it was already in the bottom band. The **count of distinct tells went from 7 to 11**: the first pass missed the hero imagery, the pill saturation, the uppercase micro-label reflex, the vendor name-dropping, and it **understated the type problem** by roughly half (90 declarations at `text-xs` was only the half a class-name grep can see; hand-rolled sizes bring it to 131).

---

## TL;DR

**Dominant smell: the median generated dashboard.** A centred column of equal rounded panels, one type size almost everywhere, unfocused depth applied as blur, and every concept given its own card, its own proper noun, and its own row of pills. Competent, coherent, and it could have come from any prompt.

**Root reflex: enumeration instead of composition.** If there is a feature it gets a rounded panel and a label. The page substitutes listing for structure, which is why nothing is subordinate to anything else and there is no rhythm to find.

**The counterweight, unchanged and still true:** the palette and the copy voice are real project decisions. Obsidian plus a single amber accent is not the domain's reflex, there is no blue-violet anywhere, and the no-guilt ADHD voice belongs to this product alone. Two of the seven decisions the catalog asks for are present. The other five default.

**Recommended tool: `redesign`, not repair.** Composition, type and depth all default at once, and the catalog is explicit that clustered smell is a direction change rather than a patch.

---

## Tracked odors

Each row scores **1** if the odor is absent, **0** if detected.

| # | Odor | Score | Evidence |
|---|---|---|---|
| 1 | Tech gradient | **1** | One gradient in the entire app, and it is a neutral scrim. No blue-violet, no purple-to-teal. |
| 2 | Generic tech hue | **1** | Identity is amber on obsidian. The blue/purple/cyan in the category set is coding, not identity. |
| 3 | Feature tile grid | **0** | The momentum triptych: three equal icon + label + number cards in `grid-cols-3` (`dopamine-tracker.tsx:65-105`), then the same card repeated per category below (`:120-150`). |
| 4 | Accent rail | **1** | No side stripes. Every border is a full perimeter. |
| 5 | Unearned blur | **0** | **Nine** `backdrop-blur` panels on a flat canvas with nothing behind them to blur: header, composer, category strip, energy strip, filter bar, sort sheet, both modal overlays. |
| 6 | Stat monument | **0** | The hero's "Quick Stats" block: three oversized numbers filling the right half of the hero where a product story belongs (`app-hero-banner.tsx:49-72`). |
| 7 | Icon topper | **0** | A 112px rounded icon badge above every onboarding title (`onboarding-page.tsx:24-30`), same reflex at 40px in the empty state (`task-list-empty-state.tsx:16-20`). |
| 8 | Bounce everywhere | **1** | No elastic or spring easing. Five press-scales total. Marked as a suspicion below, not counted. |
| 9 | Default type | **0** | The declared face never renders: Inter specified, Plus Jakarta Sans and JetBrains Mono loaded, no `fontFamily` configured, so the system stack wins while two families load for nothing. No scale: **131 of ~165 size declarations are 12px or smaller** (90 `text-xs`, plus 30 at `text-[11px]` and 11 at `text-[10px]`). Plus 8 uppercase tracked micro-labels and 5 corner radii across 100 declarations. |
| 10 | Center stack | **0** | One centred `max-w-6xl` column of full-width stacked panels, header to footer. No asymmetry, no pacing, no composition decision. |

**Tracked odors detected: 6.** Plus five additional confirmed tells → **11 tells**, in the `7+` band.

---

## Findings

| # | Severity | Discipline | Location | Before | After | Why |
|---|---|---|---|---|---|---|
| 1 | HIGH | Accessibility | `brain-dump-input.tsx:38-41`, `task-search-controls.tsx:37-42`, `focus-parking-lot.tsx:32-36` | Placeholder carrying the label at ≈ **2.5:1** | Visible `<label>`; placeholder at `neutral-400` (~7:1) | Generated patterns and access failures travel together. |
| 2 | HIGH | Accessibility | `task-card-actions.tsx:72`, `focus-parking-lot.tsx:61`, `app-auth-status.tsx:55`, `app-header.tsx:75`, `focus-top-bar.tsx:54`, `unstick-me-modal.tsx:83`, `sort-modal.tsx:34` | Seven icon-only buttons named only by `title` | `aria-label` on each | An unnamed icon button is the generated-app reflex exactly. |
| 3 | HIGH | Accessibility | `quick-add-form.tsx:81` (no replacement), plus color-only replacement at `brain-dump-input.tsx:41`, `focus-parking-lot.tsx:36`, `task-search-controls.tsx:25,42`, `quick-add-form.tsx:27,39,50,65,90` | `focus:outline-none` with no visible indicator, or a border tint alone | `focus-visible:ring-2 focus-visible:ring-amber-400` | Stripping the platform focus ring is the most common generated-component habit. |
| 4 | HIGH | Accessibility | `task-card-substeps.tsx:16-33` | `<div onClick>` wrapping an unnamed icon `<button>` | One `<button role="checkbox" aria-checked>` named by the step text | A clickable div is a template artefact: it looks like a checkbox and is not one. |
| 5 | MEDIUM | Layout | `app.tsx:53-96`, `app-hero-banner.tsx`, `dopamine-tracker.tsx:65-105,120-150` | Equal rounded panels stacked in one column; three metric cards of identical weight, then the same card again per category | One dominant list; metrics subordinate and compact; breakdown as data rather than as more cards | Every card equal, nothing prioritized. The feature-tile reflex wearing a product's clothes. |
| 6 | MEDIUM | Depth | 9 sites: `app-header.tsx:2`, `brain-dump-input.tsx:23`, `category-filter-strip.tsx`, `energy-sort-strip.tsx`, `sort-modal.tsx:14`, `focus.tsx:28`, `unstick-me-modal.tsx:61` | `backdrop-blur-sm` / `-md` over a flat canvas | Remove where nothing is behind it; commit to one elevation treatment | Blur implying depth the surface never earned. |
| 7 | MEDIUM | Layout | `app-hero-banner.tsx:49-72` | Three oversized numbers in a rounded box filling half the hero | Fold the counts into the list header, one compact line, or cut them | A stat monument occupies the exact space where the first real object should be. |
| 8 | MEDIUM | Type | `app/+html.tsx:12`, `src/index.css`, all of `src/` | Declared face never applied; two families loaded unused; **131 of ~165 size declarations ≤12px**; 8 uppercase tracked micro-labels; 5 radii across 100 declarations; 14 spacing values | One family applied; real steps so hierarchy comes from size; one radius per role; retire the uppercase micro-label | The catalog asks for "type with a reason". This is type without one, and the hand-rolled 10px/11px sizes are 41 separate decisions that no scale governs. |
| 9 | MEDIUM | Composition | `category-filter-strip.tsx`, `energy-sort-strip.tsx`, `status-filter-tabs.tsx:21-72`, `brain-dump-sparks.tsx`, `brain-dump-area-filter.tsx`, `brain-dump-energy-control.tsx` | **Pill saturation.** 13 `rounded-full` declarations, but each sits inside a `.map()`, so a first load renders roughly **30 pill-shaped controls** of near-identical weight before a single task appears | Replace the chip rows with one real filter surface: a single control that holds state, count and selection, rather than five rows of equally-weighted pills | The main skill is explicit that pill buttons are not a house style, only a valid answer when the pattern suits the work. Five competing pill rows is the reflex. |
| 10 | MEDIUM | Imagery | `app-hero-banner.tsx:14-24`, `public/images/calm-focus-ambient.jpg` | An abstract 1376×768 smoky stock photograph, **561 KB**, behind the hero at 20% opacity and unreadable | Cut it, or replace it with material that belongs to the domain: the shape of a task coming apart, the actual artifact | The catalog asks for "imagery tied to the subject". This image says nothing about ADHD decomposition, and half a megabyte of decoration loads before the first task. |
| 11 | MEDIUM | Layout | `onboarding-page.tsx:24-30`, `task-list-empty-state.tsx:16-20` | Rounded icon badge above every repeated heading | Drop the badge, or keep only the instance that carries meaning | An icon above a heading that already names itself fills a template slot. |
| 12 | MEDIUM | Layout | `app.tsx:41-104` | Centred `max-w-6xl` column, full-width panels, header to footer | Choose a composition: the list owns the first viewport, chrome subordinates or collapses | Centred is correct when symmetry is the lane. Here it is the default. |
| 13 | LOW | Voice | `brain-dump-input/consts.ts:9-11`, `task-list/consts.ts`, `status-filter-tabs.tsx:41,64` | Emoji as icon and inside labels: 8 distinct strings | Plain labels; keep emoji to real icon slots | The cheapest way to make a label look designed, and it renders differently everywhere. |
| 14 | LOW | Writing | `app-footer.tsx:12`, `app-hero-banner.tsx:43`, `brain-dump-voice-button.tsx:12`, `brain-dump-audio-status.tsx:41`, `brain-dump-header.tsx:20` | Vendor names and version numbers in user-facing copy, six sites: "Gemini 3.8 Flash & Gemini 3.5 Transcribe" | Say what it does, not what it runs on: "transcribed by AI" or nothing at all | Implementation detail sold as product story. The version pairing is also inconsistent between footer and hero, which is what invented version numbers look like. |
| 15 | LOW | Layout | `task-list-empty-state.tsx:14` | `border-dashed` empty-state panel | A solid treatment consistent with the system | Dashed means "drop zone". Used decoratively it reads as an unfinished placeholder. |

---

## What is genuinely not a smell

Reported so restraint is visible, not assumed.

| Candidate | Judgement |
|---|---|
| Obsidian canvas + single amber accent | **A real decision.** Not the domain's reflex, which would be white and teal for wellbeing or blue-violet for software. Satisfies "a colour strategy that is not the domain's first reflex". |
| The no-guilt ADHD copy voice | **A real decision.** "Claim Dopamine", "Zero Guilt Guarantee", "if you still want to quit after 120 seconds you are free to stop". Impossible on a generic task app. The strongest project-specific thing on the surface. |
| No blue-violet, no indigo-cyan gradient, no accent rails | Absent, confirmed by grep rather than assumed. Credited. |
| Universal `active:scale-95` press feedback | **Suspicion only.** No elastic easing anywhere, five occurrences. Not counted. |
| Proper-noun inflation ("One Thing Radar", "Thought Parking Lot", "The Spark") | **Suspected, not confirmed.** ~10 branded names for ordinary concepts is naming doing work structure should do. Flagged for the redesign to decide, not scored. |
| The `·` middot metadata separators | **Not a smell.** `DESIGN_SYSTEM.md` calls for zero-pill metadata deliberately, and it reads cleanly in the render. A real decision with a reason. |

---

## Verification

**Checks run**

- Read `references/smell.md` and audited against all ten tracked odors, twice.
- `grep` `bg-gradient-to-*`: **1**, a neutral scrim. Tech gradient confirmed absent.
- `grep` `backdrop-blur-*`: **9**.
- `grep` `rounded-*`: **100** declarations across **5** radii. `rounded-full`: **13**.
- `grep` `uppercase tracking-*`: **8**.
- `grep` `text-\[[0-9]+px\]`: **30** at `text-[11px]` and **11** at `text-[10px]`, none visible to a class-name grep for the standard scale.
- `grep` interactive elements: **61** `button`, 7 `input`, 4 `select`, 1 `textarea`.
- `grep` vendor names in copy: **6** sites.
- `sips` on `public/images/calm-focus-ambient.jpg`: **1376 × 768**, **561 KB**.
- Carried forward from the checkup: 14 spacing values, amber at 0.18% of the page.

**Not verified**

- Web at narrow widths was never rendered, so no judgement here covers the mobile-web composition.
- The vision tool was unavailable for the last capture; no smell in this report rests on that screenshot's appearance, only on its measurements.
- The pill count of ~30 is derived from loop sizes over the seed data, not a rendered count. Treat it as an estimate; the shape of the finding does not depend on the exact number.

---

## Next modes

- **`/design redesign`** — primary. Composition, type, depth, imagery and the card reflex default together.
- **`/design typeset`** — inside the redesign. One family actually applied, real steps, hierarchy from size.
- **`/design relayout`** — inside the redesign. The list owns the first viewport; five pill rows collapse into one filter surface.
- **`/design a11y`** — findings 1-4 are escalation triggers and clear regardless of direction.
- **`/design interaction`** — the completion race and the missing rhythm, per the checkup.

Deliberately not recommended: `/design recolor`. Colour is the one system already making a project-specific decision.

**Verdict: IDENTITY FAILURE** — eleven tells, six of them tracked odors, clustering in composition, type, depth and imagery at once.
