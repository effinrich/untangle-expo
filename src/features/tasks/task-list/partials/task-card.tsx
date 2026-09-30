import React from "react"
import { Check } from "lucide-react"
import { useTaskCardActions } from "../hooks"
import { TaskCardProps } from "../types"
import { TaskCardActions } from "./task-card-actions"
import { TaskCardFirstStep } from "./task-card-first-step"
import { TaskCardMeta } from "./task-card-meta"
import { TaskCardSubsteps } from "./task-card-substeps"

// A row, not a card. The list is the instrument, and a row of inline content
// reads faster than a stack of nested boxes. Amber is deliberately absent here:
// it belongs to one primary action per screen, not to every row.
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onToggleSubstep,
  onDelete,
  onStartFocus,
  onUpdateTask,
}) => {
  const {
    isExpanded,
    setIsExpanded,
    isBreakingDown,
    isCategoryMenuOpen,
    setIsCategoryMenuOpen,
    handleComplete,
    handleSubstepCheck,
    handleBreakdownFurther,
    handleSelectCategory,
    handleTogglePriority,
  } = useTaskCardActions({ task, onToggleComplete, onToggleSubstep, onUpdateTask })

  const completedSubstepsCount = task.substeps.filter((s) => s.completed).length
  const totalSubsteps = task.substeps.length

  return (
    <li className="group flex items-start gap-3 py-4">
      {/* 44px hit area around a 24px box, pulled back so it still aligns. */}
      <button
        type="button"
        onClick={handleComplete}
        aria-label={task.completed ? `Mark "${task.title}" not done` : `Mark "${task.title}" done`}
        className="shrink-0 -ml-2 -mt-1 w-11 h-11 flex items-center justify-center rounded-md"
      >
        <span
          aria-hidden="true"
          className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
            task.completed
              ? "bg-emerald-500 border-emerald-500 text-neutral-950"
              : "border-neutral-700 group-hover:border-neutral-500 text-transparent"
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </span>
      </button>

      <div className="flex-1 min-w-0">
        <h3
          className={`text-lg leading-snug break-words ${
            task.completed ? "line-through text-neutral-500" : "text-neutral-100"
          }`}
        >
          {task.title}
        </h3>

        <div className="mt-1">
          <TaskCardMeta
            task={task}
            isCategoryMenuOpen={isCategoryMenuOpen}
            onToggleCategoryMenu={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            onSelectCategory={handleSelectCategory}
            onTogglePriority={handleTogglePriority}
          />
        </div>

        {!task.completed && <TaskCardFirstStep firstPhysicalStep={task.firstPhysicalStep} />}

        {task.whyItMatters && !task.completed && (
          <p className="mt-1 text-sm text-neutral-500">{task.whyItMatters}</p>
        )}

        <TaskCardActions
          task={task}
          isBreakingDown={isBreakingDown}
          isExpanded={isExpanded}
          completedSubstepsCount={completedSubstepsCount}
          totalSubsteps={totalSubsteps}
          onStartFocus={onStartFocus}
          onBreakdown={handleBreakdownFurther}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
          onDelete={onDelete}
        />

        {isExpanded && totalSubsteps > 0 && (
          <TaskCardSubsteps substeps={task.substeps} onSubstepCheck={handleSubstepCheck} />
        )}
      </div>
    </li>
  )
}
