import React from "react"
import { MicroTask } from "../../../../types"

interface FocusTaskSparkProps {
  task: MicroTask
}

export const FocusTaskSpark: React.FC<FocusTaskSparkProps> = ({ task }) => {
  return (
    <>
      <h2 className="text-2xl text-neutral-100 max-w-lg mb-4">{task.title}</h2>

      <p className="w-full max-w-md mb-6 text-left text-base text-neutral-200">
        <span className="text-neutral-500">First step: </span>
        {task.firstPhysicalStep}
      </p>
    </>
  )
}
