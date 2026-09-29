# PROJECT HANDOFF & AGENT BRIEFING: TANGLE (ADHD Brain Dump & Priority Flow)

**Date**: September 28, 2026  
**Primary Architect**: Google AI Studio Build Agent  
**Current User / Owner**: [richtillman@gmail.com](mailto:richtillman@gmail.com)  
**Applet ID**: `0e6f0f3e-28a1-4517-8b78-5d76b556f7c7`  
**Firestore Database**: `ai-studio-remixtangleadhdb-0e6f0f3e-28a1-4517-8b78-5d76b556f7c7`  
**Firebase Project**: `auth-synth-503906`  
**Auth Domain**: `auth-synth-503906.firebaseapp.com`

---

## 1. Executive Summary & Product Vision

### The Problem

Traditional to-do apps fail individuals with ADHD and executive dysfunction because they demand high upfront organization, trigger decision paralysis, and show overwhelming walls of text with zero initiation friction reduction.

### The Solution: Untangle

Untangle is a neurodivergent-friendly productivity workspace designed around:

1. **Frictionless Brain Dumping**: Voice dictation or free-form text dumps without initial organization.
2. **AI Micro-Step & Priority Area Slicing**: Automatically decomposes messy thoughts into concrete tasks categorized by priority areas (**Work**, **Personal**, **Health**, **Finance / Admin**, **Errands**, **Creative**) with explicit **"Immediate Physical First Steps"** (e.g. _"Pick up the blue mug by your monitor"_ or _"Open Chrome and search for John's email"_).
3. **Mental Battery & Energy-Level Matching**: Tasks are tagged with energy levels (`low`, `medium`, `high`) and can be sorted to match the user's current cognitive state (e.g., _Low Energy First_ when foggy/exhausted, _Hyperfocus First_ when energized).
4. **"One Thing Radar"**: Fullscreen single-task focus sprint with synthetic brown noise and a **Mental Parking Lot** to catch intrusive fleeting thoughts mid-sprint without getting derailed.
5. **Executive Dysfunction "Unstick Me" Assistant**: A 2-minute non-judgmental contract to break task freeze.

---

## 2. Current Architecture & Implementation State

The repository is one **Expo Router app (Expo SDK 52)** at the root. On web, `app/index.tsx` renders the React DOM UI in `src/` through an Expo DOM component (`components/web-app.tsx`); on iOS/Android it renders the React Native screens in `screens/`. API routes, config, and the lockfile are shared.

### Web Architecture (`src/` + `app/api/`)

- **Backend (**`app/api/`**)**: Expo Router API routes, one `+api.ts` file per endpoint, served by the Expo server (`web.output: "server"` in `app.json`). `GEMINI_API_KEY` is read server-side only. The shared Gemini client lives in `server/gemini.ts`.
  - Endpoints:
    - `POST /api/untangle` (`app/api/untangle+api.ts`): Slices raw brain dumps into categorized micro-tasks using `gemini-3.8-flash`.
    - `POST /api/transcribe-audio` (`app/api/transcribe-audio+api.ts`): Transcribes microphone audio payloads using `gemini-3.5-transcribe`.
    - `POST /api/breakdown-task` (`app/api/breakdown-task+api.ts`): Decomposes overwhelming tasks into sub-2-minute micro-steps.
    - `POST /api/unstick-me` (`app/api/unstick-me+api.ts`): Evaluates current emotional friction and chooses the lowest-resistance starter task.
- **Frontend (**`src/`**)**:
- `components/web-app.tsx`: `'use dom'` entry that mounts `src/web-app/app.tsx` with Tailwind v4 (`src/index.css`, `postcss.config.js`).
  - `src/web-app/app.tsx`: Central coordinator for the view, Google Auth state, and modal triggers. Task and parking-lot sync (Firestore with guest local storage fallback) lives in `src/shared/hooks/use-tasks.ts` and `src/shared/hooks/use-parking-lot.ts`.
  - `src/features/braindump/brain-dump-input/brain-dump-input.tsx`: Input pad with voice dictation via `src/shared/hooks/use-audio-recorder.ts` and template sparks.
  - `src/features/tasks/task-list/task-list.tsx`: Micro-task list featuring:
    - **Mental State & Energy Sort Bar**: Sort options (`energy-asc`, `energy-desc`, `time-asc`, `priority-desc`, `newest`).
    - **Priority Area Filter Strip**: Work, Personal, Health, Finance, Errands, Creative.
    - **Quick Add Form & Markdown Exporter**.
  - `src/features/tasks/task-list/partials/task-card.tsx`: Task component rendering physical first step banner, priority badges, category dropdown, and one-click focus launcher.
  - `src/features/focus/focus/focus.tsx`: One-task radar with ambient noise synthesis (`src/services/ambient.ts`), chimes (`src/services/sound.ts`), and Mental Parking Lot drawer.
  - `src/features/unstick/unstick-me-modal/unstick-me-modal.tsx`: Unstick engine for decision fatigue.
  - `src/features/stats/dopamine-tracker/dopamine-tracker.tsx`: Guilt-free momentum ledger tracking minutes in flow and completion percentages across priority areas.
- **Database & Auth (**`src/services/`**)**: `firebase.ts` initializes the app; `auth.ts`, `tasks.ts`, and `parking-lot.ts` hold sign-in and the Firestore reads and writes.
  - Firebase Authentication with Google Sign-In popup.
  - Cloud Firestore real-time listeners (`onSnapshot`) syncing to `/users/{userId}/tasks/{taskId}` and `/users/{userId}/parkingLot/{itemId}`.
  - Verified and deployed `firestore.rules` enforcing user-scoped read/write invariants and field schemas (`firebase-blueprint.json`).

### Native Architecture (iOS/Android)

- **Framework**: Expo SDK 52 with Expo Router (`app/`) and NativeWind v4 (Tailwind).
- **Core Screens** (route files in `app/` re-export screens from `screens/`):
  - `app/index.tsx` -> `screens/main-screen/main-screen.tsx` (native only; web renders `components/web-app.tsx`): Main dashboard with voice dump, energy-level quick sorting, category pills, and task list.
  - `app/focus.tsx` -> `screens/focus/focus.tsx` (native only; on web `/focus`, `/unstick`, and unknown paths render `components/web-app.tsx`, like the old SPA fallback): Fullscreen One Thing sprint with timer and mental parking lot.
  - `app/unstick.tsx`: Native executive dysfunction reset flow (screen code still lives in the route file).
- **Native APIs**:
  - `expo-av` for microphone recording (`hooks/use-voice-recorder.ts`) and `expo-file-system` for base64 encoding (`utils/audio.ts`).
  - `expo-haptics` for tactile dopamine rewards upon completing tasks or starting focus mode.
  - `expo-notifications` for focus-sprint end notifications (`screens/focus/hooks.ts`).
- **Shared Backend Client**: `services/api.ts` calls the Cloud Run deployment at `app.json` `extra.apiBaseUrl`. Native does not use the Expo API routes.
- **Auth & Sync**: `services/firebase.ts` (Google sign-in via `expo-auth-session`, Firestore task subscription).

---

## 3. Key Files & Directory Map

```text
├── app/                    # Expo Router routes
│   ├── _layout.tsx         # Web: Head + Slot; native: Stack
│   ├── +html.tsx           # Web document shell
│   ├── index.tsx           # Web: components/web-app; native: screens/main-screen
│   ├── focus.tsx           # Web: components/web-app; native: screens/focus/focus
│   ├── unstick.tsx         # Web: components/web-app; native: executive dysfunction reset
│   ├── +not-found.tsx      # Web: components/web-app; native: link home
│   └── api/                # untangle, transcribe-audio, breakdown-task, unstick-me (+api.ts)
├── server/gemini.ts        # Shared Gemini client for API routes
├── components/
│   ├── web-app.tsx         # 'use dom' entry that mounts src/web-app/app.tsx
│   └── task-card-mobile.tsx
├── screens/                # Native UI: main-screen/, focus/ (screen + hooks + partials)
├── hooks/                  # use-voice-recorder.ts (native)
├── utils/                  # audio.ts (base64), haptics.ts (native)
├── services/               # api.ts, firebase.ts (native)
├── public/images/          # Static web assets
├── src/                    # Web UI (React DOM + Tailwind v4)
│   ├── app/app.tsx         # Main web application container
│   ├── types/index.ts      # Universal TypeScript interfaces (MicroTask, EnergyLevel, etc.)
│   ├── data/               # categories.ts, seed-data.ts
│   ├── services/           # api, firebase, auth, tasks, parking-lot, ambient, sound
│   ├── shared/             # Cross-feature hooks, types, consts, utils
│   └── features/           # braindump/, focus/, stats/, tasks/, unstick/
├── app.json                # Expo config (web server output, permissions, Cloud Run apiBaseUrl)
├── package.json            # Single dependency manifest (bun.lock)
├── metro.config.js         # NativeWind for native; drops global.css on web
├── postcss.config.js       # Tailwind v4 for src/index.css
├── tailwind.config.js      # NativeWind (Tailwind v3) theme for native
├── firebase-applet-config.json # Firestore & Firebase Auth credentials
├── firebase-blueprint.json # Firestore schema definitions
├── firestore.rules         # Hardened Firestore security rules
└── security_spec.md        # Dirty Dozen attack vectors & validation rules
```

---

## 4. End Goal & Roadmap for Incoming Agents / Developers

### Phase 1: Mobile App Polishing (implemented in code; see `PLAN.md`)

1. **Audio Base64 Encoding for Mobile Dictation**:

- `utils/audio.ts` reads the recording with `FileSystem.readAsStringAsync(uri, { encoding: Base64 })`; `hooks/use-voice-recorder.ts` passes it to `transcribeAudio()`.

2. **Native Firestore Sync**:

- `services/firebase.ts` signs in with a Google credential and subscribes to the user's tasks; `screens/main-screen/hooks.ts` wires it up with `expo-auth-session`.

3. **Native Push Notifications for Timers**:

- `screens/focus/hooks.ts` schedules an `expo-notifications` notification for the sprint end and cancels it on early exit.

### Phase 2: Enhanced Intelligence & Neurodivergent UX

1. **AI Substep Auto-Completer**:

- When a user finishes the "First Physical Step", offer a gentle micro-prompt to auto-queue the next step.

2. **Context-Aware Calendar / Time-Blocking Integration**:

- Allow dragging micro-tasks directly into open calendar gaps without cluttering primary calendars.

3. **Offline-First Synchronization**:

- Implement local SQLite / MMKV cache in mobile with conflict-free sync to Firestore when reconnecting to Wi-Fi.

---

## 5. Instructions for Running Locally

```bash
bun install
bun run web      # web app + API routes at http://localhost:8081
bun run start    # Expo dev server for iOS/Android
# Press 'i' for iOS Simulator, 'a' for Android, or scan QR with Expo Go app
```
