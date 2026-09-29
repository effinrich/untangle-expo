import { useEffect, useRef, useState } from "react"
import { loadJson, saveJson, STORAGE_KEYS } from "../services/storage"

export interface ParkedThought {
  id: string
  text: string
  createdAt: string
}

export function useParkingLotStore() {
  const [thoughts, setThoughts] = useState<ParkedThought[]>([])
  const loadedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    loadJson<ParkedThought[]>(STORAGE_KEYS.parkingLot, []).then((stored) => {
      if (cancelled) return
      loadedRef.current = true
      setThoughts(stored)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (loadedRef.current) saveJson(STORAGE_KEYS.parkingLot, thoughts)
  }, [thoughts])

  const parkThought = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const thought = { id: `thought_${Date.now()}`, text: trimmed, createdAt: new Date().toISOString() }
    setThoughts((prev) => [thought, ...prev])
  }

  const removeThought = (id: string) => setThoughts((prev) => prev.filter((t) => t.id !== id))

  return { thoughts, parkThought, removeThought }
}
