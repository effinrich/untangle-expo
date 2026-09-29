import React from "react"
import { ChevronDown, Tag } from "lucide-react"
import { MicroTask } from "../../../types"
import { DEFAULT_CATEGORIES, getCategoryStyle } from "../../../data/categories"

interface TaskCardCategoryMenuProps {
  task: MicroTask
  isOpen: boolean
  onToggle: () => void
  onSelectCategory: (categoryName: string) => void
}

export const TaskCardCategoryMenu: React.FC<TaskCardCategoryMenuProps> = ({
  task,
  isOpen,
  onToggle,
  onSelectCategory,
}) => {
  const categoryStyle = getCategoryStyle(task.category)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={task.completed}
        className={`px-2 py-0.5 rounded-md border text-[11px] font-sans font-medium flex items-center gap-1 transition-colors ${categoryStyle.bgLight} ${categoryStyle.borderColor} ${categoryStyle.textColor} hover:brightness-110`}
        title="Click to change category"
      >
        <Tag className="w-2.5 h-2.5" />
        <span>{task.category}</span>
        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
      </button>

      {/* Category Switcher Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl p-1 text-xs font-sans">
          <div className="px-2 py-1 text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
            Switch Category
          </div>
          {DEFAULT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                task.category === cat.name
                  ? "bg-neutral-800 text-white font-medium"
                  : "text-neutral-300 hover:bg-neutral-800/60"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
