import React, { useMemo, useState } from "react"
import { soundService } from "../../../services/sound"
import { SORT_OPTIONS } from "./consts"
import { useQuickAddForm } from "./hooks"
import { FilterTab, SortOption, TaskListProps } from "./types"
import {
  buildMarkdownPlan,
  filterTasks,
  getAllCategoryNames,
  getCategoryCounts,
  sortTasks,
} from "./utils"
import { CategoryFilterStrip } from "./partials/category-filter-strip"
import { EnergySortStrip } from "./partials/energy-sort-strip"
import { QuickAddForm } from "./partials/quick-add-form"
import { SortModal } from "./partials/sort-modal"
import { StatusFilterTabs } from "./partials/status-filter-tabs"
import { TaskCard } from "./partials/task-card"
import { TaskListEmptyState } from "./partials/task-list-empty-state"
import { TaskListFooter } from "./partials/task-list-footer"
import { TaskSearchControls } from "./partials/task-search-controls"

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onToggleSubstep,
  onDelete,
  onStartFocus,
  onUpdateTask,
  onAddTask,
  onClearCompleted,
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("energy-asc")
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [copiedNotification, setCopiedNotification] = useState(false)

  const quickAddForm = useQuickAddForm(onAddTask, () => setIsAddingNew(false))

  const allCategoryNames = useMemo(() => getAllCategoryNames(tasks), [tasks])
  const categoryCounts = useMemo(() => getCategoryCounts(tasks), [tasks])
  const filteredTasks = useMemo(
    () => filterTasks(tasks, { filterTab, searchQuery, selectedCategory, selectedPriority }),
    [tasks, filterTab, searchQuery, selectedCategory, selectedPriority],
  )
  const sortedTasks = useMemo(
    () => sortTasks(filteredTasks, sortBy, filterTab),
    [filteredTasks, sortBy, filterTab],
  )

  const completedCount = tasks.filter((t) => t.completed).length
  const activeCount = tasks.length - completedCount
  const activeSortOption = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0]

  const handleSelectSort = (option: SortOption) => {
    setSortBy(option)
    soundService.playTick()
    setIsSortModalOpen(false)
  }

  const handleExportMarkdown = () => {
    navigator.clipboard.writeText(
      buildMarkdownPlan({ tasks, sortedTasks, sortBy, activeCount, completedCount }),
    )
    setCopiedNotification(true)
    setTimeout(() => setCopiedNotification(false), 2000)
  }

  return (
    <div className="w-full space-y-4">
      {/* Priority Area / Category Tabs Strip */}
      <CategoryFilterStrip
        categoryNames={allCategoryNames}
        categoryCounts={categoryCounts}
        activeCount={activeCount}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Mobile-First Energy Sorting & Mental State Quick-Switch Strip */}
      <EnergySortStrip
        sortBy={sortBy}
        activeSortOption={activeSortOption}
        onSelectSort={handleSelectSort}
        onOpenSortModal={() => setIsSortModalOpen(true)}
      />

      {/* Main Filter & Search Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-800 p-3.5 rounded-xl backdrop-blur-sm">
        <StatusFilterTabs
          filterTab={filterTab}
          activeCount={activeCount}
          completedCount={completedCount}
          onChange={setFilterTab}
        />
        <TaskSearchControls
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleAddForm={() => setIsAddingNew(!isAddingNew)}
        />
      </div>

      {/* Manual Quick Add Form */}
      {isAddingNew && (
        <QuickAddForm
          form={quickAddForm}
          categoryNames={allCategoryNames}
          onCancel={() => setIsAddingNew(false)}
        />
      )}

      {/* Task List Items */}
      {sortedTasks.length === 0 ? (
        <TaskListEmptyState selectedCategory={selectedCategory} filterTab={filterTab} />
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onToggleSubstep={onToggleSubstep}
              onDelete={onDelete}
              onStartFocus={onStartFocus}
              onUpdateTask={onUpdateTask}
            />
          ))}
        </div>
      )}

      <TaskListFooter
        activeCount={activeCount}
        completedCount={completedCount}
        sortLabel={activeSortOption.label}
        copiedNotification={copiedNotification}
        onExportMarkdown={handleExportMarkdown}
        onClearCompleted={onClearCompleted}
      />

      {/* Mobile-First Bottom Sheet / Sort Drawer Modal */}
      {isSortModalOpen && (
        <SortModal
          sortBy={sortBy}
          onSelectSort={handleSelectSort}
          onClose={() => setIsSortModalOpen(false)}
        />
      )}
    </div>
  )
}
