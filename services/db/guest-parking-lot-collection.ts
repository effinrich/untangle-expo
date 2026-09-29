import "./polyfills"
import { createCollection, localStorageCollectionOptions } from "@tanstack/db"
import { STORAGE_KEYS, deviceStorage, noStorageEvents } from "./storage"
import type { ParkedThought } from "./types"

export const guestParkingLotCollection = createCollection(
  localStorageCollectionOptions<ParkedThought, string>({
    id: "guest-parking-lot",
    storageKey: STORAGE_KEYS.guestParkingLot,
    storage: deviceStorage,
    storageEventApi: noStorageEvents,
    gcTime: 0,
    getKey: (thought) => thought.id,
  }),
)
