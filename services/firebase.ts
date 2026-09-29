import { initializeApp } from "firebase/app"
import {
  initializeAuth,
  signOut,
  User,
  Auth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth"
// Expo resolves the React Native entrypoint at runtime, but Firebase's default type export omits it.
// @ts-expect-error getReactNativePersistence is exported by @firebase/auth's react-native condition.
import { getReactNativePersistence } from "@firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { Platform } from "react-native"
import firebaseConfig from "../firebase-applet-config.json"

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId)

let _auth: Auth
if (Platform.OS === "web") {
  const { getAuth } = require("firebase/auth")
  _auth = getAuth(app)
} else {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
}
export const auth = _auth

// Create-only: firestore.rules keep profile createdAt immutable, so re-sign-ins must not rewrite it.
async function ensureUserProfile(user: User): Promise<void> {
  const profileRef = doc(db, "users", user.uid)
  if ((await getDoc(profileRef)).exists()) return
  await setDoc(profileRef, {
    userId: user.uid,
    email: user.email || "",
    displayName: user.displayName || "ADHD Planner",
    photoURL: user.photoURL || "",
    createdAt: new Date().toISOString(),
  })
}

export async function signInWithGoogleCredential(idToken: string): Promise<User> {
  const credential = GoogleAuthProvider.credential(idToken)
  const { user } = await signInWithCredential(auth, credential)
  ensureUserProfile(user).catch((error) => console.warn("Couldn't create user profile:", error))
  return user
}

export async function signOutUser(): Promise<void> {
  await signOut(auth)
}
