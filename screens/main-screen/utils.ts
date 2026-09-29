import { MicroTask } from "../../services/api"
import { ALL_AREAS, ENERGY_ORDER, SORT_OPTIONS } from "./consts"
import { SortType } from "./types"

export function sortOpenTasks(tasks: MicroTask[], area: string, sortBy: SortType): MicroTask[] {
  const open = tasks.filter(
    (t) => !t.completed && (area === ALL_AREAS || t.category.toLowerCase() === area.toLowerCase()),
  )
  return open.sort((a, b) => {
    switch (sortBy) {
      case "energy-asc":
        return ENERGY_ORDER[a.energyLevel] - ENERGY_ORDER[b.energyLevel]
      case "energy-desc":
        return ENERGY_ORDER[b.energyLevel] - ENERGY_ORDER[a.energyLevel]
      case "time-asc":
        return a.estimatedMinutes - b.estimatedMinutes
      default: {
        const unhandled: never = sortBy
        return unhandled
      }
    }
  })
}

export function areasFor(tasks: MicroTask[]): string[] {
  return [ALL_AREAS, ...new Set(tasks.map((t) => t.category))]
}

export function viewSummary(sortBy: SortType, area: string): string {
  const sortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? ""
  return `${sortLabel} · ${area}`
}
