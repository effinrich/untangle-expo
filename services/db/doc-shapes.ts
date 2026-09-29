import type { DocumentData } from "firebase/firestore"
import type { MicroTask } from "../api"
import type { ParkedThought } from "./types"

const ENERGY_LEVELS = ["low", "medium", "high"] as const
const PRIORITIES = ["high", "medium", "low"] as const

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

// Mirrors isValidMicroTask in firestore.rules; completedAt is omitted rather than null.
export function toTaskDoc(task: MicroTask, userId: string): DocumentData {
  return {
    id: task.id,
    userId,
    title: task.title.slice(0, 300),
    firstPhysicalStep: task.firstPhysicalStep.slice(0, 500),
    estimatedMinutes: Math.min(Math.max(Number(task.estimatedMinutes) || 5, 0), 1440),
    energyLevel: pick(task.energyLevel, ENERGY_LEVELS, "medium"),
    category: (task.category || "Personal").slice(0, 50),
    priority: pick(task.priority, PRIORITIES, "medium"),
    whyItMatters: (task.whyItMatters || "").slice(0, 500),
    substeps: (task.substeps || []).slice(0, 50).map(({ id, text, completed }) => ({
      id,
      text,
      completed,
    })),
    completed: Boolean(task.completed),
    ...(task.completed && task.completedAt ? { completedAt: task.completedAt } : {}),
    createdAt: task.createdAt,
  }
}

export function fromTaskDoc(data: DocumentData): MicroTask {
  const { completedAt, ...rest } = data as MicroTask & { completedAt?: string | null }
  return completedAt ? { ...rest, completedAt } : rest
}

export function toParkingDoc(thought: ParkedThought, userId: string): DocumentData {
  return {
    id: thought.id,
    userId,
    text: thought.text.slice(0, 500),
    createdAt: thought.createdAt,
  }
}

export function fromParkingDoc(data: DocumentData): ParkedThought {
  const { id, userId, text, createdAt } = data as ParkedThought
  return { id, userId, text, createdAt }
}
