import React from "react"
import { Check } from "lucide-react"
import { MicroTask } from "../../../../types"

interface TaskCardSubstepsProps {
  substeps: MicroTask["substeps"]
  onSubstepCheck: (subId: string, currentCompleted: boolean) => void
}

export const TaskCardSubsteps: React.FC<TaskCardSubstepsProps> = ({ substeps, onSubstepCheck }) => {
  return (
    <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2">
      <div className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
        Micro-Steps (Check off as you move)
      </div>
      {substeps.map((sub) => (
        <label
          key={sub.id}
          className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
            sub.completed
              ? "bg-neutral-950/40 text-neutral-500 line-through"
              : "bg-neutral-950/80 text-neutral-300 hover:bg-neutral-950"
          }`}
        >
          <input
            type="checkbox"
            checked={sub.completed}
            onChange={() => onSubstepCheck(sub.id, sub.completed)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 ${
              sub.completed
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                : "border-neutral-700 bg-neutral-900 text-transparent"
            }`}
          >
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
          <span className="text-xs select-none">{sub.text}</span>
        </label>
      ))}
    </div>
  )
}
