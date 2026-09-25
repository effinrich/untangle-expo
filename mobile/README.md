# Tangle Mobile (Expo React Native)

ADHD Brain Dump & Micro-Task Planner native app built with **Expo SDK 52**, **Expo Router**, and **NativeWind v4**.

---

## Architecture & Shared Backend

- **Unified Backend API**: Communicates with the same Express server powering the web app (`/api/untangle`, `/api/breakdown-task`, `/api/unstick-me`, and `/api/transcribe-audio`).
- **Gemini 3.5 Transcribe**: Audio microphone recordings from mobile are transcribed into clean text.
- **Firebase Firestore**: Connects to the same Firestore database collection (`/users/{userId}/tasks`).
- **Haptic Feedback**: Uses `expo-haptics` for dopamine rewards when completing micro-tasks.

---

## How to Run Locally

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start Expo Development Server
```bash
npx expo start
```

- **iOS Simulator**: Press `i` in the terminal.
- **Android Emulator**: Press `a` in the terminal.
- **Physical Device**: Scan the QR code using the **Expo Go** app (iOS Camera or Android Expo Go).

---

## Directory Structure

```text
mobile/
├── app/
│   ├── _layout.tsx    # Root navigation & theme
│   ├── index.tsx      # Main screen: voice brain dump, energy sort, task cards
│   ├── focus.tsx      # Fullscreen "One Thing Radar" with timer & parking lot
│   └── unstick.tsx    # Executive dysfunction reset (2-minute spark contract)
├── components/
│   └── TaskCardMobile.tsx # Native task item with physical first action & haptics
├── services/
│   └── api.ts         # Shared API client for Gemini and untangling
├── app.json           # Expo app config (permissions, bundle IDs, icons)
├── package.json       # Expo SDK 52 dependencies
└── tailwind.config.js # NativeWind styles
```
