import React from "react"
import { RotateCcw, Tag } from "lucide-react"
import { ALL_AREAS, TARGET_AREA_CATEGORIES } from "../consts"

interface BrainDumpAreaFilterProps {
  selectedFocusCategory: string
  onSelectCategory: (name: string) => void
  hasText: boolean
  onClear: () => void
}

// Priority area focus filter plus the clear button
export const BrainDumpAreaFilter: React.FC<BrainDumpAreaFilterProps> = ({
  selectedFocusCategory,
  onSelectCategory,
  hasText,
  onClear,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        <span className="text-neutral-500 whitespace-nowrap flex items-center gap-1">
          <Tag className="w-3 h-3 text-neutral-400" />
          <span>Target Area:</span>
        </span>
        <button
          type="button"
          onClick={() => onSelectCategory(ALL_AREAS)}
          className={`px-2 py-0.5 rounded-md border text-[11px] whitespace-nowrap transition-colors ${
            selectedFocusCategory === ALL_AREAS
              ? "bg-neutral-800 border-neutral-600 text-amber-300 font-medium"
              : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Auto-Detect All
        </button>
        {TARGET_AREA_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.name)}
            className={`px-2 py-0.5 rounded-md border text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedFocusCategory === cat.name
                ? `${cat.bgLight} ${cat.borderColor} ${cat.textColor} font-semibold`
                : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {hasText && (
        <button
          type="button"
          onClick={onClear}
          className="text-neutral-500 hover:text-neutral-300 text-xs flex items-center gap-1 transition-colors self-end sm:self-auto"
          title="Clear text"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear Dump</span>
        </button>
      )}
    </div>
  )
}
