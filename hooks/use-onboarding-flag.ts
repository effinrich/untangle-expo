import { useEffect, useState } from "react"
import { loadJson, saveJson, STORAGE_KEYS } from "../services/storage"

// null while loading from storage
export function useOnboardingFlag() {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)

  useEffect(() => {
    loadJson<boolean>(STORAGE_KEYS.onboardingComplete, false).then(setOnboardingComplete)
  }, [])

  const completeOnboarding = () => {
    setOnboardingComplete(true)
    saveJson(STORAGE_KEYS.onboardingComplete, true)
  }

  return { onboardingComplete, completeOnboarding }
}
