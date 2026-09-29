import React from "react"
import { Sparkles, Wand2 } from "lucide-react"

interface BrainDumpFooterProps {
  wordCount: number
  isRecording: boolean
  isLoading: boolean
  canSubmit: boolean
}

export const BrainDumpFooter: React.FC<BrainDumpFooterProps> = ({
  wordCount,
  isRecording,
  isLoading,
  canSubmit,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3.5">
      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <span>{wordCount} words</span>
        <span aria-hidden="true">·</span>
        <span>
          {isRecording ? (
            <span className="text-rose-400 font-medium">Recording audio input...</span>
          ) : (
            "Micro-step & category decomposition engine ready"
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-lg bg-amber-400 text-neutral-950 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-amber-500/10 active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Wand2 className="w-3.5 h-3.5 animate-spin" />
              <span>Categorizing & Slicing into Micro-Tasks...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Untangle & Create Micro-Tasks</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
