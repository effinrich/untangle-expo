import { createContext, useContext } from "react"
import type { useAppData } from "./use-app-data"
import { useAuthSession } from "./use-auth-session"
import { useOnboardingFlag } from "./use-onboarding-flag"

export type AppState = ReturnType<typeof useAuthSession> &
  ReturnType<typeof useAppData> &
  ReturnType<typeof useOnboardingFlag>

export const AppContext = createContext<AppState | null>(null)

export function useAppState(): AppState {
  const state = useContext(AppContext)
  if (!state) throw new Error("useAppState must be used inside AppProvider")
  return state
}
