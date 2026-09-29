import React from "react"
import { Layers } from "lucide-react"
import { getCategoryStyle } from "../../../../data/categories"

interface CategoryFilterStripProps {
  categoryNames: string[]
  categoryCounts: Record<string, number>
  activeCount: number
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export const CategoryFilterStrip: React.FC<CategoryFilterStripProps> = ({
  categoryNames,
  categoryCounts,
  activeCount,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-3 backdrop-blur-sm shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Priority Areas & Categories</span>
        </div>
        {selectedCategory !== "all" && (
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className="text-[11px] text-amber-400 hover:text-amber-300 underline"
          >
            Reset Category Filter
          </button>
        )}
      </div>

      {/* Category Horizontal Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 min-h-[36px] ${
            selectedCategory === "all"
              ? "bg-neutral-800 text-neutral-100 border border-neutral-700 shadow-sm"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          }`}
        >
          <span>All Categories</span>
          <span className="font-mono text-[10px] opacity-75">({activeCount})</span>
        </button>

        {categoryNames.map((catName) => {
          const style = getCategoryStyle(catName)
          const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase()
          const count = categoryCounts[catName] || 0

          return (
            <button
              key={catName}
              type="button"
              onClick={() => onSelectCategory(isSelected ? "all" : catName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border min-h-[36px] ${
                isSelected
                  ? `${style.bgLight} ${style.borderColor} ${style.textColor} font-semibold ring-1 ring-amber-400/30`
                  : "bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: style.color }}
              />
              <span>{catName}</span>
              <span className="font-mono text-[10px] opacity-70">({count})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
