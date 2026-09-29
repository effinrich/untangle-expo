import { useState } from "react"
import { AccessibilityInfo } from "react-native"
import * as Haptics from "../../utils/haptics"
import { MicroTask, UnstickResult, unstickMe } from "../../services/api"
import { friendlyErrorMessage } from "../../services/api-client"
import { MOODS } from "./consts"

export function useUnstick(openTasks: MicroTask[]) {
  const [moodId, setMoodId] = useState<string>(MOODS[0].id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UnstickResult | null>(null)

  const selectMood = (id: string) => {
    setMoodId(id)
    Haptics.selectionAsync()
  }

  const pick = async () => {
    const mood = MOODS.find((m) => m.id === moodId)
    if (!mood || loading) return
    setLoading(true)
    setError(null)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      const picked = await unstickMe(openTasks, `${mood.label}: ${mood.description}`)
      setResult(picked)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      const task = openTasks.find((t) => t.id === picked.chosenTaskId)
      if (task) AccessibilityInfo.announceForAccessibility(`Picked: ${task.title}`)
    } catch (err) {
      setError(friendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const chosenTask = result ? openTasks.find((t) => t.id === result.chosenTaskId) : undefined

  return {
    moodId,
    selectMood,
    loading,
    error,
    result,
    chosenTask,
    pick,
    reset: () => setResult(null),
  }
}
