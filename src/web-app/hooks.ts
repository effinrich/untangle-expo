import { useEffect, useState } from "react"
import { User } from "firebase/auth"
import { signInWithGoogle, signOutUser } from "../services/auth"
import { auth, testFirestoreConnection } from "../services/firebase"

// Test Firestore connection on boot (required by Firebase integration skill)
export function useFirestoreConnectionTest() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    testFirestoreConnection().then((isConnected) => {
      setConnected(isConnected)
    })
  }, [])

  return connected
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    setAuthError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error("Google sign in error:", err)
      const message = (err as { message?: string } | undefined)?.message
      setAuthError(message || "Google sign-in was cancelled or failed.")
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  return {
    currentUser,
    authLoading,
    authError,
    dismissAuthError: () => setAuthError(null),
    handleGoogleSignIn,
    handleSignOut,
  }
}
