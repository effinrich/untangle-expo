import { initializeApp } from "firebase/app"
import {
  initializeAuth,
  signOut,
  User,
  Auth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth"
// @ts-ignore
import { getReactNativePersistence } from "@firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getFirestore, doc, collection, onSnapshot, setDoc, deleteDoc } from "firebase/firestore"
import { Platform } from "react-native"
import firebaseConfig from "../firebase-applet-config.json"
import { MicroTask } from "./api"

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId)

let _auth: Auth
if (Platform.OS === "web") {
  const { getAuth } = require("firebase/auth")
  _auth = getAuth(app)
} else {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
}
export const auth = _auth

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string
  operationType: OperationType
  path: string | null
  authInfo: {
    userId?: string | null
    email?: string | null
    emailVerified?: boolean | null
    isAnonymous?: boolean | null
    tenantId?: string | null
  }
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  }
  console.error("Firestore Error: ", JSON.stringify(errInfo))
  throw new Error(JSON.stringify(errInfo))
}

export async function signInWithGoogleCredential(idToken: string): Promise<User> {
  try {
    const credential = GoogleAuthProvider.credential(idToken)
    const result = await signInWithCredential(auth, credential)
    const user = result.user

    const userDocRef = doc(db, "users", user.uid)
    await setDoc(
      userDocRef,
      {
        userId: user.uid,
        email: user.email || "",
        displayName: user.displayName || "ADHD Planner",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    )

    return user
  } catch (err) {
    console.error("Sign in failed:", err)
    throw err
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth)
}

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

export async function deleteTaskFromFirestore(userId: string, taskId: string): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`
  try {
    const taskDocRef = doc(db, "users", userId, "tasks", taskId)
    await deleteDoc(taskDocRef)
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path)
  }
}
