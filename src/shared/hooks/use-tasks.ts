import { useEffect, useState } from "react"
import { User } from "firebase/auth"
import { INITIAL_SEED_TASKS } from "../../data/seed-data"
import { MicroTask } from "../../types"
import {
  deleteTaskFromFirestore,
  saveTaskToFirestore,
  subscribeToUserTasks,
} from "../../services/tasks"
import { TASKS_STORAGE_KEY } from "../consts/storage-keys"
import { NewTaskInput } from "../types/task"
import { readStoredList, writeStoredList } from "../utils/storage"
import { createTask, toggleTaskCompleted, toggleTaskSubstep } from "../utils/task"

// Single owner of task state: the list, stats, focus, and unstick features all read it from here.
export function useTasks(currentUser: User | null) {
  const [tasks, setTasks] = useState<MicroTask[]>(() =>
    readStoredList(TASKS_STORAGE_KEY, INITIAL_SEED_TASKS, "tasks"),
  )

  // When user is authenticated, migrate local tasks and listen to Firestore in real time
  useEffect(() => {
    if (!currentUser) return

    const localTasksJson = localStorage.getItem(TASKS_STORAGE_KEY)
    if (localTasksJson) {
      try {
        const localTasks: MicroTask[] = JSON.parse(localTasksJson)
        localTasks.forEach((t) => {
          saveTaskToFirestore(currentUser.uid, {
            ...t,
            userId: currentUser.uid,
          })
        })
      } catch {
        // ignore
      }
    }

    const unsubTasks = subscribeToUserTasks(
      currentUser.uid,
      (remoteTasks) => {
        if (remoteTasks.length > 0) {
          setTasks(remoteTasks)
        }
      },
      (err) => console.error("Tasks sync error:", err),
    )

    return () => unsubTasks()
  }, [currentUser])

  // Sync tasks to localStorage for offline / guest access
  useEffect(() => {
    writeStoredList(TASKS_STORAGE_KEY, tasks)
  }, [tasks])

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = toggleTaskCompleted(t)
          if (currentUser) {
            saveTaskToFirestore(currentUser.uid, updated)
          }
          return updated
        }
        return t
      }),
    )
  }

  const toggleSubstep = (taskId: string, substepId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const updatedTask = toggleTaskSubstep(t, substepId)
        if (currentUser) {
          saveTaskToFirestore(currentUser.uid, updatedTask)
        }
        return updatedTask
      }),
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (currentUser) {
      deleteTaskFromFirestore(currentUser.uid, id)
    }
  }

  const updateTask = (updated: MicroTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    if (currentUser) {
      saveTaskToFirestore(currentUser.uid, updated)
    }
  }

  const addTask = (newTask: NewTaskInput) => {
    const created = createTask(newTask, currentUser?.uid)
    setTasks((prev) => [created, ...prev])
    if (currentUser) {
      saveTaskToFirestore(currentUser.uid, created)
    }
  }

  const addUntangledTasks = (untangled: MicroTask[]) => {
    const newTasks = untangled.map((t) => ({
      ...t,
      userId: currentUser?.uid,
    }))
    setTasks((prev) => [...newTasks, ...prev])

    // If signed in, persist to Firestore
    if (currentUser) {
      newTasks.forEach((t) => saveTaskToFirestore(currentUser.uid, t))
    }
  }

  const clearCompleted = () => {
    const completedTasks = tasks.filter((t) => t.completed)
    setTasks((prev) => prev.filter((t) => !t.completed))
    if (currentUser) {
      completedTasks.forEach((t) => deleteTaskFromFirestore(currentUser.uid, t.id))
    }
  }

  const resetToSeed = () => {
    setTasks(INITIAL_SEED_TASKS)
    if (currentUser) {
      INITIAL_SEED_TASKS.forEach((t) =>
        saveTaskToFirestore(currentUser.uid, {
          ...t,
          userId: currentUser.uid,
        }),
      )
    }
  }

  return {
    tasks,
    toggleComplete,
    toggleSubstep,
    deleteTask,
    updateTask,
    addTask,
    addUntangledTasks,
    clearCompleted,
    resetToSeed,
  }
}
