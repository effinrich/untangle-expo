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

const WRITE_ERROR_MESSAGE = "It may have been undone, so check your tasks and try again."

// Single owner of task state: the list, stats, focus, and unstick features all read it from here.
export function useTasks(currentUser: User | null) {
  const [tasks, setTasks] = useState<MicroTask[]>(() =>
    readStoredList(TASKS_STORAGE_KEY, INITIAL_SEED_TASKS, "tasks"),
  )
  const [writeError, setWriteError] = useState<string | null>(null)

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

  // Optimistic write: the local change lands first; a failed write is rolled back and
  // surfaced, never silently dropped. Signed-in writes only; guests are local-only.
  const persist = (revert: () => void, write: () => Promise<void>[]) => {
    Promise.all(write()).catch(() => {
      revert()
      setWriteError(WRITE_ERROR_MESSAGE)
    })
  }

  const toggleComplete = (id: string) => {
    const previous = tasks.find((t) => t.id === id)
    if (!previous) return
    const updated = toggleTaskCompleted(previous)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    if (!currentUser) return
    const uid = currentUser.uid
    persist(
      () => setTasks((cur) => cur.map((t) => (t.id === id ? previous : t))),
      () => [saveTaskToFirestore(uid, updated)],
    )
  }

  const toggleSubstep = (taskId: string, substepId: string) => {
    const previous = tasks.find((t) => t.id === taskId)
    if (!previous) return
    const updated = toggleTaskSubstep(previous, substepId)
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
    if (!currentUser) return
    const uid = currentUser.uid
    persist(
      () => setTasks((cur) => cur.map((t) => (t.id === taskId ? previous : t))),
      () => [saveTaskToFirestore(uid, updated)],
    )
  }

  const deleteTask = (id: string) => {
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) return
    const removed = tasks[index]
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (!currentUser) return
    const uid = currentUser.uid
    persist(
      () =>
        setTasks((cur) =>
          cur.some((t) => t.id === id)
            ? cur
            : [...cur.slice(0, index), removed, ...cur.slice(index)],
        ),
      () => [deleteTaskFromFirestore(uid, id)],
    )
  }

  const restoreTask = (task: MicroTask) => {
    setTasks((prev) => (prev.some((t) => t.id === task.id) ? prev : [task, ...prev]))
    if (!currentUser) return
    const uid = currentUser.uid
    persist(
      () => setTasks((cur) => cur.filter((t) => t.id !== task.id)),
      () => [saveTaskToFirestore(uid, { ...task, userId: uid })],
    )
  }

  const updateTask = (updated: MicroTask) => {
    const previous = tasks.find((t) => t.id === updated.id) ?? null
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    if (!currentUser) return
    const uid = currentUser.uid
    persist(
      previous
        ? () => setTasks((cur) => cur.map((t) => (t.id === updated.id ? previous : t)))
        : () => setTasks((cur) => cur.filter((t) => t.id !== updated.id)),
      () => [saveTaskToFirestore(uid, updated)],
    )
  }

  const addTask = (newTask: NewTaskInput) => {
    const created = createTask(newTask, currentUser?.uid)
    setTasks((prev) => [created, ...prev])
    if (!currentUser) return
    const uid = currentUser.uid
    persist(
      () => setTasks((cur) => cur.filter((t) => t.id !== created.id)),
      () => [saveTaskToFirestore(uid, created)],
    )
  }

  const addUntangledTasks = (untangled: MicroTask[]) => {
    const newTasks = untangled.map((t) => ({
      ...t,
      userId: currentUser?.uid,
    }))
    setTasks((prev) => [...newTasks, ...prev])
    if (!currentUser) return
    const uid = currentUser.uid
    persist(
      () => setTasks((cur) => cur.filter((t) => !newTasks.some((n) => n.id === t.id))),
      () => newTasks.map((t) => saveTaskToFirestore(uid, t)),
    )
  }

  const clearCompleted = () => {
    const removed = tasks.filter((t) => t.completed)
    if (removed.length === 0) return
    const removedIds = new Set(removed.map((t) => t.id))
    setTasks((prev) => prev.filter((t) => !removedIds.has(t.id)))
    if (!currentUser) return
    const uid = currentUser.uid
    persist(
      () =>
        setTasks((cur) => [...cur, ...removed.filter((r) => !cur.some((c) => c.id === r.id))]),
      () => removed.map((t) => deleteTaskFromFirestore(uid, t.id)),
    )
  }

  const resetToSeed = () => {
    const previous = tasks
    setTasks(INITIAL_SEED_TASKS)
    if (!currentUser) return
    const uid = currentUser.uid
    persist(
      () => setTasks(previous),
      () => INITIAL_SEED_TASKS.map((t) => saveTaskToFirestore(uid, { ...t, userId: uid })),
    )
  }

  return {
    tasks,
    writeError,
    clearWriteError: () => setWriteError(null),
    toggleComplete,
    toggleSubstep,
    deleteTask,
    restoreTask,
    updateTask,
    addTask,
    addUntangledTasks,
    clearCompleted,
    resetToSeed,
  }
}
