import React from "react"
import { ChevronDown, ChevronUp, Play, Scissors, Trash2 } from "lucide-react"
import { MicroTask } from "../../../types"

interface TaskCardActionsProps {
  task: MicroTask
  isBreakingDown: boolean
  isExpanded: boolean
  completedSubstepsCount: number
  totalSubsteps: number
  onStartFocus: (task: MicroTask) => void
  onBreakdown: () => void
  onToggleExpanded: () => void
  onDelete: (id: string) => void
}

export const TaskCardActions: React.FC<TaskCardActionsProps> = ({
  task,
  isBreakingDown,
  isExpanded,
  completedSubstepsCount,
  totalSubsteps,
  onStartFocus,
  onBreakdown,
  onToggleExpanded,
  onDelete,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-neutral-800/60">
      <div className="flex items-center gap-2">
        {!task.completed && (
          <button
            type="button"
            onClick={() => onStartFocus(task)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/20 transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-amber-300" />
            <span>Focus on this</span>
          </button>
        )}

        {!task.completed && (
          <button
            type="button"
            onClick={onBreakdown}
            disabled={isBreakingDown}
            className="px-2.5 py-1 text-xs font-medium rounded-md text-neutral-400 hover:text-neutral-200 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 transition-colors flex items-center gap-1.5"
            title="Feeling paralyzed? Split into smaller micro-steps"
          >
            <Scissors className="w-3 h-3" />
            <span>{isBreakingDown ? "Slicing..." : "Break down further"}</span>
          </button>
        )}

        {totalSubsteps > 0 && (
          <button
            type="button"
            onClick={onToggleExpanded}
            className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
          >
            <span>
              {completedSubstepsCount}/{totalSubsteps} micro-steps
            </span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-md text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Remove task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
