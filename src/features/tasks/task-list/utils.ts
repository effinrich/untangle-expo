import { EnergyLevel, MicroTask, PriorityLevel } from "../../types"
import { DEFAULT_CATEGORIES } from "../../data/categories"
import { SORT_OPTIONS, energyValues, priorityValues } from "./consts"
import { FilterTab, NewTaskInput, SortOption } from "./types"

// Available categories from tasks plus defaults
export function getAllCategoryNames(tasks: MicroTask[]): string[] {
  const set = new Set<string>()
  DEFAULT_CATEGORIES.forEach((c) => set.add(c.name))
  tasks.forEach((t) => {
    if (t.category) set.add(t.category)
  })
  return Array.from(set)
}

// Active tasks per category
export function getCategoryCounts(tasks: MicroTask[]): Record<string, number> {
  const counts: Record<string, number> = {}
  tasks.forEach((t) => {
    if (!t.completed) {
      counts[t.category] = (counts[t.category] || 0) + 1
    }
  })
  return counts
}

export function filterTasks(
  tasks: MicroTask[],
  filters: {
    filterTab: FilterTab
    searchQuery: string
    selectedCategory: string
    selectedPriority: string
  },
): MicroTask[] {
  const { filterTab, searchQuery, selectedCategory, selectedPriority } = filters
  return tasks.filter((t) => {
    // Tab filter
    if (filterTab === "quick-wins") {
      if (t.estimatedMinutes > 5 || t.completed) return false
    } else if (filterTab === "low-energy") {
      if (t.energyLevel !== "low" || t.completed) return false
    } else if (filterTab === "high-focus") {
      if (t.energyLevel !== "high" || t.completed) return false
    } else if (filterTab === "completed") {
      if (!t.completed) return false
    }

    // Priority filter
    if (selectedPriority !== "all") {
      const taskPri = t.priority || "medium"
      if (taskPri !== selectedPriority) return false
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = t.title.toLowerCase().includes(q)
      const matchFirstStep = t.firstPhysicalStep.toLowerCase().includes(q)
      const matchCat = t.category.toLowerCase().includes(q)
      if (!matchTitle && !matchFirstStep && !matchCat) return false
    }

    // Category filter
    if (selectedCategory !== "all") {
      if (t.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false
      }
    }

    return true
  })
}

// Sort by selected mental state / energy order
export function sortTasks(
  filteredTasks: MicroTask[],
  sortBy: SortOption,
  filterTab: FilterTab,
): MicroTask[] {
  const result = [...filteredTasks]
  result.sort((a, b) => {
    // Keep incomplete tasks ahead of completed items (unless in 'completed' tab)
    if (filterTab !== "completed" && a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }

    if (sortBy === "energy-asc") {
      const aVal = energyValues[a.energyLevel] || 2
      const bVal = energyValues[b.energyLevel] || 2
      if (aVal !== bVal) return aVal - bVal
      return (a.estimatedMinutes || 10) - (b.estimatedMinutes || 10)
    }

    if (sortBy === "energy-desc") {
      const aVal = energyValues[a.energyLevel] || 2
      const bVal = energyValues[b.energyLevel] || 2
      if (bVal !== aVal) return bVal - aVal
      return (b.estimatedMinutes || 10) - (a.estimatedMinutes || 10)
    }

    if (sortBy === "time-asc") {
      return (a.estimatedMinutes || 10) - (b.estimatedMinutes || 10)
    }

    if (sortBy === "priority-desc") {
      const aPri = priorityValues[a.priority || "medium"]
      const bPri = priorityValues[b.priority || "medium"]
      if (bPri !== aPri) return bPri - aPri
      return (energyValues[a.energyLevel] || 2) - (energyValues[b.energyLevel] || 2)
    }

    // 'newest' default
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  return result
}

export function buildQuickAddTask(fields: {
  title: string
  firstStep: string
  minutes: number
  energy: EnergyLevel
  category: string
  priority: PriorityLevel
}): NewTaskInput {
  return {
    title: fields.title.trim(),
    firstPhysicalStep:
      fields.firstStep.trim() || `Open the relevant app or physical tool for ${fields.title.trim()}`,
    estimatedMinutes: Number(fields.minutes) || 5,
    energyLevel: fields.energy,
    category: fields.category.trim() || "Personal",
    priority: fields.priority,
    whyItMatters: "Quick momentum to free up mental space",
    substeps: [
      { id: `sub_${Date.now()}_0`, text: "2-minute timer start", completed: false },
      { id: `sub_${Date.now()}_1`, text: "Execute the action", completed: false },
    ],
  }
}

export function buildMarkdownPlan(params: {
  tasks: MicroTask[]
  sortedTasks: MicroTask[]
  sortBy: SortOption
  activeCount: number
  completedCount: number
}): string {
  const { tasks, sortedTasks, sortBy, activeCount, completedCount } = params
  const lines = [
    `# ADHD Action Plan (${new Date().toLocaleDateString()})`,
    "",
    `## Incomplete Tasks (${activeCount}) - Sorted by ${SORT_OPTIONS.find((s) => s.id === sortBy)?.label}`,
    ...sortedTasks
      .filter((t) => !t.completed)
      .map(
        (t) =>
          `- [ ] **${t.title}** [${t.category}] (${t.estimatedMinutes}m · ${t.energyLevel} energy · ${t.priority || "med"} priority)\n  - *First step:* ${t.firstPhysicalStep}`,
      ),
    "",
    `## Completed (${completedCount})`,
    ...tasks.filter((t) => t.completed).map((t) => `- [x] ${t.title} [${t.category}]`),
  ]
  return lines.join("\n")
}
