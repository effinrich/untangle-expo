import { View, Text, Pressable } from 'react-native';
import React, { useState } from "react"
import {
  Check,
  Play,
  Scissors,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Tag,
  AlertCircle,
  Briefcase,
  Home,
  Heart,
  Landmark,
  ShoppingBag,
  Palette,
} from "lucide-react-native"
import confetti from "canvas-confetti"
import { MicroTask, EnergyLevel, PriorityLevel } from "../../types"
import { soundService } from "../../services/sound"
import { apiBreakdownTask } from "../../services/api"
import { DEFAULT_CATEGORIES, getCategoryStyle } from "../../data/categories"

interface TaskCardProps {
  task: MicroTask
  onToggleComplete: (id: string) => void
  onToggleSubstep: (taskId: string, substepId: string) => void
  onDelete: (id: string) => void
  onStartFocus: (task: MicroTask) => void
  onUpdateTask: (task: MicroTask) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onToggleSubstep,
  onDelete,
  onStartFocus,
  onUpdateTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isBreakingDown, setIsBreakingDown] = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)

  const handleComplete = () => {
    if (!task.completed) {
      soundService.playCompletionChime()
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.75 },
        colors: ["#F59E0B", "#10B981", "#6366F1", "#EC4899"],
        disableForReducedMotion: true,
      })
    }
    onToggleComplete(task.id)
  }

  const handleSubstepCheck = (subId: string, currentCompleted: boolean) => {
    if (!currentCompleted) {
      soundService.playTick()
    }
    onToggleSubstep(task.id, subId)
  }

  const handleBreakdownFurther = async () => {
    setIsBreakingDown(true)
    try {
      const result = await apiBreakdownTask(task.title, task.firstPhysicalStep)
      const newSubsteps = result.microSteps.map((stepText, idx) => ({
        id: `micro_${Date.now()}_${idx}`,
        text: stepText,
        completed: false,
      }))

      onUpdateTask({
        ...task,
        firstPhysicalStep: result.easierFirstStep || task.firstPhysicalStep,
        substeps: [...task.substeps, ...newSubsteps],
      })
      setIsExpanded(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsBreakingDown(false)
    }
  }

  const handleSelectCategory = (categoryName: string) => {
    onUpdateTask({
      ...task,
      category: categoryName,
    })
    setIsCategoryMenuOpen(false)
  }

  const handleTogglePriority = () => {
    const cycle: Record<PriorityLevel, PriorityLevel> = {
      high: "medium",
      medium: "low",
      low: "high",
    }
    const current = task.priority || "medium"
    onUpdateTask({
      ...task,
      priority: cycle[current],
    })
  }

  const completedSubstepsCount = task.substeps.filter((s) => s.completed).length
  const totalSubsteps = task.substeps.length

  const energyColors: Record<EnergyLevel, string> = {
    low: "text-emerald-400",
    medium: "text-amber-400",
    high: "text-rose-400",
  }

  const categoryStyle = getCategoryStyle(task.category)

  const priorityStyles: Record<PriorityLevel, { text: string; label: string }> = {
    high: { text: "text-rose-400", label: "High Priority" },
    medium: { text: "text-amber-400", label: "Med Priority" },
    low: { text: "text-neutral-500", label: "Low Priority" },
  }

  const currentPriority = task.priority || "medium"

  return (
    <View
      className={`group border rounded-xl transition-all duration-200 ${
        task.completed
          ? "bg-neutral-900/30 border-neutral-900/80 opacity-60"
          : "bg-neutral-900/70 border-neutral-800 hover:border-neutral-700/80 shadow-sm"
      }`}
    >
      <View className="p-4 md:p-5">
        <View className="flex items-start gap-3.5">
          {/* Main task complete toggle */}
          <Pressable
            
            onPress={handleComplete}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              task.completed
                ? "bg-emerald-500 border-emerald-400 text-neutral-950"
                : "border-neutral-700 hover:border-amber-400 bg-neutral-950 text-transparent"
            }`}
            
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </Pressable>

          <View className="flex-1 min-w-0">
            {/* Title & Category/Priority row */}
            <View className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 mb-1.5">
              <Text
                className={`text-sm md:text-base font-semibold leading-snug break-words ${
                  task.completed ? "line-through text-neutral-500" : "text-neutral-100"
                }`}
              >
                {task.title}
              </Text>

              {/* Zero-Pill Text Metadata & Category Pill */}
              <View className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 shrink-0 font-mono tabular-nums">
                {/* Category Badge with Dropdown Trigger */}
                <View className="relative">
                  <Pressable
                    
                    onPress={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                    disabled={task.completed}
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-sans font-medium flex items-center gap-1 transition-colors ${categoryStyle.bgLight} ${categoryStyle.borderColor} ${categoryStyle.textColor} hover:brightness-110`}
                    
                  >
                    <Tag className="w-2.5 h-2.5" />
                    <Text>{task.category}</Text>
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </Pressable>

                  {/* Category Switcher Menu */}
                  {isCategoryMenuOpen && (
                    <View className="absolute right-0 top-full mt-1 z-30 w-44 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl p-1 text-xs font-sans">
                      <View className="px-2 py-1 text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                        Switch Category
                      </View>
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <Pressable
                          key={cat.id}
                          
                          onPress={() => handleSelectCategory(cat.name)}
                          className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                            task.category === cat.name
                              ? "bg-neutral-800 text-white font-medium"
                              : "text-neutral-300 hover:bg-neutral-800/60"
                          }`}
                        >
                          <Text
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <Text>{cat.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                <Text aria-hidden={true} className="text-neutral-700">
                  ·
                </Text>

                {/* Priority Toggle */}
                {!task.completed && (
                  <Pressable
                    
                    onPress={handleTogglePriority}
                    className={`text-[11px] font-sans font-medium hover:underline ${priorityStyles[currentPriority].text}`}
                    
                  >
                    {priorityStyles[currentPriority].label}
                  </Pressable>
                )}

                <Text aria-hidden={true} className="text-neutral-700">
                  ·
                </Text>

                <Text className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  <Text>{task.estimatedMinutes}m</Text>
                </Text>

                <Text aria-hidden={true} className="text-neutral-700">
                  ·
                </Text>
                <Text className={`capitalize ${energyColors[task.energyLevel]}`}>
                  {task.energyLevel} energy
                </Text>
              </View>
            </View>

            {/* First Physical Step: The ADHD Spark Banner */}
            {!task.completed && (
              <View className="mt-2.5 mb-2 p-2.5 bg-neutral-950/80 border border-neutral-800/80 rounded-lg flex items-start gap-2.5">
                <View className="w-4 h-4 mt-0.5 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Zap className="w-2.5 h-2.5" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-[11px] font-medium text-amber-300 uppercase tracking-wider block">
                    Immediate Physical First Step
                  </Text>
                  <Text className="text-xs text-neutral-300 mt-0.5 font-normal leading-relaxed">
                    {task.firstPhysicalStep}
                  </Text>
                </View>
              </View>
            )}

            {/* Why It Matters Rationale */}
            {task.whyItMatters && !task.completed && (
              <Text className="text-xs text-neutral-500 mt-1 italic">{task.whyItMatters}</Text>
            )}

            {/* Action Bar */}
            <View className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-neutral-800/60">
              <View className="flex items-center gap-2">
                {!task.completed && (
                  <Pressable
                    
                    onPress={() => onStartFocus(task)}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/20 transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-amber-300" />
                    <Text>Focus on this</Text>
                  </Pressable>
                )}

                {!task.completed && (
                  <Pressable
                    
                    onPress={handleBreakdownFurther}
                    disabled={isBreakingDown}
                    className="px-2.5 py-1 text-xs font-medium rounded-md text-neutral-400 hover:text-neutral-200 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 transition-colors flex items-center gap-1.5"
                    
                  >
                    <Scissors className="w-3 h-3" />
                    <Text>{isBreakingDown ? "Slicing..." : "Break down further"}</Text>
                  </Pressable>
                )}

                {totalSubsteps > 0 && (
                  <Pressable
                    
                    onPress={() => setIsExpanded(!isExpanded)}
                    className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
                  >
                    <Text>
                      {completedSubstepsCount}/{totalSubsteps} micro-steps
                    </Text>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </Pressable>
                )}
              </View>

              <View className="flex items-center gap-1 ml-auto">
                <Pressable
                  
                  onPress={() => onDelete(task.id)}
                  className="p-1.5 rounded-md text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Pressable>
              </View>
            </View>

            {/* Expandable Substep Checklist */}
            {isExpanded && totalSubsteps > 0 && (
              <View className="mt-3 pt-3 border-t border-neutral-800 space-y-2">
                <View className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
                  Micro-Steps (Check off as you move)
                </View>
                {task.substeps.map((sub) => (
                  <Pressable
                    key={sub.id}
                    onPress={() => handleSubstepCheck(sub.id, sub.completed)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                      sub.completed
                        ? "bg-neutral-950/40 text-neutral-500 line-through"
                        : "bg-neutral-950/80 text-neutral-300 hover:bg-neutral-950"
                    }`}
                  >
                    <Pressable
                      
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        sub.completed
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : "border-neutral-700 bg-neutral-900 text-transparent"
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </Pressable>
                    <Text className="text-xs select-none">{sub.text}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}
