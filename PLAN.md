# PLAN: Untangle Mobile (Expo) Integration

## Overview

The goal is to implement the Phase 1 tasks for the Expo universal app (web, iOS, Android) to bring it to feature parity with the web app, specifically around voice transcription, Firebase authentication and real-time syncing, and push notifications for focus timers.

## Architecture Decisions

1. **File System for Audio**: We will use `expo-file-system` to encode recorded audio into Base64 before sending it to the backend for transcription.
2. **Firebase Auth & Firestore**: We will port the Firebase configuration from the web app (`src/services/firebase.ts`) to `services/firebase.ts`. For universal persistence, we will use `@react-native-async-storage/async-storage` combined with Firebase's `getReactNativePersistence` on native platforms, while keeping `browserLocalPersistence` for the web. We will use `expo-auth-session` for Google Sign-In to ensure it works smoothly across Expo Go and web without native custom dev clients.
3. **Notifications**: We will use `expo-notifications` for local push notifications, scheduled when a user starts a Focus timer, and cancelled if they exit early.

## Task List

### Phase 1: Mobile App Polishing

**Task 1: Audio Base64 Encoding for Mobile Dictation**

- **Description**: Read the audio file recorded by `expo-av` using `expo-file-system` to get a Base64 string, then pass it to `transcribeAudio` and update the brain dump text.
- **Acceptance Criteria**:
  - `expo-file-system` is installed and used to read the file.
  - Recording stops, is converted to Base64, and is sent to the backend.
  - Text area updates with the transcribed text.
- **Verification Commands**: `bunx tsc --noEmit` at the repo root.
- **Dependencies**: `expo-file-system`
- **Files Touched**: `utils/audio.ts`, `hooks/use-voice-recorder.ts`, `package.json`
- **Size**: S
- **Status**: Implemented.

**Task 2: Native Firestore Sync & Authentication**

- **Description**: Add Firebase RN config so mobile users can authenticate with Google and sync tasks.
- **Acceptance Criteria**:
  - `services/firebase.ts` is created and initializes Firebase with appropriate persistence (AsyncStorage for native, browser for web).
  - Google Sign-In is implemented using `expo-auth-session/providers/google`.
  - `screens/main-screen/hooks.ts` syncs tasks using `subscribeToUserTasks` and handles auth state.
- **Verification Commands**: `bunx tsc --noEmit` at the repo root.
- **Dependencies**: `@react-native-async-storage/async-storage`, `expo-auth-session`, `expo-crypto`, `expo-web-browser`
- **Files Touched**: `services/firebase.ts`, `screens/main-screen/hooks.ts`, `package.json`
- **Size**: M
- **Status**: Implemented.

**Task 3: Native Push Notifications for Timers**

- **Description**: Integrate `expo-notifications` to alert users when a focus sprint ends if the app is in the background.
- **Acceptance Criteria**:
  - `expo-notifications` is installed and permissions are requested.
  - A local notification is scheduled when a timer starts in `screens/focus/hooks.ts`.
  - The notification is cancelled if the timer is stopped manually before finishing.
- **Verification Commands**: `bunx tsc --noEmit` at the repo root.
- **Dependencies**: `expo-notifications`
- **Files Touched**: `screens/focus/hooks.ts`, `package.json`, `app.json`
- **Size**: S
- **Status**: Implemented.

## Risks and Mitigations

- **Auth Provider Mismatch**: Google Auth often requires platform-specific client IDs for iOS and Android. **Mitigation**: We will use the web client ID as a proxy via `expo-auth-session` for Expo Go compatibility, relying on the `oAuthClientId` in `firebase-applet-config.json`.
- **Audio Format Issues**: The backend expects `audio/m4a`. Expo AV records in `m4a` format by default on iOS, but we must ensure Android also records in an acceptable format. **Mitigation**: Use `Audio.RecordingOptionsPresets.HIGH_QUALITY` which defaults to m4a/aac on iOS and Android.

## Open Questions

- Are there specific iOS/Android OAuth Client IDs available for Google Sign-In, or should we only use the web client ID provided? (Assuming web for now).
- EAS project ID in `app.json` belongs to a specific account. The user will need to update it when running `eas build` or submit.
