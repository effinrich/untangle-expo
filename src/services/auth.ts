import { User, signInWithPopup, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "./firebase"

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    // Save or update user profile in Firestore; createdAt is immutable once written
    const userDocRef = doc(db, "users", user.uid)
    const existing = await getDoc(userDocRef)
    await setDoc(
      userDocRef,
      {
        userId: user.uid,
        email: user.email || "",
        displayName: user.displayName || "ADHD Planner",
        photoURL: user.photoURL || "",
        ...(existing.exists() ? {} : { createdAt: new Date().toISOString() }),
      },
      { merge: true },
    )

    return user
  } catch (err) {
    console.error("Sign in failed:", err)
    throw err
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth)
}
