import { FirebaseError } from "firebase/app"
import { deleteDoc, doc, setDoc, type DocumentData, type Firestore } from "firebase/firestore"
import { NonRetriableError, type OfflineConfig } from "@tanstack/offline-transactions"

type OfflineMutationFn = OfflineConfig["mutationFns"][string]

export interface DocWriter {
  path: (key: string) => string
  toDoc: (item: Record<string, unknown>) => DocumentData
}

// Retrying these can't succeed; the outbox drops the transaction and rolls back its optimistic state.
const PERMANENT_CODES = new Set([
  "permission-denied",
  "invalid-argument",
  "unauthenticated",
  "out-of-range",
])

/** Outbox mutation function: writes every mutation in a transaction to Firestore by doc id. */
export function firestoreMutationFn(
  firestore: Firestore,
  writers: Record<string, DocWriter>,
): OfflineMutationFn {
  return async ({ transaction }) => {
    for (const mutation of transaction.mutations) {
      const writer = writers[mutation.collection.id]
      if (!writer) throw new NonRetriableError(`No Firestore writer for ${mutation.collection.id}`)
      const ref = doc(firestore, writer.path(String(mutation.key)))
      try {
        if (mutation.type === "delete") await deleteDoc(ref)
        else await setDoc(ref, writer.toDoc(mutation.modified))
      } catch (error) {
        if (error instanceof FirebaseError && PERMANENT_CODES.has(error.code)) {
          throw new NonRetriableError(error.message)
        }
        throw error
      }
    }
  }
}
