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

const CONTROL =
  "min-h-11 px-4 rounded-md border border-neutral-800 text-sm text-neutral-300 hover:text-neutral-100 hover:border-neutral-700 transition-colors flex items-center gap-2"

export const FocusTimer: React.FC<FocusTimerProps> = ({
  secondsRemaining,
  isRunning,
  onToggleRunning,
  onAddMinutes,
  onReset,
}) => {
  return (
    <>
      {/* Display type: the one place a very large size is earned, because you
          read this from across the room. */}
      <div className="my-2">
        <div className="text-6xl md:text-7xl font-semibold tabular-nums tracking-tight text-neutral-100">
          {formatTimer(secondsRemaining)}
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {secondsRemaining === 0 ? "Time is up." : "One thing at a time"}
        </p>
      </div>

      <div className="flex items-center gap-2 my-5">
        <button type="button" onClick={onToggleRunning} className={CONTROL}>
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" aria-hidden="true" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" aria-hidden="true" />
              <span>Resume</span>
            </>
          )}
        </button>

        <button type="button" onClick={() => onAddMinutes(5)} className={CONTROL}>
          <span>Five more minutes</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label="Reset timer"
          title="Reset timer"
          className="w-11 h-11 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </>
  )
}
