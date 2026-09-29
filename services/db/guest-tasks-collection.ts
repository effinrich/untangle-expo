import "./polyfills"
import { createCollection, localStorageCollectionOptions } from "@tanstack/db"
import type { MicroTask } from "../api"
import { INITIAL_SEED_TASKS } from "../../src/data/seed-data"
import { STORAGE_KEYS, deviceStorage, noStorageEvents } from "./storage"

export const guestTasksCollection = createCollection(
  localStorageCollectionOptions<MicroTask, string>({
    id: "guest-tasks",
    storageKey: STORAGE_KEYS.guestTasks,
    storage: deviceStorage,
    storageEventApi: noStorageEvents,
    gcTime: 0,
    getKey: (task) => task.id,
  }),
)

/** Adds the sample tasks on first launch only; deleting them later is permanent. */
export async function ensureGuestSeeded(): Promise<void> {
  if (deviceStorage.getItem(STORAGE_KEYS.guestSeeded)) return
  await guestTasksCollection.preload()
  if (guestTasksCollection.size === 0) {
    const createdAt = new Date().toISOString()
    const seeds = INITIAL_SEED_TASKS.map((task) => ({
      ...task,
      substeps: task.substeps?.map((step) => ({ ...step })),
      createdAt,
    }))
    await guestTasksCollection.insert(seeds).isPersisted.promise
  }
  deviceStorage.setItem(STORAGE_KEYS.guestSeeded, "1")
}
