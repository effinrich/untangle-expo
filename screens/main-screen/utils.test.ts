import { describe, expect, test } from "bun:test"
import type { MicroTask } from "../../services/api"
import { INITIAL_SEED_TASKS } from "../../src/data/seed-data"
import { arrivalGreetingFor } from "./utils"

const seeds = INITIAL_SEED_TASKS

// Content no longer matching any seed fingerprint, i.e. something the user wrote or touched.
const ownTask = (title: string): MicroTask => ({ ...seeds[0], id: `own-${title}`, title })

const startedSeed = (): MicroTask[] =>
  seeds.map((task, index) =>
    index === 0
      ? {
          ...task,
          substeps: task.substeps.map((step, i) =>
            i === 0 ? { ...step, completed: true } : step,
          ),
        }
      : task,
  )

describe("arrivalGreetingFor", () => {
  test("arriving to an empty list greets with nothing", () => {
    expect(arrivalGreetingFor([])).toBeNull()
  })

  test("arriving to samples that are all completed greets with nothing", () => {
    const completed = seeds.map((task) => ({ ...task, completed: true }))
    expect(arrivalGreetingFor(completed)).toBeNull()
  })

  test("arriving to untouched samples explains them", () => {
    expect(arrivalGreetingFor(seeds)).toBe("samples")
  })

  test("one checked substep of one sample greets as returning", () => {
    expect(arrivalGreetingFor(startedSeed())).toBe("returning")
  })

  test("samples beside the user's own tasks greet as returning", () => {
    expect(arrivalGreetingFor([...seeds, ownTask("Call the dentist back")])).toBe("returning")
  })
})
