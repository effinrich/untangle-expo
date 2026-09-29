import type { CollectionConfig, StorageApi } from "@tanstack/db"
import { collection, onSnapshot, type DocumentData, type Firestore } from "firebase/firestore"

export interface FirestoreCollectionConfig<T extends object> {
  id: string
  firestore: Firestore
  path: string
  cache: StorageApi
  cacheKey: string
  getKey: (item: T) => string
  fromDoc: (data: DocumentData) => T
  onError?: (error: unknown) => void
}

function readCache<T>(cache: StorageApi, cacheKey: string): T[] {
  try {
    const raw = cache.getItem(cacheKey)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

/**
 * Read side of a signed-in collection: shows the device cache immediately, then mirrors the
 * Firestore collection live. Writes go through the offline outbox, not collection handlers.
 */
export function firestoreCollectionOptions<T extends object>(
  config: FirestoreCollectionConfig<T>,
): CollectionConfig<T, string> {
  const { firestore, path, cache, cacheKey, getKey, fromDoc, onError } = config

  return {
    id: config.id,
    getKey,
    gcTime: 0,
    sync: {
      sync: ({ begin, write, commit, markReady }) => {
        let known = new Map<string, string>()
        let ready = false
        const markReadyOnce = () => {
          if (ready) return
          ready = true
          markReady()
        }
        const cached = readCache<T>(cache, cacheKey)

        if (cached.length > 0) {
          begin()
          for (const item of cached) {
            known.set(getKey(item), JSON.stringify(item))
            write({ type: "insert", value: item })
          }
          commit()
          markReadyOnce()
        }

        const unsubscribe = onSnapshot(
          collection(firestore, path),
          (snapshot) => {
            // The device cache is authoritative until Firestore supplies a server-backed snapshot.
            // Ignoring cache-only snapshots also keeps stale SDK data from replacing outbox edits.
            if (snapshot.metadata.fromCache) {
              markReadyOnce()
              return
            }

            const next = new Map<string, string>()
            const items: T[] = []
            begin()
            snapshot.forEach((docSnap) => {
              const item = fromDoc(docSnap.data())
              const key = getKey(item)
              const json = JSON.stringify(item)
              next.set(key, json)
              items.push(item)
              const previous = known.get(key)
              if (previous === undefined) write({ type: "insert", value: item })
              else if (previous !== json) write({ type: "update", value: item })
            })
            for (const [key, json] of known) {
              if (!next.has(key)) write({ type: "delete", value: JSON.parse(json) as T })
            }
            commit()
            known = next
            cache.setItem(cacheKey, JSON.stringify(items))
            markReadyOnce()
          },
          (error) => {
            onError?.(error)
            markReadyOnce()
          },
        )

        return () => unsubscribe()
      },
    },
  }
}
