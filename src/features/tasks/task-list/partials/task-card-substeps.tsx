import React from "react"
import { Check } from "lucide-react"
import { MicroTask } from "../../../../types"

interface TaskCardSubstepsProps {
  substeps: MicroTask["substeps"]
  onSubstepCheck: (subId: string, currentCompleted: boolean) => void
}

export const TaskCardSubsteps: React.FC<TaskCardSubstepsProps> = ({ substeps, onSubstepCheck }) => {
  return (
    <div className="mt-3 space-y-1">
      <p className="text-sm text-neutral-500">Steps</p>
      {substeps.map((sub) => (
        <label
          key={sub.id}
          className="flex items-start gap-2.5 min-h-11 py-1 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={sub.completed}
            onChange={() => onSubstepCheck(sub.id, sub.completed)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 ${
              sub.completed
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                : "border-neutral-700 text-transparent"
            }`}
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </span>
          <span
            className={`text-base ${
              sub.completed ? "text-neutral-500 line-through" : "text-neutral-300"
            }`}
          >
            {sub.text}
          </span>
        </label>
      ))}
    </div>
  )
}
