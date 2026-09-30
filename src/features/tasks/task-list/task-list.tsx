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
import { QuickAddForm } from "./partials/quick-add-form"
import { SortModal } from "./partials/sort-modal"
import { TaskCard } from "./partials/task-card"
import { TaskFilterBar } from "./partials/task-filter-bar"
import { TaskListEmptyState } from "./partials/task-list-empty-state"
import { TaskListFooter } from "./partials/task-list-footer"

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
      <TaskFilterBar
        filterTab={filterTab}
        activeCount={activeCount}
        completedCount={completedCount}
        onFilterTabChange={setFilterTab}
        categoryNames={allCategoryNames}
        categoryCounts={categoryCounts}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeSortOption={activeSortOption}
        onOpenSortModal={() => setIsSortModalOpen(true)}
        onToggleAddForm={() => setIsAddingNew(!isAddingNew)}
      />

      {isAddingNew && (
        <QuickAddForm
          form={quickAddForm}
          categoryNames={allCategoryNames}
          onCancel={() => setIsAddingNew(false)}
        />
      )}

      {sortedTasks.length === 0 ? (
        <TaskListEmptyState selectedCategory={selectedCategory} filterTab={filterTab} />
      ) : (
        <ul className="divide-y divide-neutral-800">
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
        </ul>
      )}

      <TaskListFooter
        activeCount={activeCount}
        completedCount={completedCount}
        copiedNotification={copiedNotification}
        onExportMarkdown={handleExportMarkdown}
        onClearCompleted={onClearCompleted}
      />

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
