import React from "react"
import { Clock } from "lucide-react"
import { MicroTask } from "../../../types"
import { energyColors, priorityStyles } from "../consts"
import { TaskCardCategoryMenu } from "./task-card-category-menu"

interface TaskCardMetaProps {
  task: MicroTask
  isCategoryMenuOpen: boolean
  onToggleCategoryMenu: () => void
  onSelectCategory: (categoryName: string) => void
  onTogglePriority: () => void
}

export const TaskCardMeta: React.FC<TaskCardMetaProps> = ({
  task,
  isCategoryMenuOpen,
  onToggleCategoryMenu,
  onSelectCategory,
  onTogglePriority,
}) => {
  const currentPriority = task.priority || "medium"

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 shrink-0 font-mono tabular-nums">
      {/* Category Badge with Dropdown Trigger */}
      <TaskCardCategoryMenu
        task={task}
        isOpen={isCategoryMenuOpen}
        onToggle={onToggleCategoryMenu}
        onSelectCategory={onSelectCategory}
      />

      <span aria-hidden="true" className="text-neutral-700">
        ·
      </span>

      {/* Priority Toggle */}
      {!task.completed && (
        <button
          type="button"
          onClick={onTogglePriority}
          className={`text-[11px] font-sans font-medium hover:underline ${priorityStyles[currentPriority].text}`}
          title="Click to toggle priority (high / medium / low)"
        >
          {priorityStyles[currentPriority].label}
        </button>
      )}

      <span aria-hidden="true" className="text-neutral-700">
        ·
      </span>

      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-neutral-500" />
        <span>{task.estimatedMinutes}m</span>
      </span>

      <span aria-hidden="true" className="text-neutral-700">
        ·
      </span>
      <span className={`capitalize ${energyColors[task.energyLevel]}`}>
        {task.energyLevel} energy
      </span>
    </div>
  )
}
