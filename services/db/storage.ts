import type { StorageApi, StorageEventApi } from "@tanstack/db"
import type { StorageAdapter } from "@tanstack/offline-transactions"
import { SQLiteStorage } from "expo-sqlite/kv-store"

const kv = new SQLiteStorage("untangle-data")

export const STORAGE_KEYS = {
  guestTasks: "untangle.guest.tasks.v1",
  guestParkingLot: "untangle.guest.parking-lot.v1",
  guestSeeded: "untangle.guest.seeded.v1",
  userPrefix: "untangle.user.",
} as const

export function userKey(userId: string, name: "tasks" | "parking-lot" | "outbox."): string {
  return `${STORAGE_KEYS.userPrefix}${userId}.${name}`
}

export const deviceStorage: StorageApi = {
  getItem: (key) => kv.getItemSync(key),
  setItem: (key, value) => {
    kv.setItemSync(key, value)
  },
  removeItem: (key) => {
    kv.removeItemSync(key)
  },
}

// One JS context on native, so there are no cross-tab storage events to listen for.
export const noStorageEvents: StorageEventApi = {
  addEventListener: () => {},
  removeEventListener: () => {},
}

export function removeDeviceKeys(prefix: string, keep?: string): void {
  for (const key of kv.getAllKeysSync()) {
    if (key.startsWith(prefix) && !(keep && key.startsWith(keep))) kv.removeItemSync(key)
  }
}

export function prefixedStorageAdapter(prefix: string): StorageAdapter {
  const keys = async () =>
    (await kv.getAllKeysAsync()).filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length))

  return {
    get: (key) => kv.getItemAsync(prefix + key),
    set: (key, value) => kv.setItemAsync(prefix + key, value),
    delete: async (key) => {
      await kv.removeItemAsync(prefix + key)
    },
    keys,
    clear: async () => {
      for (const key of await keys()) await kv.removeItemAsync(prefix + key)
    },
  }
}
