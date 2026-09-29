# Untangle Design System (ADHD-First & Universal)

> **Core Thesis:** Cognitive friction is the enemy of executive function. The design system rejects clutter, moralizing productivity cliches (red overdue badges, shame streaks), and dense unchunked text. Every visual element exists to **lower cognitive initiation barriers** and **deliver immediate dopamine upon physical action**.

---

## 1. Brand Identity & The Untangled Emblem

### The Logo Concept: _"From Knot to Vector"_

- **Symbolism**: The logo consists of a continuous, fluid ribbon line that begins as a tangled, dense cognitive loop on the left (the overwhelmed mind) and seamlessly resolves and straightens out into a luminous, linear golden trajectory on the right, punctuated by an action spark (`✦`).
- **Assets**: No logo component or master image is checked in yet. The header (`src/web-app/partials/app-header.tsx`) renders the text wordmark only.
- **Wordmark**: `Untangle` in `font-bold tracking-tight`, accompanied by the neutral subheading `ADHD Brain Dump & Priority Areas`.

---

## 2. Color Architecture: Obsidian & Solar Dopamine

The palette uses a deeply restorative **Obsidian Dark** background to reduce sensory overload and eye fatigue, accented by **Solar Amber** for dopamine triggers.

### Base Canvas (Sensory Soothing)

| Token            | Hex         | Tailwind Class        | Role                             |
| :--------------- | :---------- | :-------------------- | :------------------------------- |
| `surface-canvas` | `#0a0a0a`   | `bg-neutral-950`      | Primary viewport backdrop        |
| `surface-card`   | `#171717`   | `bg-neutral-900/80`   | Card elevation, modals, inputs   |
| `surface-inner`  | `#0f0f0f`   | `bg-neutral-950/90`   | Sub-step containers, code blocks |
| `border-subtle`  | `#262626`   | `border-neutral-800`  | Quiet component separators       |
| `border-accent`  | `#fbbf2433` | `border-amber-400/20` | Active focal borders             |

### Solar Dopamine & Energy Accents

| Token          | Hex       | Tailwind Class                        | Role                                         |
| :------------- | :-------- | :------------------------------------ | :------------------------------------------- |
| `solar-spark`  | `#fbbf24` | `text-amber-400` / `bg-amber-400`     | Primary action triggers, the 1st step spark  |
| `solar-glow`   | `#f59e0b` | `text-amber-500`                      | Hover states, focus rings                    |
| `battery-low`  | `#34d399` | `text-emerald-400` / `bg-emerald-500` | Low Energy (🔋 Near-zero cognitive friction) |
| `battery-med`  | `#fbbf24` | `text-amber-400` / `bg-amber-500`     | Medium Energy (⚡ Standard tasks)            |
| `battery-high` | `#f87171` | `text-rose-400` / `bg-rose-500`       | Hyperfocus (🚀 Complex synthesis)            |

### Priority Areas Palette (Zero-Confusion Color Coding)

Every category has a dedicated hue with subtle 10% opacity backdrops and crisp borders:

- **Work 💼**: Indigo (`#818cf8`, `bg-indigo-500/10`, `border-indigo-500/30`)
- **Personal 🏠**: Amber (`#fbbf24`, `bg-amber-500/10`, `border-amber-500/30`)
- **Health 💚**: Emerald (`#34d399`, `bg-emerald-500/10`, `border-emerald-500/30`)
- **Finance / Admin 📊**: Sky (`#38bdf8`, `bg-sky-500/10`, `border-sky-500/30`)
- **Errands 🛒**: Violet (`#a78bfa`, `bg-violet-500/10`, `border-violet-500/30`)
- **Creative 🎨**: Fuchsia (`#e879f9`, `bg-fuchsia-500/10`, `border-fuchsia-500/30`)

---

## 3. Typographic Hierarchy

- **Font Family**: Inter, system sans-serif font stack with high x-height for scannability.
- **Numbers & Durations**: Always `font-mono tabular-nums` (e.g., `4m`, `15m`, `12/15 micro-steps`) so executive working memory does not strain to compare time blocks.

| Role               | Style                                                                 | Use Case                         |
| :----------------- | :-------------------------------------------------------------------- | :------------------------------- |
| **Headline 1**     | `text-2xl` to `text-3xl font-bold tracking-tight text-neutral-100`    | Hero viewport statement          |
| **Section Header** | `text-base font-semibold text-neutral-200`                            | Brain Dump, Micro-Task list      |
| **Task Title**     | `text-sm font-semibold text-neutral-100 leading-snug`                 | Action step title                |
| **Physical Step**  | `text-xs text-neutral-300 font-normal leading-relaxed`                | Immediate physical micro-action  |
| **Micro-Label**    | `text-[10px]` or `text-[11px] font-semibold uppercase tracking-wider` | Section categories, battery cues |

---

## 4. Component Standards

### 1. The ADHD Spark Card (`TaskCard`)

- **Checkbox**: 20x20px tactile button with emerald checkmark on click.
- **Physical Action Banner**: Always highlighted in an inner card with a glowing amber lightning bolt (`⚡ Immediate Physical First Step`).
- **Zero-Pill Metadata**: Metadata appears as inline text connected by neutral middle dots (`·`) rather than overwhelming badge pills.

### 2. Mobile Thumb-Friendly Targets

- Minimum touch target: **38px - 44px**.
- Horizontal scroll containers feature `no-scrollbar` with smooth touch inertia.

### 3. Sensory Feedback

- **Sound**: Non-jarring Web Audio clicks and chimes (tick frequency: 784Hz; completion: C5–E5–G5 chord).
- **Brown Noise**: 400Hz filtered Gaussian pink/brown noise to quiet environmental ADHD distractions.
- **Haptics (Mobile)**: `Haptics.notificationAsync(Success)` when claiming dopamine.
