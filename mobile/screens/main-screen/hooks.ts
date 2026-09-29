import { useEffect, useMemo, useRef, useState } from "react"
import { Alert } from "react-native"
import * as Google from "expo-auth-session/providers/google"
import { onAuthStateChanged, User } from "firebase/auth"
import { useVoiceRecorder } from "../../hooks/use-voice-recorder"
import * as Haptics from "../../utils/haptics"
import { MicroTask, untangleBrainDump } from "../../services/api"
import {
  auth,
  saveTaskToFirestore,
  signInWithGoogleCredential,
  subscribeToUserTasks,
} from "../../services/firebase"
import firebaseConfig from "../../firebase-applet-config.json"
import { SEED_TASKS } from "./consts"
import { SortType } from "./types"
import { filterAndSortTasks } from "./utils"

const SEED_TASK_IDS = new Set(SEED_TASKS.map((task) => task.id))

export function useGoogleAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [, setIsAuthLoading] = useState(true)

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: firebaseConfig.oAuthClientId,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setIsAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params
      if (id_token) {
        signInWithGoogleCredential(id_token).catch(() => {
          Alert.alert("Sign-In Error", "Could not sign in with Google.")
        })
      }
    }
  }, [response])

  return { user, canSignIn: !!request, promptAsync }
}

export function useMainTasks(user: User | null) {
  const [tasks, setTasks] = useState<MicroTask[]>(SEED_TASKS)
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks
  const persistTask = (userId: string, task: MicroTask) => {
    saveTaskToFirestore(userId, task).catch((error) => {
      console.error(`Failed to sync task ${task.id}:`, error)
    })
  }

  useEffect(() => {
    if (user) {
      let unsubscribe: (() => void) | undefined
      let cancelled = false
      let isInitialSnapshot = true

      const startSync = async () => {
        const localTasks = tasksRef.current
          .filter((task) => !SEED_TASK_IDS.has(task.id))
          .map((task) => ({ ...task, userId: user.uid }))
        const migrationResults = await Promise.allSettled(
          localTasks.map((task) => saveTaskToFirestore(user.uid, task)),
        )
        const failedMigrations = migrationResults.filter((result) => result.status === "rejected")
        if (failedMigrations.length > 0) {
          console.error(`Failed to migrate ${failedMigrations.length} local task(s) to Firestore`)
        }
        if (cancelled) return

        unsubscribe = subscribeToUserTasks(
          user.uid,
          (fetchedTasks) => {
            if (isInitialSnapshot) {
              setTasks((currentTasks) => {
                const remoteIds = new Set(fetchedTasks.map((task) => task.id))
                const localOnlyTasks = currentTasks.filter((task) => !remoteIds.has(task.id))
                return [...fetchedTasks, ...localOnlyTasks]
              })
              isInitialSnapshot = false
              return
            }
            setTasks(fetchedTasks)
          },
          (error) => console.error("Tasks sync error:", error),
        )
      }

      startSync().catch((error) => {
        console.error("Failed to start task sync:", error)
      })

      return () => {
        cancelled = true
        unsubscribe?.()
      }
    } else {
      setTasks(SEED_TASKS)
    }
  }, [user])

  const addUntangledTasks = (untangled: MicroTask[]) => {
    const newTasks = untangled.map((t) => ({
      ...t,
      userId: user?.uid,
    }))
    setTasks((prev) => [...newTasks, ...prev])

    if (user) {
      newTasks.forEach((task) => persistTask(user.uid, task))
    }
  }

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? new Date().toISOString() : undefined,
          }
          if (user) {
            persistTask(user.uid, updated)
          }
          return updated
        }
        return t
      }),
    )
  }

  return { tasks, addUntangledTasks, toggleComplete }
}

export function useTaskFilters(tasks: MicroTask[]) {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState<SortType>("energy-asc")

  const sortedTasks = useMemo(
    () => filterAndSortTasks(tasks, selectedCategory, sortBy),
    [tasks, selectedCategory, sortBy],
  )

  const selectCategory = (cat: string) => {
    setSelectedCategory(cat)
    Haptics.selectionAsync()
  }

  const selectSort = (sort: SortType) => {
    setSortBy(sort)
    Haptics.selectionAsync()
  }

  return { selectedCategory, selectCategory, sortBy, selectSort, sortedTasks }
}

export function useBrainDumpPad(onUntangled: (tasks: MicroTask[]) => void) {
  const [brainDumpText, setBrainDumpText] = useState("")
  const [isUntangling, setIsUntangling] = useState(false)
  const voice = useVoiceRecorder((text) =>
    setBrainDumpText((prev) => (prev ? `${prev} ${text}` : text)),
  )

  const handleUntangle = async () => {
    if (!brainDumpText.trim() || isUntangling) return
    setIsUntangling(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    try {
      const result = await untangleBrainDump(brainDumpText)
      onUntangled(result.tasks)
      setBrainDumpText("")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (err: unknown) {
      Alert.alert("Untangle Error", (err as Error)?.message || "Failed to process thoughts.")
    } finally {
      setIsUntangling(false)
    }
  }

  return {
    brainDumpText,
    setBrainDumpText,
    isUntangling,
    ...voice,
    handleUntangle,
  }
}
