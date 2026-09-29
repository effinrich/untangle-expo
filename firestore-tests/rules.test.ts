import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import type { DocumentData } from "firebase/firestore"
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore/lite"
import type { MicroTask } from "../services/api"
import { toParkingDoc, toTaskDoc } from "../services/db/doc-shapes"
import { anonymousLiteDb, disposeApps, signedInUser, type TestUser } from "./emulator"

let alice: TestUser
let bob: TestUser

const sampleTask: MicroTask = {
  id: "task_rules_1",
  title: "Reply to Jordan",
  firstPhysicalStep: "Open the email",
  estimatedMinutes: 10,
  energyLevel: "low",
  category: "Work",
  priority: "high",
  whyItMatters: "Unblocks the budget",
  substeps: [{ id: "sub-1", text: "Open inbox", completed: false }],
  completed: false,
  createdAt: "2026-09-29T12:00:00.000Z",
}

// Same object src/services/tasks.ts saveTaskToFirestore writes (with merge: true).
function webTaskDoc(task: MicroTask, userId: string): DocumentData {
  return {
    id: task.id,
    userId,
    title: task.title.slice(0, 300),
    firstPhysicalStep: task.firstPhysicalStep.slice(0, 500),
    estimatedMinutes: Number(task.estimatedMinutes) || 5,
    energyLevel: task.energyLevel || "medium",
    category: task.category || "Personal",
    priority: task.priority || "medium",
    whyItMatters: (task.whyItMatters || "").slice(0, 500),
    substeps: task.substeps || [],
    completed: Boolean(task.completed),
    completedAt: task.completedAt || null,
    createdAt: task.createdAt || new Date().toISOString(),
  }
}

const taskRef = (user: TestUser, ownerUid: string, id: string) =>
  doc(user.liteDb, `users/${ownerUid}/tasks/${id}`)

beforeAll(async () => {
  alice = await signedInUser("alice")
  bob = await signedInUser("bob")
})

afterAll(disposeApps)

describe("tasks", () => {
  test("web-shaped task (completedAt: null, merge) is accepted", async () => {
    const task = { ...sampleTask, id: "web_task" }
    await setDoc(taskRef(alice, alice.uid, task.id), webTaskDoc(task, alice.uid), { merge: true })
    await setDoc(
      taskRef(alice, alice.uid, task.id),
      webTaskDoc({ ...task, completed: true, completedAt: "2026-09-29T13:00:00.000Z" }, alice.uid),
      { merge: true },
    )
  })

  test("native-shaped task create, update, delete are accepted", async () => {
    const ref = taskRef(alice, alice.uid, sampleTask.id)
    await setDoc(ref, toTaskDoc(sampleTask, alice.uid))
    await setDoc(ref, toTaskDoc({ ...sampleTask, completed: true, completedAt: "2026-09-29T13:00:00.000Z" }, alice.uid))
    await setDoc(ref, toTaskDoc({ ...sampleTask, completed: false }, alice.uid))
    await deleteDoc(ref)
  })

  test("ghost fields are denied", async () => {
    const data = { ...toTaskDoc({ ...sampleTask, id: "ghost" }, alice.uid), isAdmin: true }
    await expect(setDoc(taskRef(alice, alice.uid, "ghost"), data)).rejects.toThrow()
  })

  test("unauthenticated and cross-tenant reads are denied", async () => {
    await setDoc(taskRef(alice, alice.uid, "private"), toTaskDoc({ ...sampleTask, id: "private" }, alice.uid))
    await expect(getDoc(doc(anonymousLiteDb(), `users/${alice.uid}/tasks/private`))).rejects.toThrow()
    await expect(getDocs(collection(bob.liteDb, `users/${alice.uid}/tasks`))).rejects.toThrow()
  })

  test("cross-tenant writes and userId spoofing are denied", async () => {
    const data = toTaskDoc({ ...sampleTask, id: "intrude" }, alice.uid)
    await expect(setDoc(taskRef(bob, alice.uid, "intrude"), data)).rejects.toThrow()
    await expect(setDoc(taskRef(bob, bob.uid, "intrude"), data)).rejects.toThrow()
  })

  test("path id mismatch and malformed ids are denied", async () => {
    const data = toTaskDoc(sampleTask, alice.uid)
    await expect(setDoc(taskRef(alice, alice.uid, "other_id"), data)).rejects.toThrow()
    const bad = toTaskDoc({ ...sampleTask, id: "bad id!" }, alice.uid)
    await expect(setDoc(taskRef(alice, alice.uid, "bad id!"), bad)).rejects.toThrow()
  })

  test("immutable createdAt is enforced on update", async () => {
    const ref = taskRef(alice, alice.uid, "immutable")
    await setDoc(ref, toTaskDoc({ ...sampleTask, id: "immutable" }, alice.uid))
    await expect(updateDoc(ref, { createdAt: "2020-01-01T00:00:00.000Z" })).rejects.toThrow()
  })

  test("oversized strings, bad enums, and too many substeps are denied", async () => {
    const base = toTaskDoc({ ...sampleTask, id: "limits" }, alice.uid)
    const ref = taskRef(alice, alice.uid, "limits")
    await expect(setDoc(ref, { ...base, title: "x".repeat(301) })).rejects.toThrow()
    await expect(setDoc(ref, { ...base, energyLevel: "nuclear" })).rejects.toThrow()
    const substeps = Array.from({ length: 51 }, (_, i) => ({ id: `s${i}`, text: "t", completed: false }))
    await expect(setDoc(ref, { ...base, substeps })).rejects.toThrow()
  })
})

describe("parking lot", () => {
  const thought = { id: "thought_1", text: "Buy stamps", createdAt: "2026-09-29T12:00:00.000Z" }

  test("owner can create and delete; web and native shapes match", async () => {
    const ref = doc(alice.liteDb, `users/${alice.uid}/parkingLot/${thought.id}`)
    await setDoc(ref, toParkingDoc(thought, alice.uid))
    await deleteDoc(ref)
  })

  test("ghost fields and cross-tenant writes are denied", async () => {
    const ref = doc(alice.liteDb, `users/${alice.uid}/parkingLot/ghost`)
    const data = toParkingDoc({ ...thought, id: "ghost" }, alice.uid)
    await expect(setDoc(ref, { ...data, convertedToTaskId: "x" })).rejects.toThrow()
    await expect(setDoc(doc(bob.liteDb, `users/${alice.uid}/parkingLot/ghost`), data)).rejects.toThrow()
  })
})

describe("profiles", () => {
  const profile = (user: TestUser, createdAt: string) => ({
    userId: user.uid,
    email: "a@test.dev",
    displayName: "Alice",
    photoURL: "",
    createdAt,
  })

  test("create-once profile (native) is accepted; user listing is denied", async () => {
    await setDoc(doc(alice.liteDb, `users/${alice.uid}`), profile(alice, "2026-09-29T12:00:00.000Z"))
    await expect(getDocs(collection(alice.liteDb, "users"))).rejects.toThrow()
    await expect(getDoc(doc(bob.liteDb, `users/${alice.uid}`))).rejects.toThrow()
  })

  test("web re-sign-in merge without createdAt is accepted (src/services/auth.ts)", async () => {
    const { createdAt: _createdAt, ...rest } = profile(alice, "")
    await setDoc(doc(alice.liteDb, `users/${alice.uid}`), { ...rest, displayName: "Alice B" }, { merge: true })
  })

  test("re-sign-in merge that rewrites createdAt is denied", async () => {
    await expect(
      setDoc(doc(alice.liteDb, `users/${alice.uid}`), profile(alice, new Date().toISOString()), { merge: true }),
    ).rejects.toThrow()
  })
})

describe("seed status", () => {
  test("only the owner can create the initial seed marker", async () => {
    const marker = doc(alice.liteDb, `users/${alice.uid}/seedStatus/initial`)
    await expect(setDoc(marker, { initialSeedsHandled: true, extra: true })).rejects.toThrow()
    await setDoc(marker, { initialSeedsHandled: true })
    expect((await getDoc(marker)).data()).toEqual({ initialSeedsHandled: true })
    await expect(setDoc(marker, { initialSeedsHandled: false })).rejects.toThrow()
    await expect(getDoc(doc(bob.liteDb, `users/${alice.uid}/seedStatus/initial`))).rejects.toThrow()
  })
})
