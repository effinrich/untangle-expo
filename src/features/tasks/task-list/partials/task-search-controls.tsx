import React from "react"
import { Plus, Search } from "lucide-react"

interface TaskSearchControlsProps {
  selectedPriority: string
  onPriorityChange: (priority: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onToggleAddForm: () => void
}

export const TaskSearchControls: React.FC<TaskSearchControlsProps> = ({
  selectedPriority,
  onPriorityChange,
  searchQuery,
  onSearchChange,
  onToggleAddForm,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Priority dropdown */}
      <select
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="bg-neutral-950/80 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-neutral-700 min-h-[36px]"
        title="Filter by priority tier"
      >
        <option value="all">All Priorities</option>
        <option value="high">High Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="low">Low Priority</option>
      </select>

      {/* Search Box */}
      <div className="relative flex-1 sm:w-44 lg:w-48">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-neutral-950/80 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400/60 min-h-[36px]"
        />
      </div>

      {/* Quick Add Button */}
      <button
        type="button"
        onClick={onToggleAddForm}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700/60 transition-colors flex items-center gap-1 shrink-0 min-h-[36px]"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Add Task</span>
      </button>
    </div>
  )
}
