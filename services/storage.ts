import AsyncStorage from "@react-native-async-storage/async-storage"

export const STORAGE_KEYS = {
  guestTasks: "untangle.guest-tasks.v1",
  parkingLot: "untangle.parking-lot.v1",
  onboardingComplete: "untangle.onboarding-complete.v1",
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

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove ${key}:`, error)
  }
}
