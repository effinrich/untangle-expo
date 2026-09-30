import {
  collection,
  doc,
  getDocs,
  getDoc,
  limit,
  query,
  runTransaction,
  setDoc,
  type DocumentData,
  type Firestore,
} from "firebase/firestore"
import type { MicroTask } from "../api"
import { INITIAL_SEED_TASKS } from "../../src/data/seed-data"
import { toParkingDoc, toTaskDoc } from "./doc-shapes"
import type { ParkedThought } from "./types"

const TRANSACTION_CHUNK = 200

type DocEntry = [path: string, data: DocumentData]

function seedFingerprint(task: MicroTask): string {
  return JSON.stringify([
    task.title,
    task.firstPhysicalStep,
    task.estimatedMinutes,
    task.energyLevel,
    task.category,
    task.completed,
    task.substeps?.map((step) => [step.id, step.text, step.completed]),
  ])
}

const SEED_FINGERPRINTS = new Map(
  INITIAL_SEED_TASKS.map((task) => [task.id, seedFingerprint(task)]),
)

export function isUntouchedSeed(task: MicroTask): boolean {
  return SEED_FINGERPRINTS.get(task.id) === seedFingerprint(task)
}

/** Creates docs that don't exist yet; existing docs win, so reruns never duplicate or overwrite. */
async function createMissing(firestore: Firestore, entries: DocEntry[]): Promise<void> {
  for (let start = 0; start < entries.length; start += TRANSACTION_CHUNK) {
    const chunk = entries.slice(start, start + TRANSACTION_CHUNK)
    await runTransaction(firestore, async (transaction) => {
      const refs = chunk.map(([path]) => doc(firestore, path))
      const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)))
      snapshots.forEach((snapshot, index) => {
        if (!snapshot.exists()) transaction.set(refs[index], chunk[index][1])
      })
    })
  }
}

/**
 * Copies guest data into the user's collections. Unedited sample tasks only go to brand-new
 * accounts, so signing in on a new device doesn't bring back samples the user already deleted.
 */
export async function migrateGuestData(
  firestore: Firestore,
  userId: string,
  guest: { tasks: MicroTask[]; thoughts: ParkedThought[] },
): Promise<void> {
  const tasksPath = `users/${userId}/tasks`
  const seedMarker = doc(firestore, `users/${userId}/metadata/initial-seeds`)
  const [marker, existing] = await Promise.all([
    getDoc(seedMarker),
    getDocs(query(collection(firestore, tasksPath), limit(1))),
  ])
  const shouldSeed = !marker.exists() && existing.empty
  const tasks = shouldSeed ? guest.tasks : guest.tasks.filter((task) => !isUntouchedSeed(task))

  await createMissing(firestore, [
    ...tasks.map((task): DocEntry => [`${tasksPath}/${task.id}`, toTaskDoc(task, userId)]),
    ...guest.thoughts.map((thought): DocEntry => [
      `users/${userId}/parkingLot/${thought.id}`,
      toParkingDoc(thought, userId),
    ]),
  ])
  if (!marker.exists()) await setDoc(seedMarker, { seedsHandled: true })
}
