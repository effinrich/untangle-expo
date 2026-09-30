import React from "react"

interface TaskCardFirstStepProps {
  firstPhysicalStep: string
}

// The first step is the product's whole idea, so it gets emphasis. It gets it
// from brightness and a hanging indent, not from a nested panel or a hue.
export const TaskCardFirstStep: React.FC<TaskCardFirstStepProps> = ({ firstPhysicalStep }) => {
  return (
    <p className="mt-2 text-base text-neutral-200">
      <span className="text-neutral-500">First step: </span>
      {firstPhysicalStep}
    </p>
  )
}
