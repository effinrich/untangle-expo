import { db } from "../firebase"
import { guestParkingLotCollection } from "./guest-parking-lot-collection"
import { guestTasksCollection } from "./guest-tasks-collection"
import { importLegacyGuestData } from "./legacy-guest-data"
import { migrateGuestData } from "./migrate-guest-data"

/**
 * Copies guest data into the account, then clears it from the device. If the session ended
 * while copying (sign-out or account switch), the device copy is left for guest mode to keep.
 */
export async function moveGuestToAccount(
  userId: string,
  isSessionActive: () => boolean,
): Promise<void> {
  await importLegacyGuestData()
  await Promise.all([guestTasksCollection.preload(), guestParkingLotCollection.preload()])
  const tasks = guestTasksCollection.toArray
  const thoughts = guestParkingLotCollection.toArray
  if (tasks.length === 0 && thoughts.length === 0) return

  const taskSnapshots = new Map(tasks.map((task) => [task.id, JSON.stringify(task)]))
  const thoughtSnapshots = new Map(thoughts.map((thought) => [thought.id, JSON.stringify(thought)]))
  await migrateGuestData(db, userId, { tasks, thoughts })
  if (!isSessionActive()) return

  const currentTasks = new Map(
    guestTasksCollection.toArray.map((task) => [task.id, JSON.stringify(task)]),
  )
  const currentThoughts = new Map(
    guestParkingLotCollection.toArray.map((thought) => [thought.id, JSON.stringify(thought)]),
  )
  const unchangedTaskIds = tasks
    .filter((task) => currentTasks.get(task.id) === taskSnapshots.get(task.id))
    .map((task) => task.id)
  const unchangedThoughtIds = thoughts
    .filter((thought) => currentThoughts.get(thought.id) === thoughtSnapshots.get(thought.id))
    .map((thought) => thought.id)

  if (!isSessionActive()) return
  const deletions: Promise<unknown>[] = []
  if (unchangedTaskIds.length > 0) {
    deletions.push(guestTasksCollection.delete(unchangedTaskIds).isPersisted.promise)
  }
  if (unchangedThoughtIds.length > 0) {
    deletions.push(guestParkingLotCollection.delete(unchangedThoughtIds).isPersisted.promise)
  }
  await Promise.all(deletions)
}
