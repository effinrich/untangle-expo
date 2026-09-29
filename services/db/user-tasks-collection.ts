import "./polyfills"
import { createCollection } from "@tanstack/db"
import type { MicroTask } from "../api"
import { db } from "../firebase"
import { fromTaskDoc } from "./doc-shapes"
import { firestoreCollectionOptions } from "./firestore-collection"
import { deviceStorage, userKey } from "./storage"

export function createUserTasksCollection(userId: string, onError: (error: unknown) => void) {
  return createCollection(
    firestoreCollectionOptions<MicroTask>({
      id: `tasks:${userId}`,
      firestore: db,
      path: `users/${userId}/tasks`,
      cache: deviceStorage,
      cacheKey: userKey(userId, "tasks"),
      getKey: (task) => task.id,
      fromDoc: fromTaskDoc,
      onError,
    }),
  )
}

export type UserTasksCollection = ReturnType<typeof createUserTasksCollection>
