import AsyncStorage from "@react-native-async-storage/async-storage"
import { randomUUID } from "expo-crypto"
import type { MicroTask } from "../api"
import { guestParkingLotCollection } from "./guest-parking-lot-collection"
import { guestTasksCollection } from "./guest-tasks-collection"
import { STORAGE_KEYS, deviceStorage } from "./storage"
import type { ParkedThought } from "./types"

// Guest data from before the SQLite collections; imported once, then removed.
const LEGACY_KEYS = {
  tasks: "untangle.guest-tasks.v1",
  parkingLot: "untangle.parking-lot.v1",
} as const

// Mirrors isValidId in firestore.rules, so imported items can later be copied to an account.
const VALID_ID = /^[a-zA-Z0-9_-]{1,128}$/

function parseList<T>(raw: string | null | undefined): T[] | null {
  if (raw == null) return null
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) ? (value as T[]) : null
  } catch {
    return null
  }
}

/** Keeps each id when it is valid and unused; repeated or invalid ids get a fresh one. */
function withUniqueIds<T extends { id: string }>(items: T[], taken: Set<string>, prefix: string): T[] {
  return items.map((item) => {
    const id = VALID_ID.test(item.id) && !taken.has(item.id) ? item.id : `${prefix}_${randomUUID()}`
    taken.add(id)
    return { ...item, id }
  })
}

/** Moves guest tasks and parked thoughts saved in AsyncStorage into the guest collections. */
export async function importLegacyGuestData(): Promise<void> {
  const entries = await AsyncStorage.multiGet([LEGACY_KEYS.tasks, LEGACY_KEYS.parkingLot])
  const stored = new Map(entries)
  const tasks = parseList<MicroTask>(stored.get(LEGACY_KEYS.tasks))
  const thoughts = parseList<ParkedThought>(stored.get(LEGACY_KEYS.parkingLot))
  if (!tasks && !thoughts) return

  await Promise.all([guestTasksCollection.preload(), guestParkingLotCollection.preload()])
  const newTasks = withUniqueIds(tasks ?? [], new Set(guestTasksCollection.keys()), "task")
  const newThoughts = withUniqueIds(thoughts ?? [], new Set(guestParkingLotCollection.keys()), "thought")

  if (newTasks.length > 0) await guestTasksCollection.insert(newTasks).isPersisted.promise
  if (newThoughts.length > 0) await guestParkingLotCollection.insert(newThoughts).isPersisted.promise
  // Saved tasks, even an emptied list, mean this device is past its first launch.
  if (tasks) deviceStorage.setItem(STORAGE_KEYS.guestSeeded, "1")
  await AsyncStorage.multiRemove([LEGACY_KEYS.tasks, LEGACY_KEYS.parkingLot])
}
