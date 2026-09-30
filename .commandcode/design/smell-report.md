# Untangle — Smell Report

- **Mode:** smell (report only, no fixes applied)
- **Register:** Product
- **Scope:** Web UI in `src/` (React DOM + Tailwind v4) and native UI in `screens/` + `components/` (React Native + NativeWind)
- **Score:** **2 / 10** — inverted: 10 is clean
- **Verdict:** **IDENTITY FAILURE**

> Smell never executes a mode. It names the odor and picks the tool. Fixes happen when you run `/design redesign`, `/design typeset`, `/design relayout`, `/design recolor`, `/design interaction`, or `/design writing`.

---

## TL;DR

**Dominant smell: the median generated dashboard.** A centred column of equal rounded panels, one type size almost everywhere, unfocused depth applied as blur, and every concept given its own card, its own proper noun, and its own row of pills. It is competent and it is coherent, and it could have come from any prompt.

**Root reflex: enumeration instead of composition.** If there is a feature, it gets a rounded panel and a label. The page substitutes *listing* for *structure*, which is why nothing is subordinate to anything else and why there is no rhythm to find.

**The honest counterweight:** the palette and the copy voice are genuine project decisions. Obsidian canvas plus a single amber accent is not the domain's first reflex, there is no blue-violet, and the no-guilt ADHD voice is specific to this product. Two of the seven real decisions the catalog asks for are present. The other five default.

**Recommended tool: `redesign`, not repair.** Composition, type, and depth all default at once. The catalog is explicit that clustered smell in several systems at once is a direction change rather than a patch.

---

## Tracked odors

Each row scores **1** if the odor is absent, **0** if detected.

| # | Odor | Score | Evidence |
|---|---|---|---|
| 1 | Tech gradient | **1** | One gradient in the entire app, and it is a neutral scrim (`bg-gradient-to-r from-neutral-950 …`). No blue-violet, no purple-to-teal. |
| 2 | Generic tech hue | **1** | Identity is amber on obsidian. The blue/purple/cyan in the category set is coding, not identity. |
| 3 | Feature tile grid | **0** | The momentum triptych: three equal icon + label + number + sub-label cards in `grid-cols-3` (`dopamine-tracker.tsx:65-105`). Below it, an identical card repeated per category in another 3-col grid (`:120-150`). Every card equal, nothing prioritized. |
| 4 | Accent rail | **1** | No side stripes. Every border is a full perimeter. |
| 5 | Unearned blur | **0** | **Nine** `backdrop-blur` applications on panels that sit on a flat canvas with nothing behind them to blur: the sticky header (`app-header.tsx:2`), the composer (`brain-dump-input.tsx:23`), the category strip, the energy strip, the filter bar, the sort sheet overlay, and both modal overlays. Frosted glass because no depth system was committed to. |
| 6 | Stat monument | **0** | The hero's "Quick Stats" block: three oversized numbers in a dark rounded box filling the right half of the hero where a product story belongs (`app-hero-banner.tsx:49-72`). |
| 7 | Icon topper | **0** | A 112px rounded icon badge above every onboarding title (`onboarding-page.tsx:24-30`), and the same reflex at 40px in the empty state (`task-list-empty-state.tsx:16-20`). Decoration standing in for an entrance. |
| 8 | Bounce everywhere | **1** | No elastic or spring easing anywhere. Only five press-scales (`active:scale-95` ×3, `[0.99]`, `[0.98]`). Marked as a suspicion below, not counted. |
| 9 | Default type | **0** | Two failures stacked. The declared typeface never renders: `DESIGN_SYSTEM.md:56` specifies Inter, `app/+html.tsx:12` loads Plus Jakarta Sans and JetBrains Mono, and no `fontFamily` is configured anywhere, so the surface falls back to the system stack while still paying for two render-blocking families. And there is no scale: **90 of ~124 text-size declarations are `text-xs`**. |
| 10 | Center stack | **0** | One centred `max-w-6xl` column of full-width stacked panels from header to footer. No asymmetry, no pacing, no composition decision. |

**Tracked odors detected: 6.** Plus one systemic tell outside the tracked ten (emoji as icon), giving **7 tells** → the `7+` band.

---

## Findings

| # | Severity | Discipline | Location | Before | After | Why |
|---|---|---|---|---|---|---|
| 1 | HIGH | Accessibility | `brain-dump-input.tsx:38-41`, `task-search-controls.tsx:37-42`, `focus-parking-lot.tsx:32-36` | Placeholder carrying the label, `placeholder-neutral-600` ≈ **2.5:1** | Visible `<label>`; placeholder at `neutral-400` (~7:1) | Generic patterns and access failures travel together. A placeholder-only field is the reflex, and it is also the failure. |
| 2 | HIGH | Accessibility | `task-card-actions.tsx:72`, `focus-parking-lot.tsx:61`, `app-auth-status.tsx:55`, `app-header.tsx:75`, `focus-top-bar.tsx:54`, `unstick-me-modal.tsx:83`, `sort-modal.tsx:34` | Seven icon-only buttons named only by `title` | `aria-label` on each | An unnamed icon button is the generated-app reflex exactly. |
| 3 | HIGH | Accessibility | `quick-add-form.tsx:81` (none), plus color-only replacement at `brain-dump-input.tsx:41`, `focus-parking-lot.tsx:36`, `task-search-controls.tsx:25,42`, `quick-add-form.tsx:27,39,50,65,90` | `focus:outline-none` with no visible indicator, or a border tint alone | `focus-visible:ring-2 focus-visible:ring-amber-400` | Stripping the platform focus ring is the most common generated-component habit. |
| 4 | HIGH | Accessibility | `task-card-substeps.tsx:16-33` | `<div onClick>` wrapping an unnamed icon `<button>` | One `<button role="checkbox" aria-checked>` named by the step text | A clickable div is a template artefact: it looks like a checkbox and is not one. |
| 5 | MEDIUM | Layout | `app.tsx:53-96`, `app-hero-banner.tsx`, `dopamine-tracker.tsx:65-105,120-150` | Equal rounded panels stacked in one centred column; the 3-card triptych gives "Checked Off", "Minutes in Flow" and "Quick Wins" identical weight; then the same card again per category | Compose around the work: one dominant list, secondary metrics subordinate and compact, breakdown as data rather than as more cards | Every card equal, nothing prioritized. This is the feature-tile reflex wearing a product's clothes. |
| 6 | MEDIUM | Depth | 9 sites, incl. `app-header.tsx:2`, `brain-dump-input.tsx:23`, `category-filter-strip.tsx`, `energy-sort-strip.tsx`, `sort-modal.tsx:14`, `focus.tsx:28`, `unstick-me-modal.tsx:61` | `backdrop-blur-sm` / `backdrop-blur-md` on panels over a flat canvas | Remove it where nothing is behind it. Commit to one elevation treatment: border, or shadow, not both, and not blur as a substitute | Blur is being used to imply depth the surface never earned. Nothing is actually behind these panels. |
| 7 | MEDIUM | Layout | `app-hero-banner.tsx:49-72` | Three oversized numbers in a rounded box filling half the hero | Fold the counts into the list header as one compact line, or cut them | A stat monument occupies the exact space where the product's first real object should be. |
| 8 | MEDIUM | Layout | `onboarding-page.tsx:24-30`, `task-list-empty-state.tsx:16-20` | Rounded icon badge above every repeated heading | Drop the badge, or make the one instance that matters carry meaning | An icon above a heading that already says what it is fills a template slot and nothing else. |
| 9 | MEDIUM | Type | `app/+html.tsx:12`, `DESIGN_SYSTEM.md:56`, `src/index.css`, all of `src/` | Declared face never applied; two families loaded and unused; 90/124 declarations at `text-xs`; five corner radii across 100 declarations; 14 distinct spacing values | Pick one family and apply it; give the scale real steps so hierarchy comes from size; one radius per role | Type with no reason, scale with no steps, spacing with no rhythm. The catalog asks for "type with a reason" and this is type without one. |
| 10 | MEDIUM | Layout | `app.tsx:41-104` | Centred `max-w-6xl` column, full-width panels, header to footer | Choose a composition: the list owns the first viewport, chrome subordinates or collapses | Centred is not wrong when symmetry is the lane. Here it is the default because no composition decision was made. |
| 11 | LOW | Voice | `brain-dump-input/consts.ts:9-11`, `task-list/consts.ts:8-41`, `status-filter-tabs.tsx:41,64` | Emoji used as icon and inside labels: 8 distinct strings ("Low 🔋", "Medium ⚡", "Hyperfocus 🚀", "🔋 Low Energy First", "🚀 Hyperfocus First", "⚡ Quick Wins First", "🔥 Priority First", "🕒 Newest First") | Plain labels; keep emoji to real icon slots or drop them | Emoji is the cheapest way to make a label look designed, and it renders differently on every platform. |
| 12 | LOW | Layout | `task-list-empty-state.tsx:14` | `border-dashed` empty-state panel | A solid treatment consistent with the rest of the system | Dashed means "drop zone". Used decoratively it reads as a placeholder that was never finished. |

---

## What is genuinely not a smell

Reported so restraint is visible, not assumed.

| Candidate | Judgement |
|---|---|
| Obsidian canvas + single amber accent | **A real decision.** Not the domain's first reflex (which would be white/teal for a wellbeing product, or blue-violet for software). The catalog's "color strategy that is not the domain's first reflex" is satisfied. |
| The no-guilt ADHD copy voice ("Claim Dopamine", "Zero Guilt Guarantee", "Neuro-rule: if you still want to quit after 120 seconds you are free to stop") | **A real decision.** Specific, opinionated, and impossible to imagine on a generic task app. This is the strongest project-specific thing on the surface. |
| No blue-violet, no indigo-cyan gradient, no accent rails | Absent. Credited rather than ignored. |
| Universal `active:scale-95` press feedback | **Suspicion only.** No elastic easing anywhere, and five occurrences is not "everywhere". Not counted as a tell. |
| Proper-noun inflation ("One Thing Radar", "Thought Parking Lot", "Sparks", "The Spark", "Momentum Ledger", "Executive Dysfunction Reset") | **Suspected tell, not confirmed.** The voice is real, but ~10 branded names for ordinary concepts is naming doing the work that structure should do. Flagged for the redesign to decide, not scored. |

---

## Verification

**Checks run**

- Read `references/smell.md` and audited the surface against all ten tracked odors.
- `grep` for `bg-gradient-to-*`: **1** result, a neutral scrim. Tech gradient absent, confirmed rather than assumed.
- `grep` for `backdrop-blur-*` across `src/`: **9** (6 `sm`, 3 `md`).
- `grep` for `rounded-*` across `src/`: **100** declarations across **5** distinct radii.
- `grep` for emoji inside quoted label strings: **8** distinct strings.
- `grep` for `active:scale-*`: **5** occurrences.
- Prior measurement carried forward from the checkup: **14** distinct spacing values, **90 of ~124** text-size declarations at `text-xs`, pure amber at **0.18%** of the page.
- Read the checkup report at `.commandcode/design/checkup-report.md` and re-used its escalation triggers, as smell carries them.

**Not verified**

- Web at narrow widths was never rendered, so no smell judgement here covers the mobile-web composition.
- The vision tool was unavailable for the last capture; no smell in this report rests on the full-page screenshot's appearance, only on its measurements.

---

## Next modes

- **`/design redesign`** — primary. Composition, type, and depth default together, and the catalog is explicit that clustered smell is a direction change, not a patch.
- **`/design typeset`** — inside the redesign. One family actually applied, real steps, hierarchy from size.
- **`/design relayout`** — inside the redesign. The list owns the first viewport; chrome subordinates.
- **`/design a11y`** — findings 1-4 are escalation triggers and should clear regardless of direction.
- **`/design interaction`** — the completion race and the missing rhythm, per the checkup.

Deliberately not recommended: `/design recolor`. The colour is the one system already making a project-specific decision.

**Verdict: IDENTITY FAILURE** — seven tells, six of them tracked odors, clustering in composition, type, and depth at once.
