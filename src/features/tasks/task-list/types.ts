import { MicroTask } from "../../../types"
import { NewTaskInput } from "../../../shared/types/task"

export interface TaskListProps {
  tasks: MicroTask[]
  onToggleComplete: (id: string) => void
  onToggleSubstep: (taskId: string, substepId: string) => void
  onDelete: (id: string) => void
  onStartFocus: (task: MicroTask) => void
  onUpdateTask: (task: MicroTask) => void
  onAddTask: (task: NewTaskInput) => void
  onClearCompleted: () => void
  onOpenUnstick: () => void
}

export type FilterTab = "all" | "quick-wins" | "low-energy" | "high-focus" | "completed"

export type SortOption =
  | "energy-asc" // Low → High Energy (Gentle low friction)
  | "energy-desc" // High → Low Energy (Hyperfocus surge)
  | "time-asc" // Shortest First (Quick dopamine)
  | "priority-desc" // Highest Priority
  | "newest" // Recently Added

export interface TaskCardProps {
  task: MicroTask
  onToggleComplete: (id: string) => void
  onToggleSubstep: (taskId: string, substepId: string) => void
  onDelete: (id: string) => void
  onStartFocus: (task: MicroTask) => void
  onUpdateTask: (task: MicroTask) => void
}

export interface SortOptionConfig {
  id: SortOption
  label: string
  description: string
  mentalState: string
}
