import React from "react"
import { ArrowUpDown, SlidersHorizontal } from "lucide-react"
import { SORT_OPTIONS } from "../consts"
import { SortOption, SortOptionConfig } from "../types"

interface EnergySortStripProps {
  sortBy: SortOption
  activeSortOption: SortOptionConfig
  onSelectSort: (option: SortOption) => void
  onOpenSortModal: () => void
}

export const EnergySortStrip: React.FC<EnergySortStripProps> = ({
  sortBy,
  activeSortOption,
  onSelectSort,
  onOpenSortModal,
}) => {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 backdrop-blur-sm space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
          <span>Match Your Mental State (Energy Sorting)</span>
        </div>

        {/* Trigger full bottom sheet/modal */}
        <button
          type="button"
          onClick={onOpenSortModal}
          className="text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-amber-400/10"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>All Sort Options</span>
        </button>
      </div>

      {/* Quick horizontal tap targets (mobile-first thumb-friendly) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {SORT_OPTIONS.map((opt) => {
          const isSelected = sortBy === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectSort(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border min-h-[38px] active:scale-95 ${
                isSelected
                  ? "bg-amber-400/15 border-amber-400/50 text-amber-300 font-semibold shadow-sm"
                  : "bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
              }`}
              title={opt.description}
            >
              <span>{opt.shortLabel}</span>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          )
        })}
      </div>

      {/* Explanatory mental state hint */}
      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 bg-neutral-950/50 px-2.5 py-1.5 rounded-lg border border-neutral-800/60">
        <span className="text-amber-400 font-medium">When to use:</span>
        <span className="text-neutral-300 truncate">{activeSortOption.mentalState}</span>
      </div>
    </div>
  )
}
