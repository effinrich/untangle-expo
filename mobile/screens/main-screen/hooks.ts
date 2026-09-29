import { useEffect, useMemo, useState } from "react"
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

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserTasks(user.uid, (fetchedTasks) => {
        setTasks(fetchedTasks)
      })
      return () => unsubscribe()
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
      newTasks.forEach((t) => saveTaskToFirestore(user.uid, t))
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
            saveTaskToFirestore(user.uid, updated)
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
