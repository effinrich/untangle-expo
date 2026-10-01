import React from "react"
import { ChevronDown, ChevronUp, Play, Scissors, Trash2 } from "lucide-react"
import { MicroTask } from "../../../../types"

interface TaskCardActionsProps {
  task: MicroTask
  isBreakingDown: boolean
  breakdownError?: string | null
  isExpanded: boolean
  completedSubstepsCount: number
  totalSubsteps: number
  onStartFocus: (task: MicroTask) => void
  onBreakdown: () => void
  onToggleExpanded: () => void
  onDelete: (id: string) => void
}

const ACTION =
  "min-h-9 px-2 -ml-2 rounded-md text-sm text-neutral-400 hover:text-neutral-100 transition-colors flex items-center gap-2"

export const TaskCardActions: React.FC<TaskCardActionsProps> = ({
  task,
  isBreakingDown,
  breakdownError,
  isExpanded,
  completedSubstepsCount,
  totalSubsteps,
  onStartFocus,
  onBreakdown,
  onToggleExpanded,
  onDelete,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
      {!task.completed && (
        <button type="button" onClick={() => onStartFocus(task)} className={ACTION}>
          <Play className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Focus on this</span>
        </button>
      )}

      {!task.completed && (
        <button
          type="button"
          onClick={onBreakdown}
          disabled={isBreakingDown}
          className={`${ACTION} disabled:text-neutral-600`}
        >
          <Scissors className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isBreakingDown ? "Breaking down" : "Break down"}</span>
        </button>
      )}

      {totalSubsteps > 0 && (
        <button type="button" onClick={onToggleExpanded} className={ACTION}>
          <span>
            {completedSubstepsCount}/{totalSubsteps} steps
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      )}

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label={`Remove "${task.title}"`}
        className="ml-auto shrink-0 w-11 h-11 -my-2 -mr-2 flex items-center justify-center rounded-md text-neutral-600 hover:text-rose-400 transition-colors"
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>

      {breakdownError && (
        <p role="alert" className="w-full text-sm text-rose-300">
          {breakdownError}
        </p>
      )}
    </div>
  )
}
