import "./polyfills"
import { createCollection } from "@tanstack/db"
import { db } from "../firebase"
import { fromParkingDoc } from "./doc-shapes"
import { firestoreCollectionOptions } from "./firestore-collection"
import { deviceStorage, userKey } from "./storage"
import type { ParkedThought } from "./types"

export function createUserParkingLotCollection(userId: string, onError: (error: unknown) => void) {
  return createCollection(
    firestoreCollectionOptions<ParkedThought>({
      id: `parking-lot:${userId}`,
      firestore: db,
      path: `users/${userId}/parkingLot`,
      cache: deviceStorage,
      cacheKey: userKey(userId, "parking-lot"),
      getKey: (thought) => thought.id,
      fromDoc: fromParkingDoc,
      onError,
    }),
  )
}

export type UserParkingLotCollection = ReturnType<typeof createUserParkingLotCollection>
