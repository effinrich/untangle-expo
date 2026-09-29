import { useEffect, useRef, useState } from "react"
import { User } from "firebase/auth"
import { MicroTask } from "../services/api"
import { saveTaskToFirestore, subscribeToUserTasks } from "../services/firebase"
import { loadJson, removeKey, saveJson, STORAGE_KEYS } from "../services/storage"

function persistTask(userId: string, task: MicroTask) {
  saveTaskToFirestore(userId, task).catch((error) => {
    console.error(`Failed to sync task ${task.id}:`, error)
  })
}

// Guests keep tasks in AsyncStorage; signed-in users sync with Firestore (guest tasks migrate on sign-in).
export function useTaskStore(user: User | null, authReady: boolean) {
  const [tasks, setTasks] = useState<MicroTask[]>([])
  const [tasksReady, setTasksReady] = useState(false)
  const tasksRef = useRef(tasks)
  const guestLoadedRef = useRef(false)

  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    if (!authReady || user) return
    let cancelled = false
    guestLoadedRef.current = false
    loadJson<MicroTask[]>(STORAGE_KEYS.guestTasks, []).then((stored) => {
      if (cancelled) return
      guestLoadedRef.current = true
      setTasks(stored)
      setTasksReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [authReady, user])

  useEffect(() => {
    if (!user && guestLoadedRef.current) saveJson(STORAGE_KEYS.guestTasks, tasks)
  }, [tasks, user])

  useEffect(() => {
    if (!user) return
    let unsubscribe: (() => void) | undefined
    let cancelled = false
    let isInitialSnapshot = true

    const startSync = async () => {
      const localTasks = tasksRef.current.map((task) => ({ ...task, userId: user.uid }))
      const results = await Promise.allSettled(
        localTasks.map((task) => saveTaskToFirestore(user.uid, task)),
      )
      if (results.every((result) => result.status === "fulfilled")) {
        await removeKey(STORAGE_KEYS.guestTasks)
      } else {
        console.error("Some guest tasks failed to migrate to Firestore")
      }
      if (cancelled) return

      unsubscribe = subscribeToUserTasks(
        user.uid,
        (fetchedTasks) => {
          if (isInitialSnapshot) {
            isInitialSnapshot = false
            setTasks((current) => {
              const remoteIds = new Set(fetchedTasks.map((task) => task.id))
              return [...fetchedTasks, ...current.filter((task) => !remoteIds.has(task.id))]
            })
          } else {
            setTasks(fetchedTasks)
          }
          setTasksReady(true)
        },
        (error) => {
          console.error("Tasks sync error:", error)
          setTasksReady(true)
        },
      )
    }

    startSync().catch((error) => {
      console.error("Failed to start task sync:", error)
      setTasksReady(true)
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [user])

  const updateTask = (id: string, change: (task: MicroTask) => MicroTask) => {
    const current = tasksRef.current.find((task) => task.id === id)
    if (!current) return
    const updated = change(current)
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)))
    if (user) persistTask(user.uid, updated)
  }

  const addTasks = (newTasks: MicroTask[]) => {
    const owned = newTasks.map((task) => ({ ...task, userId: user?.uid }))
    setTasks((prev) => [...owned, ...prev])
    if (user) owned.forEach((task) => persistTask(user.uid, task))
  }

  const setCompleted = (id: string, completed: boolean) =>
    updateTask(id, (task) => ({
      ...task,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    }))

  return { tasks, tasksReady, addTasks, setCompleted }
}
