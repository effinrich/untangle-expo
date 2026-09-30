import { FirebaseError } from "firebase/app"
import { doc, writeBatch, type DocumentData, type Firestore } from "firebase/firestore"
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

// Firestore caps a write batch at 500 operations.
const BATCH_LIMIT = 500

/** Outbox mutation function: writes a transaction's mutations to Firestore as one batch. */
export function firestoreMutationFn(
  firestore: Firestore,
  writers: Record<string, DocWriter>,
): OfflineMutationFn {
  return async ({ transaction }) => {
    const writes = transaction.mutations.map((mutation) => {
      const writer = writers[mutation.collection.id]
      if (!writer) throw new NonRetriableError(`No Firestore writer for ${mutation.collection.id}`)
      return { mutation, writer, ref: doc(firestore, writer.path(String(mutation.key))) }
    })

    if (writes.length > BATCH_LIMIT) {
      throw new NonRetriableError(
        `Outbox transaction exceeds Firestore's ${BATCH_LIMIT}-write batch limit`,
      )
    }

    const batch = writeBatch(firestore)
    for (const { mutation, writer, ref } of writes) {
      if (mutation.type === "delete") batch.delete(ref)
      else batch.set(ref, writer.toDoc(mutation.modified))
    }
    try {
      await batch.commit()
    } catch (error) {
      if (error instanceof FirebaseError && PERMANENT_CODES.has(error.code)) {
        throw new NonRetriableError(error.message)
      }
      throw error
    }
  }
}
