import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore"
import { MicroTask } from "../types"
import { db } from "./firebase"
import { OperationType, handleFirestoreError } from "./firestore-errors"

// Real-time Firestore sync for tasks
export function subscribeToUserTasks(
  userId: string,
  onTasksUpdated: (tasks: MicroTask[]) => void,
  onError?: (err: unknown) => void,
): () => void {
  const path = `users/${userId}/tasks`
  const tasksRef = collection(db, "users", userId, "tasks")

  const unsubscribe = onSnapshot(
    tasksRef,
    (snapshot) => {
      const tasks: MicroTask[] = []
      snapshot.forEach((docSnap) => {
        tasks.push(docSnap.data() as MicroTask)
      })
      // Sort tasks by createdAt desc
      tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      onTasksUpdated(tasks)
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path)
      if (onError) onError(error)
    },
  )

  return unsubscribe
}

// Save or create task in Firestore
export async function saveTaskToFirestore(userId: string, task: MicroTask): Promise<void> {
  const path = `users/${userId}/tasks/${task.id}`
  try {
    const taskDocRef = doc(db, "users", userId, "tasks", task.id)
    const sanitizedTask = {
      id: task.id,
      userId,
      title: task.title.slice(0, 300),
      firstPhysicalStep: task.firstPhysicalStep.slice(0, 500),
      estimatedMinutes: Number(task.estimatedMinutes) || 5,
      energyLevel: task.energyLevel || "medium",
      category: task.category || "Personal",
      priority: task.priority || "medium",
      whyItMatters: (task.whyItMatters || "").slice(0, 500),
      substeps: task.substeps || [],
      completed: Boolean(task.completed),
      completedAt: task.completedAt || null,
      createdAt: task.createdAt || new Date().toISOString(),
    }
    await setDoc(taskDocRef, sanitizedTask, { merge: true })
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path)
  }
}

// Delete task from Firestore
export async function deleteTaskFromFirestore(userId: string, taskId: string): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`
  try {
    const taskDocRef = doc(db, "users", userId, "tasks", taskId)
    await deleteDoc(taskDocRef)
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path)
  }
}
