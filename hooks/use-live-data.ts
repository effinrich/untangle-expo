import { eq } from "@tanstack/db"
import { useLiveQuery } from "@tanstack/react-db"
import type { MicroTask } from "../services/api"
import type { ParkedThought } from "../services/db/types"
import { useAppState } from "./app-context"

/** All tasks, newest first. */
export function useTasks(): MicroTask[] {
  const { collections } = useAppState()
  return useLiveQuery({
    queryKey: ["tasks", collections.tasks.id],
    query: (q) =>
      q
        .from({ task: collections.tasks })
        .orderBy(({ task }) => task.createdAt, "desc")
        .orderBy(({ task }) => task.id),
  }).data
}

export function useOpenTasks(): MicroTask[] {
  const { collections } = useAppState()
  return useLiveQuery({
    queryKey: ["open-tasks", collections.tasks.id],
    query: (q) =>
      q
        .from({ task: collections.tasks })
        .where(({ task }) => eq(task.completed, false))
        .orderBy(({ task }) => task.createdAt, "desc")
        .orderBy(({ task }) => task.id),
  }).data
}

export function useTask(id: string | undefined): MicroTask | undefined {
  const { collections } = useAppState()
  return useLiveQuery({
    queryKey: ["task", collections.tasks.id, id],
    query: (q) =>
      q
        .from({ task: collections.tasks })
        .where(({ task }) => eq(task.id, id ?? ""))
        .findOne(),
  }).data
}

/** Parked thoughts, newest first. */
export function useParkedThoughts(): ParkedThought[] {
  const { collections } = useAppState()
  return useLiveQuery({
    queryKey: ["parking-lot", collections.parkingLot.id],
    query: (q) =>
      q
        .from({ thought: collections.parkingLot })
        .orderBy(({ thought }) => thought.createdAt, "desc"),
  }).data
}
