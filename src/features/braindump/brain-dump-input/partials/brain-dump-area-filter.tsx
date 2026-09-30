import React from "react"
import { RotateCcw } from "lucide-react"
import { ALL_AREAS, TARGET_AREA_CATEGORIES } from "../consts"

interface BrainDumpAreaFilterProps {
  selectedFocusCategory: string
  onSelectCategory: (name: string) => void
  hasText: boolean
  onClear: () => void
}

export const BrainDumpAreaFilter: React.FC<BrainDumpAreaFilterProps> = ({
  selectedFocusCategory,
  onSelectCategory,
  hasText,
  onClear,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="dump-area" className="text-sm text-neutral-500">
          Target area
        </label>
        <select
          id="dump-area"
          value={selectedFocusCategory}
          onChange={(e) => onSelectCategory(e.target.value)}
          className="min-h-11 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-base text-neutral-200 focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <option value={ALL_AREAS}>Auto-detect</option>
          {TARGET_AREA_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {hasText && (
        <button
          type="button"
          onClick={onClear}
          className="min-h-11 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Clear</span>
        </button>
      )}
    </div>
  )
}
