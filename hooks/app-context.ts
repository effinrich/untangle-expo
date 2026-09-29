import { createContext, useContext } from "react"
import { useAuthSession } from "./use-auth-session"
import { useOnboardingFlag } from "./use-onboarding-flag"
import { useParkingLotStore } from "./use-parking-lot-store"
import { useTaskStore } from "./use-task-store"

export type AppState = ReturnType<typeof useAuthSession> &
  ReturnType<typeof useTaskStore> &
  ReturnType<typeof useParkingLotStore> &
  ReturnType<typeof useOnboardingFlag>

export const AppContext = createContext<AppState | null>(null)

export function useAppState(): AppState {
  const state = useContext(AppContext)
  if (!state) throw new Error("useAppState must be used inside AppProvider")
  return state
}
