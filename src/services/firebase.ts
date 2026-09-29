import { initializeApp } from "firebase/app"
import { GoogleAuthProvider, getAuth } from "firebase/auth"
import { doc, getDocFromServer, getFirestore } from "firebase/firestore"
import firebaseConfig from "../../firebase-applet-config.json"

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"))
    return true
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore offline or connection pending:", error.message)
      return false
    }
    // Permissions error or non-existent document is normal for test doc
    return true
  }
}
