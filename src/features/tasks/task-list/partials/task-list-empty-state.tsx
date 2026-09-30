import React from "react"
import { FilterTab } from "../types"

interface TaskListEmptyStateProps {
  selectedCategory: string
  filterTab: FilterTab
}

// No icon badge and no dashed frame. The state is the words.
export const TaskListEmptyState: React.FC<TaskListEmptyStateProps> = ({
  selectedCategory,
  filterTab,
}) => {
  return (
    <div className="py-12 text-center">
      <p className="text-base text-neutral-200">
        {selectedCategory !== "all"
          ? `Nothing filed under "${selectedCategory}"`
          : "Nothing in this view"}
      </p>
      <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
        {filterTab === "completed"
          ? "Steps you finish land here, so you can see what you got through."
          : "Add a step, or widen the filters above."}
      </p>
    </div>
  )
}
