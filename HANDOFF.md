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

The repository is structured as a full-stack monorepo containing the **Web App (Vite React + Express)** and a scaffolded **Native Mobile App (Expo SDK 52 / React Native)**.

### Web Architecture (`src/` + `server.ts`)

- **Backend (**`server.ts`**)**: Express server mounting Vite middlewares in dev, compiled to Node in production.
  - Endpoints:
    - `POST /api/untangle`: Slices raw brain dumps into categorized micro-tasks using Gemini 3.8 Flash (`gemini-2.5-flash` alias).
    - `POST /api/transcribe-audio`: Transcribes microphone audio payloads using `gemini-3.5-transcribe`.
    - `POST /api/breakdown-task`: Decomposes overwhelming tasks into sub-2-minute micro-steps.
    - `POST /api/unstick-me`: Evaluates current emotional friction and chooses the lowest-resistance starter task.
- **Frontend (**`src/`**)**:
  - `src/app/app.tsx`: Central coordinator managing real-time Firestore sync, guest local storage fallback, Google Auth state, and modal triggers.
  - `src/features/braindump/brain-dump-input/brain-dump-input.tsx`: Input pad with voice dictation via `use-audio-recorder.ts` and template sparks.
  - `src/features/tasks/task-list/task-list.tsx`: Micro-task list featuring:
    - **Mental State & Energy Sort Bar**: Sort options (`energy-asc`, `energy-desc`, `time-asc`, `priority-desc`, `newest`).
    - **Priority Area Filter Strip**: Work, Personal, Health, Finance, Errands, Creative.
    - **Quick Add Form & Markdown Exporter**.
  - `src/features/tasks/task-list/partials/task-card.tsx`: Task component rendering physical first step banner, priority badges, category dropdown, and one-click focus launcher.
  - `src/features/focus/focus-radar-modal/focus-radar-modal.tsx`: One-task radar with brown noise synthesis (`sound.ts`) and Mental Parking Lot drawer.
  - `src/features/unstick/unstick-me-modal/unstick-me-modal.tsx`: Unstick engine for decision fatigue.
  - `src/features/stats/dopamine-tracker/dopamine-tracker.tsx`: Guilt-free momentum ledger tracking minutes in flow and completion percentages across priority areas.
- **Database & Auth (**`src/services/firebase.ts`**)**:
  - Firebase Authentication with Google Sign-In popup.
  - Cloud Firestore real-time listeners (`onSnapshot`) syncing to `/users/{userId}/tasks/{taskId}` and `/users/{userId}/parkingLot/{itemId}`.
  - Verified and deployed `firestore.rules` enforcing user-scoped read/write invariants and field schemas (`firebase-blueprint.json`).

### Mobile Architecture (`mobile/`)

- **Framework**: Expo SDK 52 with Expo Router (`mobile/app/`) and NativeWind v4 (Tailwind).
- **Core Screens**:
  - `mobile/app/index.tsx`: Main dashboard with voice dump, energy-level quick sorting, category pills, and task list.
  - `mobile/app/focus.tsx`: Fullscreen One Thing sprint with timer and mental parking lot.
  - `mobile/app/unstick.tsx`: Native executive dysfunction reset flow.
- **Native APIs**:
  - `expo-av` for microphone recording and audio playback.
  - `expo-haptics` for tactile dopamine rewards upon completing tasks or starting focus mode.
- **Shared Backend Client**: `mobile/services/api.ts` connects directly to the same Express / Gemini server.

---

## 3. Key Files & Directory Map

```text
├── package.json                   # Web & Express backend dependencies
├── server.ts                      # Express API proxying Gemini 3.8 Flash & 3.5 Transcribe
├── firebase-applet-config.json    # Firestore & Firebase Auth credentials
├── firebase-blueprint.json        # Firestore schema definitions (UserProfile, MicroTask, ParkingLotItem)
├── firestore.rules                # Hardened Firestore security rules
├── security_spec.md               # Dirty Dozen attack vectors & validation rules
├── src/
│   ├── app/app.tsx                # Main Web application container
│   ├── types/index.ts             # Universal TypeScript interfaces (MicroTask, EnergyLevel, etc.)
│   ├── data/
│   │   ├── categories.ts          # Priority areas (Work, Personal, Health, etc.) & color configs
│   │   └── seed-data.ts           # Default starter tasks & brain dump templates
│   ├── services/
│   │   ├── api.ts                 # Web frontend client for /api/* endpoints
│   │   ├── firebase.ts            # Firebase Auth & Firestore CRUD/listeners
│   │   └── sound.ts               # Web Audio API brown noise & completion chimes
│   └── features/
│       ├── audio/                 # Web microphone recorder hook
│       ├── braindump/             # Brain dump textarea & template sparks
│       ├── focus/                 # "One Thing Radar" modal & parking lot
│       ├── stats/                 # Dopamine tracker & priority area breakdown
│       ├── tasks/                 # TaskList, TaskCard, and Energy sort controls
│       └── unstick/               # Executive dysfunction assistant modal
└── mobile/                        # Expo SDK 52 React Native project
    ├── app/                       # Expo Router screens (_layout, index, focus, unstick)
    ├── components/                # TaskCardMobile.tsx
    ├── services/api.ts            # Mobile client for /api/* endpoints
    ├── app.json                   # Expo configuration (iOS/Android bundles, permissions)
    ├── package.json               # Mobile dependencies (nativewind, expo-av, expo-haptics)
    └── tailwind.config.js         # NativeWind theme
```

---

## 4. End Goal & Roadmap for Incoming Agents / Developers

### Phase 1: Mobile App Polishing (Immediate Next Steps)

1. **Audio Base64 Encoding for Mobile Dictation**:

- In `mobile/app/index.tsx`, complete the `FileSystem.readAsStringAsync(uri, { encoding: 'base64' })` pipeline so native voice recordings pass directly to `transcribeAudio()` on the server.

2. **Native Firestore Sync**:

- Connect `mobile/services/api.ts` or add Firebase React Native configuration so mobile users can authenticate with Google and view their live synchronized web tasks.

3. **Native Push Notifications for Timers**:

- Integrate `expo-notifications` to notify users when a 15-minute or 25-minute focus radar sprint ends if the app is in the background.

### Phase 2: Enhanced Intelligence & Neurodivergent UX

1. **AI Substep Auto-Completer**:

- When a user finishes the "First Physical Step", offer a gentle micro-prompt to auto-queue the next step.

2. **Context-Aware Calendar / Time-Blocking Integration**:

- Allow dragging micro-tasks directly into open calendar gaps without cluttering primary calendars.

3. **Offline-First Synchronization**:

- Implement local SQLite / MMKV cache in mobile with conflict-free sync to Firestore when reconnecting to Wi-Fi.

---

## 5. Instructions for Running Locally

### Web & Backend:

```bash
npm install
npm run dev
# Server boots at http://localhost:3000
```

### Expo Mobile App:

```bash
cd mobile
npm install
npx expo start
# Press 'i' for iOS Simulator, 'a' for Android, or scan QR with Expo Go app
```
