import React, { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { AmbientSoundType, MicroTask } from "../../../types"
import { ambientEngine } from "../../../services/ambient"
import { soundService } from "../../../services/sound"
import { FOCUS_COMPLETE_CONFETTI } from "./consts"
import { getTaskFocusSeconds } from "./utils"

interface FocusSessionOptions {
  task: MicroTask
  isOpen: boolean
  onCompleteTask: (taskId: string) => void
  onClose: () => void
}

export function useFocusSession({ task, isOpen, onCompleteTask, onClose }: FocusSessionOptions) {
  const defaultSeconds = getTaskFocusSeconds(task)
  const [secondsRemaining, setSecondsRemaining] = useState(defaultSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>("none")
  const [volume, setVolume] = useState(0.4)

  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(getTaskFocusSeconds(task))
      setIsRunning(true)
      soundService.playFocusStart()
    } else {
      setIsRunning(false)
      ambientEngine.stop()
      setAmbientSound("none")
    }
  }, [isOpen, task])

  // Timer countdown tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1)
      }, 1000)
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false)
      soundService.playCompletionChime()
    }
    return () => clearInterval(interval)
  }, [isRunning, secondsRemaining])

  const changeAmbientSound = (type: AmbientSoundType) => {
    setAmbientSound(type)
    ambientEngine.play(type)
  }

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    ambientEngine.setVolume(val)
  }

  const addMinutes = (mins: number) => {
    setSecondsRemaining((prev) => prev + mins * 60)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setSecondsRemaining(defaultSeconds)
  }

  const complete = () => {
    soundService.playCompletionChime()
    confetti(FOCUS_COMPLETE_CONFETTI)
    onCompleteTask(task.id)
    ambientEngine.stop()
    onClose()
  }

  const close = () => {
    ambientEngine.stop()
    onClose()
  }

  return {
    secondsRemaining,
    isRunning,
    toggleRunning: () => setIsRunning(!isRunning),
    addMinutes,
    resetTimer,
    ambientSound,
    changeAmbientSound,
    volume,
    changeVolume,
    complete,
    close,
  }
}

export function useParkingThought(onAddParkingLotItem: (text: string) => void) {
  const [parkingThought, setParkingThought] = useState("")

  const handleAddThought = (e: React.FormEvent) => {
    e.preventDefault()
    if (!parkingThought.trim()) return
    onAddParkingLotItem(parkingThought.trim())
    setParkingThought("")
    soundService.playTick()
  }

  return { parkingThought, setParkingThought, handleAddThought }
}
