import React, { useState } from "react"
import confetti from "canvas-confetti"
import { EnergyLevel, PriorityLevel } from "../../../types"
import { soundService } from "../../../services/sound"
import { apiBreakdownTask } from "../../../services/api"
import { NewTaskInput } from "../../../shared/types/task"
import { completionConfetti, priorityCycle } from "./consts"
import { TaskCardProps } from "./types"
import { buildQuickAddTask } from "./utils"

// Lives in the list (not the form) so minutes/energy/category/priority persist between openings.
export function useQuickAddForm(onAddTask: (task: NewTaskInput) => void, onSaved: () => void) {
  const [newTitle, setNewTitle] = useState("")
  const [newFirstStep, setNewFirstStep] = useState("")
  const [newMinutes, setNewMinutes] = useState(5)
  const [newEnergy, setNewEnergy] = useState<EnergyLevel>("low")
  const [newCategory, setNewCategory] = useState("Personal")
  const [newPriority, setNewPriority] = useState<PriorityLevel>("medium")

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    onAddTask(
      buildQuickAddTask({
        title: newTitle,
        firstStep: newFirstStep,
        minutes: newMinutes,
        energy: newEnergy,
        category: newCategory,
        priority: newPriority,
      }),
    )

    setNewTitle("")
    setNewFirstStep("")
    onSaved()
  }

  return {
    newTitle,
    setNewTitle,
    newFirstStep,
    setNewFirstStep,
    newMinutes,
    setNewMinutes,
    newEnergy,
    setNewEnergy,
    newCategory,
    setNewCategory,
    newPriority,
    setNewPriority,
    handleCreateTask,
  }
}

export type QuickAddFormState = ReturnType<typeof useQuickAddForm>

export function useTaskCardActions({
  task,
  onToggleComplete,
  onToggleSubstep,
  onUpdateTask,
}: Pick<TaskCardProps, "task" | "onToggleComplete" | "onToggleSubstep" | "onUpdateTask">) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isBreakingDown, setIsBreakingDown] = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [breakdownError, setBreakdownError] = useState<string | null>(null)

  const handleComplete = () => {
    if (!task.completed) {
      soundService.playCompletionChime()
      confetti(completionConfetti)
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
    setBreakdownError(null)
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
      const status = (err as { status?: number } | null)?.status
      setBreakdownError(
        status === 503
          ? "Untangle's model is busy right now. Try again in a moment."
          : "Couldn't break that down right now. Try again in a moment.",
      )
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
    const current = task.priority || "medium"
    onUpdateTask({
      ...task,
      priority: priorityCycle[current],
    })
  }

  return {
    isExpanded,
    setIsExpanded,
    isBreakingDown,
    breakdownError,
    isCategoryMenuOpen,
    setIsCategoryMenuOpen,
    handleComplete,
    handleSubstepCheck,
    handleBreakdownFurther,
    handleSelectCategory,
    handleTogglePriority,
  }
}
