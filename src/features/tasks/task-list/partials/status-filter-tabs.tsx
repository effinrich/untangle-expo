import React from "react"
import { Zap } from "lucide-react"
import { FilterTab } from "../types"

interface StatusFilterTabsProps {
  filterTab: FilterTab
  activeCount: number
  completedCount: number
  onChange: (tab: FilterTab) => void
}

export const StatusFilterTabs: React.FC<StatusFilterTabsProps> = ({
  filterTab,
  activeCount,
  completedCount,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-11 ${
          filterTab === "all"
            ? "bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        Active ({activeCount})
      </button>
      <button
        type="button"
        onClick={() => onChange("quick-wins")}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 min-h-11 ${
          filterTab === "quick-wins"
            ? "bg-amber-400/15 text-amber-300 shadow-sm border border-amber-400/30"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
        title="Tasks 5 minutes or less"
      >
        <Zap className="w-3 h-3 text-amber-400" />
        <span>≤5m Wins</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("low-energy")}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-11 ${
          filterTab === "low-energy"
            ? "bg-emerald-400/15 text-emerald-300 shadow-sm border border-emerald-400/30"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        Low Energy 🔋
      </button>
      <button
        type="button"
        onClick={() => onChange("high-focus")}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-11 ${
          filterTab === "high-focus"
            ? "bg-rose-400/15 text-rose-300 shadow-sm border border-rose-400/30"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        Deep Focus 🚀
      </button>
      <button
        type="button"
        onClick={() => onChange("completed")}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-11 ${
          filterTab === "completed"
            ? "bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        Done ({completedCount})
      </button>
    </div>
  )
}
