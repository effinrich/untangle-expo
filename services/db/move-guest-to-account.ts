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
  while (isSessionActive()) {
    await importLegacyGuestData()
    if (!isSessionActive()) return
    await Promise.all([guestTasksCollection.preload(), guestParkingLotCollection.preload()])
    const tasks = guestTasksCollection.toArray.map((task) => ({
      ...task,
      substeps: task.substeps?.map((step) => ({ ...step })),
    }))
    const thoughts = guestParkingLotCollection.toArray.map((thought) => ({ ...thought }))

    await migrateGuestData(db, userId, { tasks, thoughts })
    if (!isSessionActive()) return

    const deletions: Promise<unknown>[] = []
    const unchangedTasks = tasks.filter(
      (task) => JSON.stringify(guestTasksCollection.get(task.id)) === JSON.stringify(task),
    )
    const unchangedThoughts = thoughts.filter(
      (thought) =>
        JSON.stringify(guestParkingLotCollection.get(thought.id)) === JSON.stringify(thought),
    )
    if (unchangedTasks.length > 0) {
      deletions.push(
        guestTasksCollection.delete(unchangedTasks.map((task) => task.id)).isPersisted.promise,
      )
    }
    if (unchangedThoughts.length > 0) {
      deletions.push(
        guestParkingLotCollection.delete(unchangedThoughts.map((thought) => thought.id)).isPersisted
          .promise,
      )
    }
    await Promise.all(deletions)

    const taskSnapshots = new Map(tasks.map((task) => [task.id, JSON.stringify(task)]))
    const thoughtSnapshots = new Map(
      thoughts.map((thought) => [thought.id, JSON.stringify(thought)]),
    )
    const changed =
      guestTasksCollection.toArray.some(
        (task) => taskSnapshots.get(task.id) !== JSON.stringify(task),
      ) ||
      guestParkingLotCollection.toArray.some(
        (thought) => thoughtSnapshots.get(thought.id) !== JSON.stringify(thought),
      )
    if (!changed) return
  }
}
