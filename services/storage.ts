import AsyncStorage from "@react-native-async-storage/async-storage"

export const STORAGE_KEYS = {
  onboardingComplete: "untangle.onboarding-complete.v1",
  hasLaunched: "untangle.has-launched.v1",
} as const

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch (error) {
    console.warn(`Failed to read ${key}:`, error)
    return fallback
  }
}

export async function saveJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to write ${key}:`, error)
  }
}
