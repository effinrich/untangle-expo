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
): Promise<boolean> {
  await importLegacyGuestData()
  await Promise.all([guestTasksCollection.preload(), guestParkingLotCollection.preload()])
  if (!isSessionActive()) return false
  const tasks = guestTasksCollection.toArray
  const thoughts = guestParkingLotCollection.toArray

  await migrateGuestData(db, userId, { tasks, thoughts })
  if (!isSessionActive()) return false
  const deletions: Promise<unknown>[] = []
  if (tasks.length > 0) {
    deletions.push(guestTasksCollection.delete(tasks.map((task) => task.id)).isPersisted.promise)
  }
  if (thoughts.length > 0) {
    deletions.push(
      guestParkingLotCollection.delete(thoughts.map((thought) => thought.id)).isPersisted.promise,
    )
  }
  await Promise.all(deletions)
  return isSessionActive()
}
