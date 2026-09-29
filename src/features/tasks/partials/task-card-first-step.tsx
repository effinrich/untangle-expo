import React from "react"
import { Zap } from "lucide-react"

interface TaskCardFirstStepProps {
  firstPhysicalStep: string
}

export const TaskCardFirstStep: React.FC<TaskCardFirstStepProps> = ({ firstPhysicalStep }) => {
  return (
    <div className="mt-2.5 mb-2 p-2.5 bg-neutral-950/80 border border-neutral-800/80 rounded-lg flex items-start gap-2.5">
      <div className="w-4 h-4 mt-0.5 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
        <Zap className="w-2.5 h-2.5" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-medium text-amber-300 uppercase tracking-wider block">
          Immediate Physical First Step
        </span>
        <p className="text-xs text-neutral-300 mt-0.5 font-normal leading-relaxed">
          {firstPhysicalStep}
        </p>
      </div>
    </div>
  )
}
