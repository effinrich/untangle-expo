import type { MicroTask } from "../api"
import { INITIAL_SEED_TASKS } from "../../src/data/seed-data"

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
