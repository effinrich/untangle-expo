import React, { ReactNode, useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"
import { AppContext } from "../../hooks/app-context"
import { useAppData } from "../../hooks/use-app-data"
import { useAuthSession } from "../../hooks/use-auth-session"
import { useOnboardingFlag } from "../../hooks/use-onboarding-flag"
import { SPLASH_MAX_MS } from "./consts"

// Holds the native splash until auth, stored data, and the onboarding flag are known.
export function AppProvider({ children }: { children: ReactNode }) {
  const session = useAuthSession()
  const data = useAppData(session.user, session.authReady)
  const onboarding = useOnboardingFlag()

  const ready =
    session.authReady && data.dataReady && onboarding.onboardingComplete !== null

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {})
  }, [ready])

  useEffect(() => {
    const timeout = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), SPLASH_MAX_MS)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <AppContext.Provider value={{ ...session, ...data, ...onboarding }}>
      {children}
    </AppContext.Provider>
  )
}
