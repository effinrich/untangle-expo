import React from "react"
import { MicroTask } from "../../../../types"
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
  const dot = (
    <span aria-hidden="true" className="text-neutral-700">
      {" · "}
    </span>
  )

  return (
    <div className="flex flex-wrap items-center gap-x-2 text-sm text-neutral-500">
      <TaskCardCategoryMenu
        task={task}
        isOpen={isCategoryMenuOpen}
        onToggle={onToggleCategoryMenu}
        onSelectCategory={onSelectCategory}
      />

      {!task.completed && (
        <>
          {dot}
          <button
            type="button"
            onClick={onTogglePriority}
            className={`hover:underline transition-colors ${priorityStyles[currentPriority].text}`}
          >
            {priorityStyles[currentPriority].label}
          </button>
        </>
      )}

      {dot}
      <span className="tabular-nums">{task.estimatedMinutes} min</span>

      {dot}
      <span className={`capitalize ${energyColors[task.energyLevel]}`}>
        {task.energyLevel} energy
      </span>
    </div>
  )
}
