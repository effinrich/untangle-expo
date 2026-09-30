import React from "react"
import { MicroTask } from "../../../../types"

interface FocusTaskSparkProps {
  task: MicroTask
}

// Task title plus the first physical step: the spark
export const FocusTaskSpark: React.FC<FocusTaskSparkProps> = ({ task }) => {
  return (
    <>
      <h2 className="text-xl md:text-2xl font-bold text-neutral-100 max-w-lg mb-3 tracking-tight">
        {task.title}
      </h2>

      <div className="w-full max-w-md bg-neutral-950/80 border border-amber-400/30 rounded-xl p-3.5 mb-6 text-left">
        <span className="text-xs font-semibold text-amber-400 block">
          Your First Physical Action Right Now:
        </span>
        <p className="text-sm text-neutral-200 mt-1 font-medium leading-relaxed">
          {task.firstPhysicalStep}
        </p>
      </div>
    </>
  )
}
