import { MicroTask } from "../../../types"
import { DEFAULT_FOCUS_MINUTES } from "./consts"

export function getTaskFocusSeconds(task: MicroTask): number {
  return (task.estimatedMinutes || DEFAULT_FOCUS_MINUTES) * 60
}

export function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
