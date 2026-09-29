import { useMemo, useRef, useState } from "react"
import { AccessibilityInfo, TextInput } from "react-native"
import { useVoiceRecorder } from "../../hooks/use-voice-recorder"
import * as Haptics from "../../utils/haptics"
import { MicroTask, untangleBrainDump } from "../../services/api"
import { ApiError, friendlyErrorMessage } from "../../services/api-client"
import { ALL_AREAS } from "./consts"
import { SortType, UntangleStatus } from "./types"
import { areasFor, sortOpenTasks } from "./utils"

export function useBrainDump(onUntangled: (tasks: MicroTask[]) => void) {
  const [text, setText] = useState("")
  const [status, setStatus] = useState<UntangleStatus>({ state: "idle" })
  const [emptyError, setEmptyError] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const voice = useVoiceRecorder((spoken) => {
    setText((prev) => (prev ? `${prev} ${spoken}` : spoken))
    setEmptyError(false)
  })

  const changeText = (next: string) => {
    setText(next)
    if (next.trim()) setEmptyError(false)
  }

  const submit = async () => {
    if (status.state === "untangling") return
    if (!text.trim()) {
      setEmptyError(true)
      inputRef.current?.focus()
      return
    }
    inputRef.current?.blur()
    setStatus({ state: "untangling" })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      const result = await untangleBrainDump(text)
      onUntangled(result.tasks)
      setText("")
      setStatus({ state: "idle" })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      AccessibilityInfo.announceForAccessibility(
        `Added ${result.tasks.length} ${result.tasks.length === 1 ? "step" : "steps"}`,
      )
    } catch (error) {
      setStatus({
        state: "error",
        kind: error instanceof ApiError ? error.kind : "unknown",
        message: friendlyErrorMessage(error),
      })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  return {
    text,
    changeText,
    status,
    emptyError,
    inputRef,
    submit,
    fillExample: (example: string) => changeText(example),
    ...voice,
  }
}

export function useTaskView(tasks: MicroTask[]) {
  const [sortBy, setSortBy] = useState<SortType>("energy-asc")
  const [area, setArea] = useState(ALL_AREAS)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showDone, setShowDone] = useState(false)

  const areas = useMemo(() => areasFor(tasks), [tasks])
  const activeArea = areas.includes(area) ? area : ALL_AREAS
  const openTasks = useMemo(
    () => sortOpenTasks(tasks, activeArea, sortBy),
    [tasks, activeArea, sortBy],
  )
  const doneTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks])

  return {
    sortBy,
    selectSort: (next: SortType) => {
      setSortBy(next)
      Haptics.selectionAsync()
    },
    area: activeArea,
    areas,
    selectArea: (next: string) => {
      setArea(next)
      Haptics.selectionAsync()
    },
    sheetOpen,
    openSheet: () => setSheetOpen(true),
    closeSheet: () => setSheetOpen(false),
    showDone,
    toggleDone: () => setShowDone((v) => !v),
    openTasks,
    doneTasks,
  }
}
