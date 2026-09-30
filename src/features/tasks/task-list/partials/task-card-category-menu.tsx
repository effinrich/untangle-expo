import React from "react"
import { ChevronDown } from "lucide-react"
import { MicroTask } from "../../../../types"
import { DEFAULT_CATEGORIES, getCategoryStyle } from "../../../../data/categories"

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
        className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors disabled:hover:text-neutral-400"
      >
        <span
          aria-hidden="true"
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: categoryStyle.color }}
        />
        <span>{task.category}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-30 w-44 rounded-md border border-neutral-700 bg-neutral-900 p-1 text-sm">
          {DEFAULT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className={`w-full min-h-11 text-left px-2 rounded flex items-center gap-2 transition-colors ${
                task.category === cat.name
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-300 hover:bg-neutral-800/60"
              }`}
            >
              <span
                aria-hidden="true"
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
