import "./polyfills"
import { startOfflineExecutor, type OfflineExecutor } from "@tanstack/offline-transactions"
import { ReactNativeOnlineDetector } from "@tanstack/offline-transactions/dist/cjs/connectivity/ReactNativeOnlineDetector.cjs"
import type { MicroTask } from "../api"
import { db } from "../firebase"
import { toParkingDoc, toTaskDoc } from "./doc-shapes"
import { firestoreMutationFn } from "./firestore-writer"
import { singleContextLeader } from "./single-context-leader"
import { prefixedStorageAdapter, userKey } from "./storage"
import type { ParkedThought } from "./types"
import type { UserParkingLotCollection } from "./user-parking-lot-collection"
import type { UserTasksCollection } from "./user-tasks-collection"

export const FIRESTORE_WRITE = "firestoreWrite"

/**
 * Persisted write queue for a signed-in user. Survives app kills (the Firebase JS SDK on
 * React Native only queues writes in memory) and replays when connectivity returns.
 */
export function startUserOutbox(
  userId: string,
  tasks: UserTasksCollection,
  parkingLot: UserParkingLotCollection,
): OfflineExecutor {
  return startOfflineExecutor({
    collections: { tasks, parkingLot },
    mutationFns: {
      [FIRESTORE_WRITE]: firestoreMutationFn(db, {
        [tasks.id]: {
          path: (key) => `users/${userId}/tasks/${key}`,
          toDoc: (item) => toTaskDoc(item as unknown as MicroTask, userId),
        },
        [parkingLot.id]: {
          path: (key) => `users/${userId}/parkingLot/${key}`,
          toDoc: (item) => toParkingDoc(item as unknown as ParkedThought, userId),
        },
      }),
    },
    storage: prefixedStorageAdapter(userKey(userId, "outbox.")),
    onlineDetector: new ReactNativeOnlineDetector(),
    leaderElection: singleContextLeader,
  })
}
