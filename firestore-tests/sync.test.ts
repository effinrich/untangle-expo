import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { createCollection, type StorageApi } from "@tanstack/db"
import {
  NonRetriableError,
  startOfflineExecutor,
  type OnlineDetector,
  type StorageAdapter,
} from "@tanstack/offline-transactions"
import { deleteDoc, disableNetwork, doc, enableNetwork, getDoc, getDocs, collection, setDoc } from "firebase/firestore"
import type { MicroTask } from "../services/api"
import { INITIAL_SEED_TASKS } from "../src/data/seed-data"
import { fromParkingDoc, fromTaskDoc, toParkingDoc, toTaskDoc } from "../services/db/doc-shapes"
import { firestoreCollectionOptions } from "../services/db/firestore-collection"
import { firestoreMutationFn } from "../services/db/firestore-writer"
import { migrateGuestData } from "../services/db/migrate-guest-data"
import { singleContextLeader } from "../services/db/single-context-leader"
import type { ParkedThought } from "../services/db/types"
import { disposeApps, signedInUser, type TestUser } from "./emulator"

let user: TestUser

function memoryStorage(): StorageApi & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

function memoryAdapter(data = new Map<string, string>()): StorageAdapter {
  return {
    get: async (key) => data.get(key) ?? null,
    set: async (key, value) => void data.set(key, value),
    delete: async (key) => void data.delete(key),
    keys: async () => [...data.keys()],
    clear: async () => data.clear(),
  }
}

function toggleableOnline(online: boolean): OnlineDetector & { goOnline: () => void } {
  const listeners = new Set<() => void>()
  return {
    isOnline: () => online,
    subscribe: (callback) => {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
    notifyOnline: () => listeners.forEach((listener) => listener()),
    goOnline() {
      online = true
      listeners.forEach((listener) => listener())
    },
    dispose: () => listeners.clear(),
  }
}

async function waitFor(check: () => boolean | Promise<boolean>, timeoutMs = 5000): Promise<void> {
  const start = Date.now()
  while (!(await check())) {
    if (Date.now() - start > timeoutMs) throw new Error("Timed out waiting for condition")
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

const task = (id: string, extra: Partial<MicroTask> = {}): MicroTask => ({
  id,
  title: `Task ${id}`,
  firstPhysicalStep: "Stand up",
  estimatedMinutes: 5,
  energyLevel: "low",
  category: "Home",
  priority: "medium",
  whyItMatters: "",
  substeps: [],
  completed: false,
  createdAt: "2026-09-29T12:00:00.000Z",
  ...extra,
})

function userCollections(uid: string, cache: StorageApi) {
  const tasks = createCollection(
    firestoreCollectionOptions<MicroTask>({
      id: `tasks:${uid}`,
      firestore: user.db,
      path: `users/${uid}/tasks`,
      cache,
      cacheKey: "tasks",
      getKey: (item) => item.id,
      fromDoc: fromTaskDoc,
    }),
  )
  const parkingLot = createCollection(
    firestoreCollectionOptions<ParkedThought>({
      id: `parking-lot:${uid}`,
      firestore: user.db,
      path: `users/${uid}/parkingLot`,
      cache,
      cacheKey: "parking-lot",
      getKey: (item) => item.id,
      fromDoc: fromParkingDoc,
    }),
  )
  return { tasks, parkingLot }
}

function outboxFor(
  uid: string,
  collections: ReturnType<typeof userCollections>,
  onlineDetector: OnlineDetector,
  data?: Map<string, string>,
) {
  return startOfflineExecutor({
    collections,
    mutationFns: {
      firestoreWrite: firestoreMutationFn(user.db, {
        [collections.tasks.id]: {
          path: (key) => `users/${uid}/tasks/${key}`,
          toDoc: (item) => toTaskDoc(item as unknown as MicroTask, uid),
        },
        [collections.parkingLot.id]: {
          path: (key) => `users/${uid}/parkingLot/${key}`,
          toDoc: (item) => toParkingDoc(item as unknown as ParkedThought, uid),
        },
      }),
    },
    storage: memoryAdapter(data),
    onlineDetector,
    leaderElection: singleContextLeader,
  })
}

beforeAll(async () => {
  user = await signedInUser("sync")
})

afterAll(disposeApps)

describe("firestore collection", () => {
  test("mirrors remote inserts, updates, and deletes and writes the device cache", async () => {
    const cache = memoryStorage()
    const { tasks } = userCollections(user.uid, cache)
    await tasks.preload()

    await setDoc(doc(user.db, `users/${user.uid}/tasks/remote_1`), toTaskDoc(task("remote_1"), user.uid))
    await waitFor(() => tasks.has("remote_1"))
    expect(tasks.get("remote_1")?.completedAt).toBeUndefined()

    await setDoc(
      doc(user.db, `users/${user.uid}/tasks/remote_1`),
      toTaskDoc(task("remote_1", { completed: true, completedAt: "2026-09-29T13:00:00.000Z" }), user.uid),
    )
    await waitFor(() => tasks.get("remote_1")?.completed === true)

    await deleteDoc(doc(user.db, `users/${user.uid}/tasks/remote_1`))
    await waitFor(() => !tasks.has("remote_1"))
    expect(JSON.parse(cache.data.get("tasks") ?? "[]")).toEqual([])
    await tasks.cleanup()
  })

  test("hydrates from the device cache before Firestore answers", async () => {
    const cache = memoryStorage()
    cache.setItem("tasks", JSON.stringify([task("cached_only")]))
    const { tasks } = userCollections(user.uid, cache)
    await tasks.preload()
    expect(tasks.has("cached_only")).toBe(true)
    await waitFor(() => !tasks.has("cached_only"))
    await tasks.cleanup()
  })

  test("an empty cache-only snapshot preserves the device cache", async () => {
    const cache = memoryStorage()
    cache.setItem("tasks", JSON.stringify([task("offline_cached")]))
    const { tasks } = userCollections(user.uid, cache)
    await disableNetwork(user.db)
    try {
      await tasks.preload()
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(tasks.has("offline_cached")).toBe(true)
      expect(JSON.parse(cache.data.get("tasks") ?? "[]")).toEqual([task("offline_cached")])
    } finally {
      await tasks.cleanup()
      await enableNetwork(user.db)
    }
  })
})

describe("offline outbox", () => {
  test("optimistic insert is written to Firestore and stays after sync", async () => {
    const collections = userCollections(user.uid, memoryStorage())
    await collections.tasks.preload()
    const outbox = outboxFor(user.uid, collections, toggleableOnline(true))
    await outbox.waitForInit()

    const tx = outbox.createOfflineTransaction({ mutationFnName: "firestoreWrite", autoCommit: false })
    tx.mutate(() => collections.tasks.insert(task("outbox_1")))
    expect(collections.tasks.has("outbox_1")).toBe(true)
    await tx.commit()

    expect((await getDoc(doc(user.db, `users/${user.uid}/tasks/outbox_1`))).exists()).toBe(true)
    await waitFor(() => collections.tasks.has("outbox_1"))
    outbox.dispose()
    await collections.tasks.cleanup()
  })

  test("a rules rejection rolls the optimistic change back verbatim", async () => {
    const collections = userCollections(user.uid, memoryStorage())
    await setDoc(doc(user.db, `users/${user.uid}/tasks/keep_me`), toTaskDoc(task("keep_me"), user.uid))
    await collections.tasks.preload()
    await waitFor(() => collections.tasks.has("keep_me"))
    const before = JSON.stringify(collections.tasks.get("keep_me"))
    const outbox = outboxFor(user.uid, collections, toggleableOnline(true))
    await outbox.waitForInit()

    const update = outbox.createOfflineTransaction({ mutationFnName: "firestoreWrite", autoCommit: false })
    update.mutate(() =>
      collections.tasks.update("keep_me", (draft) => {
        draft.title = ""
        draft.completed = true
      }),
    )
    expect(collections.tasks.get("keep_me")?.completed).toBe(true)
    await expect(update.commit()).rejects.toBeInstanceOf(NonRetriableError)
    // The SDK's own latency-compensated snapshot reverts once the server rejects the write.
    await waitFor(() => JSON.stringify(collections.tasks.get("keep_me")) === before)

    const insert = outbox.createOfflineTransaction({ mutationFnName: "firestoreWrite", autoCommit: false })
    insert.mutate(() => collections.tasks.insert(task("bad id!")))
    expect(collections.tasks.has("bad id!")).toBe(true)
    await expect(insert.commit()).rejects.toBeInstanceOf(NonRetriableError)
    await waitFor(() => !collections.tasks.has("bad id!"))
    outbox.dispose()
    await collections.tasks.cleanup()
  })

  test("an oversized offline transaction is rejected before any Firestore write", async () => {
    const collections = userCollections(user.uid, memoryStorage())
    await collections.tasks.preload()
    const outbox = outboxFor(user.uid, collections, toggleableOnline(true))
    await outbox.waitForInit()

    const tx = outbox.createOfflineTransaction({
      mutationFnName: "firestoreWrite",
      autoCommit: false,
    })
    tx.mutate(() =>
      collections.tasks.insert(Array.from({ length: 501 }, (_, index) => task(`batch_${index}`))),
    )
    await expect(tx.commit()).rejects.toBeInstanceOf(NonRetriableError)
    const savedTasks = await getDocs(collection(user.db, `users/${user.uid}/tasks`))
    expect(savedTasks.docs.some((snapshot) => snapshot.id.startsWith("batch_"))).toBe(false)

    outbox.dispose()
    await collections.tasks.cleanup()
  })

  test("writes made offline survive a restart and replay when back online", async () => {
    const outboxData = new Map<string, string>()
    const first = userCollections(user.uid, memoryStorage())
    await first.parkingLot.preload()
    const offlineOutbox = outboxFor(user.uid, first, toggleableOnline(false), outboxData)
    await offlineOutbox.waitForInit()

    const tx = offlineOutbox.createOfflineTransaction({ mutationFnName: "firestoreWrite", autoCommit: false })
    tx.mutate(() =>
      first.parkingLot.insert({ id: "thought_offline", text: "Call mum", createdAt: "2026-09-29T12:00:00.000Z" }),
    )
    void tx.commit().catch(() => {})
    await waitFor(() => outboxData.size > 0)
    offlineOutbox.dispose()
    await first.parkingLot.cleanup()
    expect((await getDoc(doc(user.db, `users/${user.uid}/parkingLot/thought_offline`))).exists()).toBe(false)

    const second = userCollections(user.uid, memoryStorage())
    await second.parkingLot.preload()
    const online = toggleableOnline(false)
    const restarted = outboxFor(user.uid, second, online, outboxData)
    await restarted.waitForInit()
    expect(second.parkingLot.has("thought_offline")).toBe(true)

    online.goOnline()
    await waitFor(async () =>
      (await getDoc(doc(user.db, `users/${user.uid}/parkingLot/thought_offline`))).exists(),
    )
    await waitFor(() => restarted.getPendingCount() === 0)
    restarted.dispose()
    await second.parkingLot.cleanup()
  })
})

describe("guest migration", () => {
  test("is idempotent, never overwrites, and seeds only brand-new accounts", async () => {
    const fresh = await signedInUser("migrate")
    const seeds = INITIAL_SEED_TASKS.map((seed) => ({ ...seed }))
    const guest = {
      tasks: [...seeds, task("guest_own")],
      thoughts: [{ id: "thought_guest", text: "Water plants", createdAt: "2026-09-29T12:00:00.000Z" }],
    }

    await migrateGuestData(fresh.db, fresh.uid, guest)
    await setDoc(
      doc(fresh.db, `users/${fresh.uid}/tasks/guest_own`),
      toTaskDoc(task("guest_own", { title: "Edited on web" }), fresh.uid),
    )
    await migrateGuestData(fresh.db, fresh.uid, guest)

    const tasks = await getDocs(collection(fresh.db, `users/${fresh.uid}/tasks`))
    expect(tasks.size).toBe(seeds.length + 1)
    expect((await getDoc(doc(fresh.db, `users/${fresh.uid}/tasks/guest_own`))).data()?.title).toBe(
      "Edited on web",
    )
    expect((await getDocs(collection(fresh.db, `users/${fresh.uid}/parkingLot`))).size).toBe(1)

    await deleteDoc(doc(fresh.db, `users/${fresh.uid}/tasks/seed-task-1`))
    await migrateGuestData(fresh.db, fresh.uid, guest)
    expect((await getDoc(doc(fresh.db, `users/${fresh.uid}/tasks/seed-task-1`))).exists()).toBe(false)

    await Promise.all(
      seeds.map((seed) => deleteDoc(doc(fresh.db, `users/${fresh.uid}/tasks/${seed.id}`))),
    )
    await migrateGuestData(fresh.db, fresh.uid, guest)
    const afterDeletes = await getDocs(collection(fresh.db, `users/${fresh.uid}/tasks`))
    expect(afterDeletes.docs.map((snapshot) => snapshot.id)).toEqual(["guest_own"])
  })

  test("does not seed samples when the account already has tasks", async () => {
    const existingAccount = await signedInUser("migrate-existing")
    await setDoc(
      doc(existingAccount.db, `users/${existingAccount.uid}/tasks/created_before_migration`),
      toTaskDoc(task("created_before_migration"), existingAccount.uid),
    )
    await migrateGuestData(existingAccount.db, existingAccount.uid, {
      tasks: INITIAL_SEED_TASKS.map((seed) => ({ ...seed })),
      thoughts: [],
    })
    const tasks = await getDocs(
      collection(existingAccount.db, `users/${existingAccount.uid}/tasks`),
    )
    expect(tasks.docs.map((snapshot) => snapshot.id)).toEqual(["created_before_migration"])
    expect(
      (
        await getDoc(doc(existingAccount.db, `users/${existingAccount.uid}/metadata/initial-seeds`))
      ).data(),
    ).toEqual({
      seedsHandled: true,
    })
  })
})
