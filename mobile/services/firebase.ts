import { 
  Auth,
  GoogleAuthProvider,
  User,
  initializeAuth,
  signInWithCredential,
  signOut
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getFirestore, 
  onSnapshot,
  setDoc      
} from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initializeApp } from 'firebase/app'
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js'
import { Platform } from 'react-native'

import firebaseConfig from '../firebase-applet-config.json'
import { ParkingLotItem } from '../types'

import { MicroTask } from './api'

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId)
export const googleProvider = new GoogleAuthProvider()

let _auth: Auth
if (Platform.OS === 'web') {
  const { getAuth } = require('firebase/auth')
  _auth = getAuth(app)
} else {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  })
}
export const auth = _auth

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
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
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId
    },
    operationType,
    path
  }

  // oxlint-disable no-console
  console.error('Firestore Error: ', JSON.stringify(errInfo))
  // oxlint-enable no-console
  throw new Error(JSON.stringify(errInfo))
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'))
    return true
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      // oxlint-disable no-console
      console.warn('Firestore offline or connection pending:', error.message)
      // oxlint-enable no-console
      return false
    }
    return true
  }
}

export async function signInWithGoogleCredential(
  idToken?: string
): Promise<User> {
  try {
    let user: User
    if (Platform.OS === 'web') {
      const { signInWithPopup } = require('firebase/auth')
      const result = await signInWithPopup(auth, googleProvider)
      user = result.user
    } else {
      if (!idToken) throw new Error('idToken is required for native sign in')
      const credential = GoogleAuthProvider.credential(idToken)
      const result = await signInWithCredential(auth, credential)
      user = result.user
    }

    const userDocRef = doc(db, 'users', user.uid)
    await setDoc(
      userDocRef,
      {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'ADHD Planner',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString()
      },
      { merge: true }
    )

    return user
  } catch (err) {
    // oxlint-disable no-console
    console.error('Sign in failed:', err)
    // oxlint-enable no-console
    throw err
  }
}
export async function signOutUser(): Promise<void> {
  await signOut(auth)
}
export function subscribeToUserTasks(
  userId: string,
  onTasksUpdated: (tasks: Array<MicroTask>) => void,
  onError?: (err: unknown) => void
): () => void {
  const path = `users/${userId}/tasks`
  const tasksRef = collection(db, 'users', userId, 'tasks')

  const unsubscribe = onSnapshot(
    tasksRef,
    snapshot => {
      const tasks: Array<MicroTask> = []
      snapshot.forEach(docSnap => {
        tasks.push(docSnap.data() as MicroTask)
      })

      tasks.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      onTasksUpdated(tasks)
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path)
      if (onError) onError(error)
    }
  )

  return unsubscribe
}
export async function saveTaskToFirestore(
  userId: string,
  task: MicroTask
): Promise<void> {
  const path = `users/${userId}/tasks/${task.id}`
  try {
    const taskDocRef = doc(db, 'users', userId, 'tasks', task.id)
    const sanitizedTask = {
      id: task.id,
      userId,
      title: task.title.slice(0, 300),
      firstPhysicalStep: task.firstPhysicalStep.slice(0, 500),
      estimatedMinutes: Number(task.estimatedMinutes) || 5,
      energyLevel: task.energyLevel || 'medium',
      category: task.category || 'Personal',
      priority: task.priority || 'medium',
      whyItMatters: (task.whyItMatters || '').slice(0, 500),
      substeps: task.substeps || [],
      completed: Boolean(task.completed),
      completedAt: task.completedAt || null,
      createdAt: task.createdAt || new Date().toISOString()
    }
    await setDoc(taskDocRef, sanitizedTask, { merge: true })
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path)
  }
}
export async function deleteTaskFromFirestore(
  userId: string,
  taskId: string
): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`
  try {
    const taskDocRef = doc(db, 'users', userId, 'tasks', taskId)
    await deleteDoc(taskDocRef)
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path)
  }
}

export function subscribeToParkingLot(
  userId: string,
  onItemsUpdated: (items: Array<ParkingLotItem>) => void
): () => void {
  const path = `users/${userId}/parkingLot`
  const itemsRef = collection(db, 'users', userId, 'parkingLot')

  return onSnapshot(
    itemsRef,
    snapshot => {
      const items: Array<ParkingLotItem> = []
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as ParkingLotItem)
      })
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      onItemsUpdated(items)
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path)
    }
  )
}

export async function saveParkingItemToFirestore(
  userId: string,
  item: ParkingLotItem
): Promise<void> {
  const path = `users/${userId}/parkingLot/${item.id}`
  try {
    const docRef = doc(db, 'users', userId, 'parkingLot', item.id)
    await setDoc(docRef, {
      id: item.id,
      userId,
      text: item.text.slice(0, 500),
      createdAt: item.createdAt || new Date().toISOString()
    })
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path)
  }
}

export async function deleteParkingItemFromFirestore(
  userId: string,
  itemId: string
): Promise<void> {
  const path = `users/${userId}/parkingLot/${itemId}`
  try {
    const docRef = doc(db, 'users', userId, 'parkingLot', itemId)
    await deleteDoc(docRef)
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path)
  }
}
