export function readStoredList<T>(key: string, fallback: T[], label: string): T[] {
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn(`Failed to parse saved ${label}`, e)
  }
  return fallback
}

export function writeStoredList<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch (e) {
    console.error(e)
  }
}
