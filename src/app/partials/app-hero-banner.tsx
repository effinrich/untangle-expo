import React from "react"
import { Sparkles } from "lucide-react"
import { MicroTask } from "../../types"
import calmAmbientImg from "../../assets/images/calm-focus-ambient-1790313003505.jpg"
import { countActive, countActiveInCategory } from "../utils"

interface AppHeroBannerProps {
  tasks: MicroTask[]
  isSynced: boolean
}

// Subtle ambient focus header banner with quick stats
export const AppHeroBanner: React.FC<AppHeroBannerProps> = ({ tasks, isSynced }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-neutral-800/80 bg-neutral-900/50 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img
          src={calmAmbientImg}
          alt="Calm ambient focus art"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            ;(e.target as HTMLElement).style.display = "none"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-xl">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Priority Area Categorization & ADHD Flow</span>
          {isSynced && (
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Firestore Synced
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-100 text-balance">
          Organize chaotic thoughts across Work, Personal & Health.
        </h1>
        <p className="text-xs md:text-sm text-neutral-400 mt-2 leading-relaxed">
          Input via voice with Gemini 3.5 Transcribe or type freely. Filter by priority areas, and
          slice intimidating goals into immediate physical first steps with brown noise.
        </p>
      </div>

      {/* Quick Stats Pill Replacement */}
      <div className="relative z-10 flex items-center gap-3 text-xs text-neutral-400 self-stretch md:self-auto bg-neutral-950/80 border border-neutral-800/80 p-3 rounded-xl font-mono tabular-nums">
        <div className="text-center px-2">
          <span className="block text-lg font-bold text-neutral-100">{countActive(tasks)}</span>
          <span className="text-[10px] text-neutral-500 font-sans">Active Tasks</span>
        </div>
        <span aria-hidden="true" className="text-neutral-700">
          |
        </span>
        <div className="text-center px-2">
          <span className="block text-lg font-bold text-amber-400">
            {countActiveInCategory(tasks, "work")}
          </span>
          <span className="text-[10px] text-neutral-500 font-sans">Work</span>
        </div>
        <span aria-hidden="true" className="text-neutral-700">
          |
        </span>
        <div className="text-center px-2">
          <span className="block text-lg font-bold text-emerald-400">
            {countActiveInCategory(tasks, "health")}
          </span>
          <span className="text-[10px] text-neutral-500 font-sans">Health</span>
        </div>
      </div>
    </div>
  )
}
