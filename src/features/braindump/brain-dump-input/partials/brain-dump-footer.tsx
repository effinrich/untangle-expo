import React from "react"
import { Loader2 } from "lucide-react"

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
      <p className="text-sm text-neutral-500">
        {isRecording ? (
          <span className="text-rose-400">Recording</span>
        ) : (
          <>
            <span className="tabular-nums">{wordCount}</span> words
          </>
        )}
      </p>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full sm:w-auto min-h-11 px-5 rounded-md bg-amber-400 text-neutral-950 font-semibold text-base hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        <span>Untangle</span>
      </button>
    </div>
  )
}
