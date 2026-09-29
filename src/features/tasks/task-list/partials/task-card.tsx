import React from "react"
import { Check } from "lucide-react"
import { useTaskCardActions } from "../hooks"
import { TaskCardProps } from "../types"
import { TaskCardActions } from "./task-card-actions"
import { TaskCardFirstStep } from "./task-card-first-step"
import { TaskCardMeta } from "./task-card-meta"
import { TaskCardSubsteps } from "./task-card-substeps"

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
    <div
      className={`group border rounded-xl transition-all duration-200 ${
        task.completed
          ? "bg-neutral-900/30 border-neutral-900/80 opacity-60"
          : "bg-neutral-900/70 border-neutral-800 hover:border-neutral-700/80 shadow-sm"
      }`}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3.5">
          {/* Main task complete toggle */}
          <button
            type="button"
            onClick={handleComplete}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              task.completed
                ? "bg-emerald-500 border-emerald-400 text-neutral-950"
                : "border-neutral-700 hover:border-amber-400 bg-neutral-950 text-transparent"
            }`}
            title={task.completed ? "Mark uncompleted" : "Mark completed"}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          <div className="flex-1 min-w-0">
            {/* Title & Category/Priority row */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 mb-1.5">
              <h3
                className={`text-sm md:text-base font-semibold leading-snug break-words ${
                  task.completed ? "line-through text-neutral-500" : "text-neutral-100"
                }`}
              >
                {task.title}
              </h3>

              {/* Zero-Pill Text Metadata & Category Pill */}
              <TaskCardMeta
                task={task}
                isCategoryMenuOpen={isCategoryMenuOpen}
                onToggleCategoryMenu={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                onSelectCategory={handleSelectCategory}
                onTogglePriority={handleTogglePriority}
              />
            </div>

            {/* First Physical Step: The ADHD Spark Banner */}
            {!task.completed && <TaskCardFirstStep firstPhysicalStep={task.firstPhysicalStep} />}

            {/* Why It Matters Rationale */}
            {task.whyItMatters && !task.completed && (
              <p className="text-xs text-neutral-500 mt-1 italic">{task.whyItMatters}</p>
            )}

            {/* Action Bar */}
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

            {/* Expandable Substep Checklist */}
            {isExpanded && totalSubsteps > 0 && (
              <TaskCardSubsteps substeps={task.substeps} onSubstepCheck={handleSubstepCheck} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
