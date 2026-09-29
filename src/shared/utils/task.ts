import { MicroTask } from "../../types"
import { NewTaskInput } from "../types/task"

export function toggleTaskCompleted(task: MicroTask): MicroTask {
  return {
    ...task,
    completed: !task.completed,
    completedAt: !task.completed ? new Date().toISOString() : undefined,
  }
}

export function toggleTaskSubstep(task: MicroTask, substepId: string): MicroTask {
  const updatedSubsteps = task.substeps.map((sub) =>
    sub.id === substepId ? { ...sub, completed: !sub.completed } : sub,
  )
  const allCompleted = updatedSubsteps.every((s) => s.completed)
  return {
    ...task,
    substeps: updatedSubsteps,
    completed: allCompleted ? true : task.completed,
  }
}

export function createTask(input: NewTaskInput, userId: string | undefined): MicroTask {
  return {
    ...input,
    id: `task_${Date.now()}`,
    userId,
    createdAt: new Date().toISOString(),
    completed: false,
  }
}
