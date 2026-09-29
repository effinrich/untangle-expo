# Untangle (Expo Router)

ADHD Brain Dump & Micro-Task Planner built as one **Expo SDK 52** / **Expo Router** app for web, iOS, and Android.

---

## Architecture & Shared Backend

- **One app, two UIs**: On web, `app/index.tsx` renders the React DOM UI in `src/` (Tailwind v4) through an Expo DOM component (`components/web-app.tsx`). On iOS/Android it renders the React Native screens in `screens/` (NativeWind v4).
- **API routes**: `app/api/*+api.ts` (`/api/untangle`, `/api/breakdown-task`, `/api/unstick-me`, `/api/transcribe-audio`) run on the Expo server; `GEMINI_API_KEY` stays server-side. Native does not use them: it calls the Cloud Run deployment at `app.json` `extra.apiBaseUrl`.
- **Gemini 3.5 Transcribe**: Audio microphone recordings are transcribed into clean text.
- **Firebase Firestore**: Web and native use the same Firestore collection (`/users/{userId}/tasks`).
- **Haptic Feedback**: Uses `expo-haptics` for dopamine rewards when completing micro-tasks.

---

## How to Run Locally

### 1. Install Dependencies

```bash
bun install
```

Put `GEMINI_API_KEY` in `.env` (see `.env.example`).

### 2. Start Expo Development Server

```bash
bun run web     # web app + API routes
bun run start   # iOS/Android
```

- **iOS Simulator**: Press `i` in the terminal.
- **Android Emulator**: Press `a` in the terminal.
- **Physical Device**: Scan the QR code using the **Expo Go** app (iOS Camera or Android Expo Go).

---

## Directory Structure

```text
├── app/                # Expo Router routes
│   ├── _layout.tsx    # Web: Head + Slot; native: Stack & theme
│   ├── +html.tsx      # Web document shell
│   ├── index.tsx      # Web: components/web-app; native: screens/main-screen
│   ├── focus.tsx      # Web: components/web-app; native: screens/focus/focus
│   ├── unstick.tsx    # Web: components/web-app; native: executive dysfunction reset
│   ├── +not-found.tsx # Web: components/web-app; native: link home
│   └── api/           # Gemini API routes (+api.ts)
├── server/gemini.ts   # Shared Gemini client for API routes
├── src/               # Web UI (React DOM, Tailwind v4)
├── screens/
│   ├── main-screen/   # Voice brain dump, energy sort, category pills, task list (+ hooks, partials)
│   └── focus/         # Fullscreen "One Thing Radar" with timer & parking lot (+ hooks, partials)
├── components/
│   ├── web-app.tsx    # 'use dom' entry for the web UI
│   └── task-card-mobile.tsx # Native task item with physical first action & haptics
├── hooks/
│   └── use-voice-recorder.ts # Record, base64-encode, and transcribe audio
├── utils/
│   ├── audio.ts       # Base64 file reading for recordings
│   └── haptics.ts     # Haptics wrapper
├── services/
│   ├── api.ts         # Native API client for Gemini and untangling
│   └── firebase.ts    # Google sign-in & Firestore task sync
├── public/            # Static web assets
├── app.json           # Expo app config (permissions, bundle IDs, icons, Cloud Run apiBaseUrl)
├── package.json       # Dependencies for web, native, and API routes
├── postcss.config.js  # Tailwind v4 for the web UI
└── tailwind.config.js # NativeWind styles
```
