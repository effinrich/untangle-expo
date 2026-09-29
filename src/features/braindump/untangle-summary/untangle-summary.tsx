import React from "react"
import { Sparkles } from "lucide-react"

interface UntangleSummaryProps {
  summary: string
  onDismiss: () => void
}

// AI validation summary shown right after an untangle
export const UntangleSummary: React.FC<UntangleSummaryProps> = ({ summary, onDismiss }) => {
  return (
    <div className="p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl text-xs text-amber-200 flex items-start gap-3">
      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <span className="font-semibold block text-amber-300">Untangled Rationale:</span>
        <p className="mt-0.5 leading-relaxed">{summary}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-amber-400/60 hover:text-amber-300 text-xs shrink-0"
      >
        Dismiss
      </button>
    </div>
  )
}
