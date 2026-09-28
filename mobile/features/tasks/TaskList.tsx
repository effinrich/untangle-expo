import { View, Text, Pressable, TextInput } from 'react-native';
import React, { useState, useMemo } from "react"
import {
  Search,
  CheckCircle2,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Tag,
  Layers,
  ArrowUpDown,
  ArrowDownUp,
  BatteryCharging,
  Flame,
  Clock,
  X,
  Check,
  SlidersHorizontal,
} from "lucide-react-native"
import { MicroTask, EnergyLevel, PriorityLevel } from "../../types"
import { DEFAULT_CATEGORIES, getCategoryStyle } from "../../data/categories"
import { TaskCard } from "./TaskCard"
import { soundService } from "../../services/sound"

interface TaskListProps {
  tasks: MicroTask[]
  onToggleComplete: (id: string) => void
  onToggleSubstep: (taskId: string, substepId: string) => void
  onDelete: (id: string) => void
  onStartFocus: (task: MicroTask) => void
  onUpdateTask: (task: MicroTask) => void
  onAddTask: (task: Omit<MicroTask, "id" | "createdAt" | "completed">) => void
  onClearCompleted: () => void
  onOpenUnstick: () => void
}

type FilterTab = "all" | "quick-wins" | "low-energy" | "high-focus" | "completed"

export type SortOption =
  | "energy-asc" // Low → High Energy (Gentle low friction)
  | "energy-desc" // High → Low Energy (Hyperfocus surge)
  | "time-asc" // Shortest First (Quick dopamine)
  | "priority-desc" // Highest Priority
  | "newest" // Recently Added

const SORT_OPTIONS: {
  id: SortOption
  label: string
  shortLabel: string
  icon: string
  description: string
  mentalState: string
}[] = [
  {
    id: "energy-asc",
    label: "Low to High Energy",
    shortLabel: "🔋 Low Energy First",
    icon: "🔋",
    description: "Start with lowest friction steps requiring almost zero willpower.",
    mentalState: "Brain is tired, foggy, or facing strong initiation resistance.",
  },
  {
    id: "energy-desc",
    label: "High to Low Energy",
    shortLabel: "🚀 Hyperfocus First",
    icon: "🚀",
    description: "Tackle heavy cognitive challenges while dopamine is surging.",
    mentalState: "Riding a hyperfocus wave or high morning motivation.",
  },
  {
    id: "time-asc",
    label: "Shortest Duration",
    shortLabel: "⚡ Quick Wins First",
    icon: "⚡",
    description: "Knock out 2-5 minute micro-tasks to trigger immediate momentum.",
    mentalState: "Need rapid positive reinforcement to unblock inertia.",
  },
  {
    id: "priority-desc",
    label: "Highest Priority",
    shortLabel: "🔥 Priority First",
    icon: "🔥",
    description: "Surface critical commitments and deadline-sensitive items.",
    mentalState: "Clear goal orientation without getting distracted by busywork.",
  },
  {
    id: "newest",
    label: "Recently Added",
    shortLabel: "🕒 Newest First",
    icon: "🕒",
    description: "Most recently untangled thoughts from your brain dump.",
    mentalState: "Working through your freshest stream of consciousness.",
  },
]

const energyValues: Record<EnergyLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

const priorityValues: Record<PriorityLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onToggleSubstep,
  onDelete,
  onStartFocus,
  onUpdateTask,
  onAddTask,
  onClearCompleted,
  onOpenUnstick,
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("energy-asc")
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [copiedNotification, setCopiedNotification] = useState(false)

  // New task form state
  const [newTitle, setNewTitle] = useState("")
  const [newFirstStep, setNewFirstStep] = useState("")
  const [newMinutes, setNewMinutes] = useState(5)
  const [newEnergy, setNewEnergy] = useState<EnergyLevel>("low")
  const [newCategory, setNewCategory] = useState("Personal")
  const [newPriority, setNewPriority] = useState<PriorityLevel>("medium")

  // Compute available categories from tasks plus defaults
  const allCategoryNames = useMemo(() => {
    const set = new Set<string>()
    DEFAULT_CATEGORIES.forEach((c) => set.add(c.name))
    tasks.forEach((t) => {
      if (t.category) set.add(t.category)
    })
    return Array.from(set)
  }, [tasks])

  // Count active tasks per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      if (!t.completed) {
        counts[t.category] = (counts[t.category] || 0) + 1
      }
    })
    return counts
  }, [tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (filterTab === "quick-wins") {
        if (t.estimatedMinutes > 5 || t.completed) return false
      } else if (filterTab === "low-energy") {
        if (t.energyLevel !== "low" || t.completed) return false
      } else if (filterTab === "high-focus") {
        if (t.energyLevel !== "high" || t.completed) return false
      } else if (filterTab === "completed") {
        if (!t.completed) return false
      }

      // Priority filter
      if (selectedPriority !== "all") {
        const taskPri = t.priority || "medium"
        if (taskPri !== selectedPriority) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchFirstStep = t.firstPhysicalStep.toLowerCase().includes(q)
        const matchCat = t.category.toLowerCase().includes(q)
        if (!matchTitle && !matchFirstStep && !matchCat) return false
      }

      // Category filter
      if (selectedCategory !== "all") {
        if (t.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false
        }
      }

      return true
    })
  }, [tasks, filterTab, searchQuery, selectedCategory, selectedPriority])

  // Sort tasks based on selected mental state / energy order
  const sortedTasks = useMemo(() => {
    const result = [...filteredTasks]
    result.sort((a, b) => {
      // Keep incomplete tasks ahead of completed items (unless in 'completed' tab)
      if (filterTab !== "completed" && a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      if (sortBy === "energy-asc") {
        const aVal = energyValues[a.energyLevel] || 2
        const bVal = energyValues[b.energyLevel] || 2
        if (aVal !== bVal) return aVal - bVal
        return (a.estimatedMinutes || 10) - (b.estimatedMinutes || 10)
      }

      if (sortBy === "energy-desc") {
        const aVal = energyValues[a.energyLevel] || 2
        const bVal = energyValues[b.energyLevel] || 2
        if (bVal !== aVal) return bVal - aVal
        return (b.estimatedMinutes || 10) - (a.estimatedMinutes || 10)
      }

      if (sortBy === "time-asc") {
        return (a.estimatedMinutes || 10) - (b.estimatedMinutes || 10)
      }

      if (sortBy === "priority-desc") {
        const aPri = priorityValues[a.priority || "medium"]
        const bPri = priorityValues[b.priority || "medium"]
        if (bPri !== aPri) return bPri - aPri
        return (energyValues[a.energyLevel] || 2) - (energyValues[b.energyLevel] || 2)
      }

      // 'newest' default
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    return result
  }, [filteredTasks, sortBy, filterTab])

  const completedCount = tasks.filter((t) => t.completed).length
  const activeCount = tasks.length - completedCount

  const handleSelectSort = (option: SortOption) => {
    setSortBy(option)
    soundService.playTick()
    setIsSortModalOpen(false)
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    onAddTask({
      title: newTitle.trim(),
      firstPhysicalStep:
        newFirstStep.trim() || `Open the relevant app or physical tool for ${newTitle.trim()}`,
      estimatedMinutes: Number(newMinutes) || 5,
      energyLevel: newEnergy,
      category: newCategory.trim() || "Personal",
      priority: newPriority,
      whyItMatters: "Quick momentum to free up mental space",
      substeps: [
        { id: `sub_${Date.now()}_0`, text: "2-minute timer start", completed: false },
        { id: `sub_${Date.now()}_1`, text: "Execute the action", completed: false },
      ],
    })

    setNewTitle("")
    setNewFirstStep("")
    setIsAddingNew(false)
  }

  const handleExportMarkdown = () => {
    const lines = [
      `# ADHD Action Plan (${new Date().toLocaleDateString()})`,
      "",
      `## Incomplete Tasks (${activeCount}) - Sorted by ${SORT_OPTIONS.find((s) => s.id === sortBy)?.label}`,
      ...sortedTasks
        .filter((t) => !t.completed)
        .map(
          (t) =>
            `- [ ] **${t.title}** [${t.category}] (${t.estimatedMinutes}m · ${t.energyLevel} energy · ${t.priority || "med"} priority)\n  - *First step:* ${t.firstPhysicalStep}`,
        ),
      "",
      `## Completed (${completedCount})`,
      ...tasks.filter((t) => t.completed).map((t) => `- [x] ${t.title} [${t.category}]`),
    ]

    navigator.clipboard.writeText(lines.join("\n"))
    setCopiedNotification(true)
    setTimeout(() => setCopiedNotification(false), 2000)
  }

  const activeSortOption = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0]

  return (
    <View className="w-full space-y-4">
      {/* Priority Area / Category Tabs Strip */}
      <View className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-3 backdrop-blur-sm shadow-sm space-y-2.5">
        <View className="flex items-center justify-between">
          <View className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <Text>Priority Areas & Categories</Text>
          </View>
          {selectedCategory !== "all" && (
            <Pressable
              
              onPress={() => setSelectedCategory("all")}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline"
            >
              Reset Category Filter
            </Pressable>
          )}
        </View>

        {/* Category Horizontal Filter Pills */}
        <View className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <Pressable
            
            onPress={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 min-h-[36px] ${
              selectedCategory === "all"
                ? "bg-neutral-800 text-neutral-100 border border-neutral-700 shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <Text>All Categories</Text>
            <Text className="font-mono text-[10px] opacity-75">({activeCount})</Text>
          </Pressable>

          {allCategoryNames.map((catName) => {
            const style = getCategoryStyle(catName)
            const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase()
            const count = categoryCounts[catName] || 0

            return (
              <Pressable
                key={catName}
                
                onPress={() => setSelectedCategory(isSelected ? "all" : catName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border min-h-[36px] ${
                  isSelected
                    ? `${style.bgLight} ${style.borderColor} ${style.textColor} font-semibold ring-1 ring-amber-400/30`
                    : "bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                }`}
              >
                <Text
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: style.color }}
                />
                <Text>{catName}</Text>
                <Text className="font-mono text-[10px] opacity-70">({count})</Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* Mobile-First Energy Sorting & Mental State Quick-Switch Strip */}
      <View className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 backdrop-blur-sm space-y-2">
        <View className="flex items-center justify-between">
          <View className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <Text>Match Your Mental State (Energy Sorting)</Text>
          </View>

          {/* Trigger full bottom sheet/modal */}
          <Pressable
            
            onPress={() => setIsSortModalOpen(true)}
            className="text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-amber-400/10"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <Text>All Sort Options</Text>
          </Pressable>
        </View>

        {/* Quick horizontal tap targets (mobile-first thumb-friendly) */}
        <View className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = sortBy === opt.id
            return (
              <Pressable
                key={opt.id}
                
                onPress={() => handleSelectSort(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border min-h-[38px] active:scale-95 ${
                  isSelected
                    ? "bg-amber-400/15 border-amber-400/50 text-amber-300 font-semibold shadow-sm"
                    : "bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                }`}
                
              >
                <Text>{opt.shortLabel}</Text>
                {isSelected && <Text className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </Pressable>
            )
          })}
        </View>

        {/* Explanatory mental state hint */}
        <View className="text-[11px] text-neutral-400 flex items-center gap-1.5 bg-neutral-950/50 px-2.5 py-1.5 rounded-lg border border-neutral-800/60">
          <Text className="text-amber-400 font-medium">When to use:</Text>
          <Text className="text-neutral-300 truncate">{activeSortOption.mentalState}</Text>
        </View>
      </View>

      {/* Main Filter & Search Controls Bar */}
      <View className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-800 p-3.5 rounded-xl backdrop-blur-sm">
        {/* Status Filter Tabs */}
        <View className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          <Pressable
            
            onPress={() => setFilterTab("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
              filterTab === "all"
                ? "bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Active ({activeCount})
          </Pressable>
          <Pressable
            
            onPress={() => setFilterTab("quick-wins")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 min-h-[36px] ${
              filterTab === "quick-wins"
                ? "bg-amber-400/15 text-amber-300 shadow-sm border border-amber-400/30"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
            
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <Text>≤5m Wins</Text>
          </Pressable>
          <Pressable
            
            onPress={() => setFilterTab("low-energy")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
              filterTab === "low-energy"
                ? "bg-emerald-400/15 text-emerald-300 shadow-sm border border-emerald-400/30"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Low Energy 🔋
          </Pressable>
          <Pressable
            
            onPress={() => setFilterTab("high-focus")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
              filterTab === "high-focus"
                ? "bg-rose-400/15 text-rose-300 shadow-sm border border-rose-400/30"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Deep Focus 🚀
          </Pressable>
          <Pressable
            
            onPress={() => setFilterTab("completed")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
              filterTab === "completed"
                ? "bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Done ({completedCount})
          </Pressable>
        </View>

        {/* Search, Priority filter & Quick Add Button */}
        <View className="flex items-center gap-2">
          {/* Priority dropdown */}
          <TextInput
            value={selectedPriority}
            onChangeText={setSelectedPriority}
            className="bg-neutral-950/80 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-neutral-700 min-h-[36px]"
            
          >
            
            
            
            
          </TextInput>

          {/* Search Box */}
          <View className="relative flex-1 sm:w-44 lg:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <TextInput
              
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search tasks..."
              className="w-full bg-neutral-950/80 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400/60 min-h-[36px]"
            />
          </View>

          {/* Quick Add Button */}
          <Pressable
            
            onPress={() => setIsAddingNew(!isAddingNew)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700/60 transition-colors flex items-center gap-1 shrink-0 min-h-[36px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <Text className="hidden sm:inline">Add Task</Text>
          </Pressable>
        </View>
      </View>

      {/* Manual Quick Add Form */}
      {isAddingNew && (
        <View
          
          className="p-4 bg-neutral-900/90 border border-amber-500/30 rounded-xl space-y-3"
        >
          <View className="text-xs font-semibold text-amber-300">Quick Micro-Task Entry</View>
          <View className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <View>
              <Text className="text-[11px] text-neutral-400 block mb-1">Task Title</Text>
              <TextInput
                
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. Call pharmacy for refill"
                
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </View>
            <View>
              <Text className="text-[11px] text-neutral-400 block mb-1">
                First Physical Action (The Spark)
              </Text>
              <TextInput
                
                value={newFirstStep}
                onChangeText={setNewFirstStep}
                placeholder="e.g. Tap green phone icon and dial 1-800..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </View>
          </View>

          <View className="flex flex-wrap items-center gap-3 pt-1">
            <View className="flex items-center gap-2">
              <Text className="text-[11px] text-neutral-400">Category:</Text>
              <TextInput
                value={newCategory}
                onChangeText={setNewCategory}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                
              </TextInput>
            </View>

            <View className="flex items-center gap-2">
              <Text className="text-[11px] text-neutral-400">Priority:</Text>
              <TextInput
                value={newPriority}
                onChangeText={(text) => setNewPriority(text as "high" | "medium" | "low")}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                
                
                
              </TextInput>
            </View>

            <View className="flex items-center gap-2">
              <Text className="text-[11px] text-neutral-400">Minutes:</Text>
              <TextInput
                
                
                
                value={String(newMinutes)}
                onChangeText={(val) => setNewMinutes(Number(val))}
                className="w-16 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-neutral-200 text-center font-mono tabular-nums focus:outline-none"
              />
            </View>

            <View className="flex items-center gap-2">
              <Text className="text-[11px] text-neutral-400">Energy:</Text>
              <TextInput
                value={newEnergy}
                onChangeText={(text) => setNewEnergy(text as "low" | "medium" | "high")}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none"
              >
                
                
                
              </TextInput>
            </View>

            <View className="flex items-center gap-2 ml-auto">
              <Pressable
                
                onPress={() => setIsAddingNew(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </Pressable>
              <Pressable
                
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 text-neutral-950 hover:bg-amber-300"
              >
                Save Task
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Task List Items */}
      {sortedTasks.length === 0 ? (
        <View className="text-center py-12 px-4 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/30">
          <View className="w-10 h-10 mx-auto rounded-full bg-neutral-800/80 text-neutral-400 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-amber-400/80" />
          </View>
          <Text className="text-sm font-semibold text-neutral-200">
            {selectedCategory !== "all"
              ? `No tasks under "${selectedCategory}"`
              : "No tasks in this view"}
          </Text>
          <Text className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {filterTab === "completed"
              ? "Complete tasks to celebrate your daily dopamine momentum here!"
              : "Add a new task or choose another filter."}
          </Text>
        </View>
      ) : (
        <View className="space-y-3">
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
        </View>
      )}

      {/* Footer Utility Actions */}
      <View className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-neutral-500 border-t border-neutral-800/60">
        <View className="flex items-center gap-3">
          <Text>
            {activeCount} active · {completedCount} checked off
          </Text>
          <Text className="text-neutral-400 font-mono">Sorted: {activeSortOption.label}</Text>
        </View>

        <View className="flex items-center gap-3">
          <Pressable
            
            onPress={handleExportMarkdown}
            className="hover:text-neutral-300 flex items-center gap-1.5 transition-colors"
            
          >
            <Copy className="w-3.5 h-3.5" />
            <Text>{copiedNotification ? "Copied to Clipboard!" : "Copy Plan as Markdown"}</Text>
          </Pressable>

          {completedCount > 0 && (
            <Pressable
              
              onPress={onClearCompleted}
              className="hover:text-rose-400 transition-colors"
            >
              Clear Completed
            </Pressable>
          )}
        </View>
      </View>

      {/* Mobile-First Bottom Sheet / Sort Drawer Modal */}
      {isSortModalOpen && (
        <View className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <View className="w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar">
            {/* Sheet header */}
            <View className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <View>
                <Text className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-amber-400" />
                  <Text>Choose Mental State & Energy Sort</Text>
                </Text>
                <Text className="text-[11px] text-neutral-400 mt-0.5">
                  Pick the order that matches your current cognitive battery.
                </Text>
              </View>
              <Pressable
                
                onPress={() => setIsSortModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </Pressable>
            </View>

            {/* Options list with full explanations */}
            <View className="space-y-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.id
                return (
                  <Pressable
                    key={opt.id}
                    
                    onPress={() => handleSelectSort(opt.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-amber-400/10 border-amber-400/50 text-neutral-100 shadow-sm"
                        : "bg-neutral-950/60 border-neutral-800/80 text-neutral-300 hover:bg-neutral-950 hover:border-neutral-700"
                    }`}
                  >
                    <Text className="text-lg shrink-0 mt-0.5">{opt.icon}</Text>
                    <View className="flex-1 min-w-0">
                      <View className="flex items-center justify-between">
                        <Text className="text-xs font-semibold text-neutral-100">{opt.label}</Text>
                        {isSelected && (
                          <View className="w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </View>
                        )}
                      </View>
                      <Text className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                        {opt.description}
                      </Text>
                      <View className="text-[10px] text-amber-400/90 mt-1 font-medium italic">
                        State: {opt.mentalState}
                      </View>
                    </View>
                  </Pressable>
                )
              })}
            </View>

            <View className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
              <Pressable
                
                onPress={() => setIsSortModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
              >
                Done
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
