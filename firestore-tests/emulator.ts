import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app"
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from "firebase/auth"
import { connectFirestoreEmulator, doc, getDocFromServer, getFirestore, type Firestore } from "firebase/firestore"
import * as lite from "firebase/firestore/lite"
import firebaseConfig from "../firebase-applet-config.json"

const PROJECT_ID = "demo-untangle"
const apps: FirebaseApp[] = []

export interface TestUser {
  uid: string
  db: Firestore
  /** Request/response client: denials surface as errors, never as offline cache reads. */
  liteDb: lite.Firestore
}

function createApp(name: string): FirebaseApp {
  const app = initializeApp({ projectId: PROJECT_ID, apiKey: "demo-key" }, name)
  apps.push(app)
  return app
}

export function anonymousLiteDb(): lite.Firestore {
  const db = lite.getFirestore(createApp(`anon-${apps.length}`), firebaseConfig.firestoreDatabaseId)
  lite.connectFirestoreEmulator(db, "127.0.0.1", 8080)
  return db
}

export async function signedInUser(label: string): Promise<TestUser> {
  const app = createApp(`${label}-${apps.length}`)
  const auth = getAuth(app)
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true })
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId)
  connectFirestoreEmulator(db, "127.0.0.1", 8080)
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.dev`
  const { user } = await createUserWithEmailAndPassword(auth, email, "password123")
  // A cold emulator can exceed the SDK's 10s online check; once "offline", reads fall back to cache.
  await getDocFromServer(doc(db, `users/${user.uid}`))
  const liteDb = lite.getFirestore(app, firebaseConfig.firestoreDatabaseId)
  lite.connectFirestoreEmulator(liteDb, "127.0.0.1", 8080)
  return { uid: user.uid, db, liteDb }
}

export async function disposeApps(): Promise<void> {
  await Promise.all(apps.splice(0).map((app) => deleteApp(app)))
}
