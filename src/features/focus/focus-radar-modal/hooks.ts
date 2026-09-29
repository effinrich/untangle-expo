import { useEffect, type Dispatch, type SetStateAction } from "react"
import { AmbientSoundType, MicroTask } from "../../../types"
import { ambientEngine } from "../../../services/ambient"
import { soundService } from "../../../services/sound"

interface FocusRadarEffectsOptions {
  task: MicroTask
  isOpen: boolean
  isRunning: boolean
  secondsRemaining: number
  setSecondsRemaining: Dispatch<SetStateAction<number>>
  setIsRunning: Dispatch<SetStateAction<boolean>>
  setAmbientSound: Dispatch<SetStateAction<AmbientSoundType>>
}

export function useFocusRadarEffects({
  task,
  isOpen,
  isRunning,
  secondsRemaining,
  setSecondsRemaining,
  setIsRunning,
  setAmbientSound,
}: FocusRadarEffectsOptions) {
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining((task.estimatedMinutes || 10) * 60)
      setIsRunning(true)
      soundService.playFocusStart()
    } else {
      setIsRunning(false)
      ambientEngine.stop()
      setAmbientSound("none")
    }
  }, [isOpen, task, setSecondsRemaining, setIsRunning, setAmbientSound])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1)
      }, 1000)
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false)
      soundService.playCompletionChime()
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, secondsRemaining, setSecondsRemaining, setIsRunning])
}
