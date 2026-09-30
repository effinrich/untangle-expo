import { useEffect, useState } from "react"
import type { Collection } from "@tanstack/db"
import type { OfflineExecutor } from "@tanstack/offline-transactions"
import { randomUUID } from "expo-crypto"
import type { User } from "firebase/auth"
import type { MicroTask } from "../services/api"
import { guestParkingLotCollection } from "../services/db/guest-parking-lot-collection"
import { ensureGuestSeeded, guestTasksCollection } from "../services/db/guest-tasks-collection"
import { importLegacyGuestData } from "../services/db/legacy-guest-data"
import { moveGuestToAccount } from "../services/db/move-guest-to-account"
import { FIRESTORE_WRITE, startUserOutbox } from "../services/db/outbox"
import { STORAGE_KEYS, removeDeviceKeys } from "../services/db/storage"
import type { ParkedThought } from "../services/db/types"
import { createUserParkingLotCollection } from "../services/db/user-parking-lot-collection"
import { createUserTasksCollection } from "../services/db/user-tasks-collection"

export interface DataCollections {
  tasks: Collection<MicroTask, string>
  parkingLot: Collection<ParkedThought, string>
}

type DataSource = DataCollections & { outbox: OfflineExecutor | null }

const GUEST_SOURCE: DataSource = {
  tasks: guestTasksCollection,
  parkingLot: guestParkingLotCollection,
  outbox: null,
}

const MIGRATION_RETRY_MS = 5_000
const MIGRATION_RETRY_MAX_MS = 60_000

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Guests read and write device-only collections. Signed-in users read a live Firestore mirror
 * and write through a persisted outbox; guest data is copied up (retrying until it succeeds),
 * then cleared locally.
 */
export function useAppData(user: User | null, authReady: boolean) {
  const [source, setSource] = useState<DataSource>(GUEST_SOURCE)
  const [dataReady, setDataReady] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const userId = user?.uid ?? null

  useEffect(() => {
    if (!authReady) return
    let cancelled = false
    setDataReady(false)
    setSyncError(null)

    if (!userId) {
      removeDeviceKeys(STORAGE_KEYS.userPrefix)
      setSource(GUEST_SOURCE)
      importLegacyGuestData()
        .then(() => Promise.all([ensureGuestSeeded(), guestParkingLotCollection.preload()]))
        .catch((error) => setSyncError(errorMessage(error)))
        .finally(() => {
          if (!cancelled) setDataReady(true)
        })
      return () => {
        cancelled = true
      }
    }

    setSource(GUEST_SOURCE)
    removeDeviceKeys(STORAGE_KEYS.userPrefix, `${STORAGE_KEYS.userPrefix}${userId}.`)
    const onError = (error: unknown) => setSyncError(errorMessage(error))
    const tasks = createUserTasksCollection(userId, onError)
    const parkingLot = createUserParkingLotCollection(userId, onError)
    const outbox = startUserOutbox(userId, tasks, parkingLot)

    Promise.all([tasks.preload(), parkingLot.preload(), outbox.waitForInit()])
      .catch(onError)
      .finally(() => {
        if (!cancelled) setDataReady(true)
      })
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    const migrate = (attempt: number) => {
      moveGuestToAccount(userId, () => !cancelled)
        .then(() => {
          if (!cancelled) setSource({ tasks, parkingLot, outbox })
        })
        .catch((error) => {
          if (cancelled) return
          const delay = Math.min(MIGRATION_RETRY_MS * 2 ** attempt, MIGRATION_RETRY_MAX_MS)
          console.warn(`Guest data migration failed; retrying in ${delay / 1000}s:`, error)
          retryTimer = setTimeout(() => migrate(attempt + 1), delay)
        })
    }
    migrate(0)

    return () => {
      cancelled = true
      clearTimeout(retryTimer)
      outbox.dispose()
      void tasks.cleanup()
      void parkingLot.cleanup()
    }
  }, [authReady, userId])

  const write = (change: (collections: DataCollections) => void) => {
    if (!source.outbox) {
      change(source)
      return
    }
    const transaction = source.outbox.createOfflineTransaction({
      mutationFnName: FIRESTORE_WRITE,
      autoCommit: false,
    })
    transaction.mutate(() => change(source))
    transaction.commit().catch((error: unknown) => setSyncError(errorMessage(error)))
  }

  // AI-provided ids repeat across dumps and may not match the Firestore id rule.
  const addTasks = (newTasks: MicroTask[]) =>
    write(({ tasks }) =>
      tasks.insert(
        newTasks.map((task) => ({
          ...task,
          id: `task_${randomUUID()}`,
          ...(userId ? { userId } : {}),
        })),
      ),
    )

  const setCompleted = (id: string, completed: boolean) =>
    write(({ tasks }) =>
      tasks.update(id, (draft) => {
        draft.completed = completed
        if (completed) draft.completedAt = new Date().toISOString()
        else delete draft.completedAt
      }),
    )

  const deleteTask = (id: string) => write(({ tasks }) => tasks.delete(id))

  const parkThought = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const thought: ParkedThought = {
      id: `thought_${randomUUID()}`,
      text: trimmed,
      createdAt: new Date().toISOString(),
      ...(userId ? { userId } : {}),
    }
    write(({ parkingLot }) => parkingLot.insert(thought))
  }

  const removeThought = (id: string) => write(({ parkingLot }) => parkingLot.delete(id))

  return {
    collections: source as DataCollections,
    dataReady,
    syncError,
    clearSyncError: () => setSyncError(null),
    hasUnsyncedChanges: () => (source.outbox?.getPendingCount() ?? 0) > 0,
    addTasks,
    setCompleted,
    deleteTask,
    parkThought,
    removeThought,
  }
}
