import React from "react"
import { Plus, Search, SlidersHorizontal } from "lucide-react"
import { FilterTab, SortOptionConfig } from "../types"

interface TaskFilterBarProps {
  filterTab: FilterTab
  activeCount: number
  completedCount: number
  onFilterTabChange: (tab: FilterTab) => void
  categoryNames: string[]
  categoryCounts: Record<string, number>
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedPriority: string
  onPriorityChange: (priority: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  activeSortOption: SortOptionConfig
  onOpenSortModal: () => void
  onToggleAddForm: () => void
}

const CONTROL =
  "min-h-11 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-base text-neutral-200 focus-visible:ring-2 focus-visible:ring-amber-400"
const GHOST =
  "min-h-11 rounded-md border border-neutral-800 px-3 text-sm text-neutral-300 hover:text-neutral-100 hover:border-neutral-700 transition-colors flex items-center gap-2"

// One control row where there used to be four strips of pills. Filters are
// selects, which is what a filter is; the accent is reserved for the primary
// action, so selection state here is neutral.
export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filterTab,
  activeCount,
  completedCount,
  onFilterTabChange,
  categoryNames,
  categoryCounts,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  searchQuery,
  onSearchChange,
  activeSortOption,
  onOpenSortModal,
  onToggleAddForm,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-3 pb-4 border-b border-neutral-800">
      <label htmlFor="filter-status" className="sr-only">
        Show
      </label>
      <select
        id="filter-status"
        value={filterTab}
        onChange={(e) => onFilterTabChange(e.target.value as FilterTab)}
        className={CONTROL}
      >
        <option value="all">Active steps ({activeCount})</option>
        <option value="quick-wins">Quick wins, 5 min or less</option>
        <option value="low-energy">Low energy</option>
        <option value="high-focus">Deep focus</option>
        <option value="completed">Done ({completedCount})</option>
      </select>

      <label htmlFor="filter-category" className="sr-only">
        Category
      </label>
      <select
        id="filter-category"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={CONTROL}
      >
        <option value="all">All categories</option>
        {categoryNames.map((name) => (
          <option key={name} value={name}>
            {name} ({categoryCounts[name] || 0})
          </option>
        ))}
      </select>

      <label htmlFor="filter-priority" className="sr-only">
        Priority
      </label>
      <select
        id="filter-priority"
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className={CONTROL}
      >
        <option value="all">Any priority</option>
        <option value="high">High priority</option>
        <option value="medium">Medium priority</option>
        <option value="low">Low priority</option>
      </select>

      <div className="relative flex-1 min-w-40">
        <Search
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          aria-hidden="true"
        />
        <label htmlFor="filter-search" className="sr-only">
          Search steps
        </label>
        <input
          id="filter-search"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className={`w-full pl-9 ${CONTROL}`}
        />
      </div>

      <button type="button" onClick={onOpenSortModal} className={GHOST}>
        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
        <span className="text-neutral-500">Sort:</span>
        <span>{activeSortOption.label}</span>
      </button>

      <button type="button" onClick={onToggleAddForm} className={GHOST}>
        <Plus className="w-4 h-4" aria-hidden="true" />
        <span>Add</span>
      </button>
    </div>
  )
}
