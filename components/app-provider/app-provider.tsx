import React, { ReactNode, useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"
import { AppContext } from "../../hooks/app-context"
import { useAuthSession } from "../../hooks/use-auth-session"
import { useOnboardingFlag } from "../../hooks/use-onboarding-flag"
import { useParkingLotStore } from "../../hooks/use-parking-lot-store"
import { useTaskStore } from "../../hooks/use-task-store"
import { SPLASH_MAX_MS } from "./consts"

// Holds the native splash until auth, stored tasks, and the onboarding flag are known.
export function AppProvider({ children }: { children: ReactNode }) {
  const session = useAuthSession()
  const taskStore = useTaskStore(session.user, session.authReady)
  const parkingLot = useParkingLotStore()
  const onboarding = useOnboardingFlag()

  const ready =
    session.authReady && taskStore.tasksReady && onboarding.onboardingComplete !== null

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {})
  }, [ready])

  useEffect(() => {
    const timeout = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), SPLASH_MAX_MS)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <AppContext.Provider value={{ ...session, ...taskStore, ...parkingLot, ...onboarding }}>
      {children}
    </AppContext.Provider>
  )
}
