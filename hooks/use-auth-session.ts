import { useEffect, useState } from "react"
import * as Google from "expo-auth-session/providers/google"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth, signInWithGoogleCredential, signOutUser } from "../services/firebase"
import firebaseConfig from "../firebase-applet-config.json"

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: firebaseConfig.oAuthClientId,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthReady(true)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (response?.type !== "success") return
    const { id_token } = response.params
    if (!id_token) return
    signInWithGoogleCredential(id_token).catch(() => {
      setSignInError("Couldn't sign in with Google. You can keep using Untangle as a guest.")
    })
  }, [response])

  const signIn = () => {
    setSignInError(null)
    promptAsync().catch(() => {
      setSignInError("Couldn't open Google sign-in. Try again in a moment.")
    })
  }

  return {
    user,
    authReady,
    canSignIn: !!request,
    signIn,
    signOut: signOutUser,
    signInError,
  }
}
