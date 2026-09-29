import React from "react"
import { Sparkles } from "lucide-react"
import { FilterTab } from "../types"

interface TaskListEmptyStateProps {
  selectedCategory: string
  filterTab: FilterTab
}

export const TaskListEmptyState: React.FC<TaskListEmptyStateProps> = ({
  selectedCategory,
  filterTab,
}) => {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/30">
      <div className="w-10 h-10 mx-auto rounded-full bg-neutral-800/80 text-neutral-400 flex items-center justify-center mb-3">
        <Sparkles className="w-5 h-5 text-amber-400/80" />
      </div>
      <h3 className="text-sm font-semibold text-neutral-200">
        {selectedCategory !== "all"
          ? `No tasks under "${selectedCategory}"`
          : "No tasks in this view"}
      </h3>
      <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
        {filterTab === "completed"
          ? "Complete tasks to celebrate your daily dopamine momentum here!"
          : "Add a new task or choose another filter."}
      </p>
    </div>
  )
}
