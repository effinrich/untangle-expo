import { useEffect, useState } from "react"
import { loadJson, saveJson, STORAGE_KEYS } from "../services/storage"

// null while loading; true only for the first launch on this install
export function useLaunchHistory() {
  const [firstLaunch, setFirstLaunch] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    loadJson<boolean>(STORAGE_KEYS.hasLaunched, false).then((hasLaunched) => {
      if (!active) return
      setFirstLaunch(!hasLaunched)
      if (!hasLaunched) saveJson(STORAGE_KEYS.hasLaunched, true)
    })
    return () => {
      active = false
    }
  }, [])

  return { firstLaunch }
}
