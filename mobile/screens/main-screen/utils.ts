import { MicroTask } from "../../services/api"
import { ENERGY_ORDER } from "./consts"
import { SortType } from "./types"

// Filter & Energy Sorting
export function filterAndSortTasks(
  tasks: MicroTask[],
  selectedCategory: string,
  sortBy: SortType,
): MicroTask[] {
  const list = tasks.filter((t) => {
    if (selectedCategory !== "All" && t.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false
    }
    return true
  })

  list.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1

    if (sortBy === "energy-asc") {
      return ENERGY_ORDER[a.energyLevel] - ENERGY_ORDER[b.energyLevel]
    }
    if (sortBy === "energy-desc") {
      return ENERGY_ORDER[b.energyLevel] - ENERGY_ORDER[a.energyLevel]
    }
    return a.estimatedMinutes - b.estimatedMinutes
  })

  return list
}
