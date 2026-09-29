import React from "react"
import { Pause, Play, RotateCcw } from "lucide-react"
import { formatTimer } from "../utils"

interface FocusTimerProps {
  secondsRemaining: number
  isRunning: boolean
  onToggleRunning: () => void
  onAddMinutes: (mins: number) => void
  onReset: () => void
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  secondsRemaining,
  isRunning,
  onToggleRunning,
  onAddMinutes,
  onReset,
}) => {
  return (
    <>
      {/* Large Timer Display */}
      <div className="my-2">
        <div className="text-6xl md:text-7xl font-mono tabular-nums font-extrabold tracking-tight text-neutral-100 selection:bg-transparent">
          {formatTimer(secondsRemaining)}
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          {secondsRemaining === 0
            ? "Time is up! Great focus push."
            : "Dedicated single-task sprint"}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-3 my-5">
        <button
          type="button"
          onClick={onToggleRunning}
          className="px-5 py-2.5 rounded-xl bg-amber-400 text-neutral-950 font-semibold text-sm hover:bg-amber-300 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 active:scale-95"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-neutral-950" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-neutral-950" />
              <span>Resume</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onAddMinutes(5)}
          className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
        >
          +5 Min
        </button>

        <button
          type="button"
          onClick={onReset}
          className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 border border-neutral-700 transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </>
  )
}
