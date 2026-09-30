import { db } from "../firebase"
import { guestParkingLotCollection } from "./guest-parking-lot-collection"
import { guestTasksCollection } from "./guest-tasks-collection"
import { importLegacyGuestData } from "./legacy-guest-data"
import { migrateGuestData } from "./migrate-guest-data"

/**
 * Copies guest data into the account, then clears it from the device. If the session ended
 * while copying (sign-out or account switch), the device copy is left for guest mode to keep.
 */
export async function moveGuestToAccount(userId: string, isSessionActive: () => boolean): Promise<void> {
  await importLegacyGuestData()
  await Promise.all([guestTasksCollection.preload(), guestParkingLotCollection.preload()])
  const tasks = guestTasksCollection.toArray
  const thoughts = guestParkingLotCollection.toArray

  await migrateGuestData(db, userId, { tasks, thoughts })
  if (!isSessionActive()) return

  const unchangedTasks = tasks.filter((task) => {
    const current = guestTasksCollection.get(task.id)
    return current !== undefined && JSON.stringify(current) === JSON.stringify(task)
  })
  const unchangedThoughts = thoughts.filter((thought) => {
    const current = guestParkingLotCollection.get(thought.id)
    return current !== undefined && JSON.stringify(current) === JSON.stringify(thought)
  })

  const deletions: Promise<unknown>[] = []
  if (unchangedTasks.length > 0) {
    deletions.push(guestTasksCollection.delete(unchangedTasks.map((task) => task.id)).isPersisted.promise)
  }
  if (unchangedThoughts.length > 0) {
    deletions.push(guestParkingLotCollection.delete(unchangedThoughts.map((thought) => thought.id)).isPersisted.promise)
  }
  await Promise.all(deletions)
}
