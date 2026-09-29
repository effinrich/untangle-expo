# Untangle (Expo Router)

ADHD Brain Dump & Micro-Task Planner built as one **Expo SDK 52** / **Expo Router** app for web, iOS, and Android.

---

## Architecture & Shared Backend

- **One app, two UIs**: On web, `app/index.tsx` renders the React DOM UI in `src/` (Tailwind v4) through an Expo DOM component (`components/web-app.tsx`). On iOS/Android it renders the React Native screens in `screens/` (NativeWind v4).
- **API routes**: `app/api/*+api.ts` (`/api/untangle`, `/api/breakdown-task`, `/api/unstick-me`, `/api/transcribe-audio`) run on the Expo server; `GEMINI_API_KEY` stays server-side. Native dev builds call them on the Metro host; release builds require a deployed endpoint in `EXPO_PUBLIC_API_BASE_URL` or `app.json` `extra.apiBaseUrl` and fail at startup if neither is set (see `services/api-client.ts`).
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
│   ├── _layout.tsx    # Web: Head + Slot; native: splash hold, AppProvider, NativeStack
│   ├── +html.tsx      # Web document shell
│   ├── index.tsx      # Web: components/web-app; native: screens/main-screen
│   ├── focus.tsx      # Web: components/web-app; native: screens/focus/focus
│   ├── unstick.tsx    # Web: components/web-app; native: screens/unstick/unstick
│   ├── onboarding.tsx # Web: components/web-app; native: screens/onboarding/onboarding
│   ├── [...rest].tsx  # Unknown paths. Web: components/web-app (HTTP 200); native: link home
│   ├── _sitemap.tsx   # Replaces Expo's sitemap with [...rest]
│   └── api/           # Gemini API routes (+api.ts)
├── server/gemini.ts   # Shared Gemini client for API routes
├── src/               # Web UI (React DOM, Tailwind v4)
├── screens/
│   ├── main-screen/   # Brain-dump composer, task list, sort & filter sheet (+ hooks, partials)
│   ├── focus/         # Focus modal: large timer & persistent parking lot (+ hooks, partials)
│   ├── unstick/       # Mood picker; the API picks the easiest step for a 2-minute spark
│   └── onboarding/    # Three-page intro, then guest or Google sign-in
├── components/
│   ├── web-app.tsx    # 'use dom' entry for the web UI
│   ├── task-card-mobile.tsx # Native task item with physical first action & haptics
│   ├── app-provider/  # Native app state + splash hold
│   ├── native-stack/  # Native Stack options (Focus/Unstick as modals)
│   └── button/, text-field/, option-row/, screen/, status-banner/ # Native UI primitives
├── hooks/
│   ├── use-voice-recorder.ts # Record, base64-encode, and transcribe audio
│   ├── use-app-data.ts # Picks guest or signed-in collections; writes, guest migration, sign-out cleanup
│   ├── use-live-data.ts # useLiveQuery reads (tasks, one task, parked thoughts)
│   └── use-auth-session.ts, use-onboarding-flag.ts # Google session; onboarding flag (AsyncStorage)
├── theme/
│   ├── colors.js      # Native semantic color tokens (used by tailwind.config.js)
│   └── icons.ts       # Per-icon lucide imports (keeps the bundle small)
├── utils/
│   ├── audio.ts       # Base64 file reading for recordings
│   ├── haptics.ts     # Haptics wrapper
│   └── focus-href.ts  # Typed link to the Focus modal
├── services/
│   ├── api.ts         # Native API calls (untangle, transcribe, unstick)
│   ├── api-client.ts  # Base URL resolution, JSON checks, friendly ApiError
│   ├── firebase.ts    # Firebase app, Firestore, Google sign-in
│   ├── storage.ts     # AsyncStorage onboarding flag
│   └── db/            # TanStack DB collections (guest SQLite-backed, signed-in Firestore mirror), offline outbox, guest migration
├── public/            # Static web assets
├── app.json           # Expo app config (permissions, bundle IDs, icons)
├── package.json       # Dependencies for web, native, and API routes
├── postcss.config.js  # Tailwind v4 for the web UI
└── tailwind.config.js # NativeWind styles
```
