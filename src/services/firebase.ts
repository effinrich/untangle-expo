import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MicroTask, ParkingLotItem } from '../types';

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handling types and function required by Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or connection pending:', error.message);
      return false;
    }
    // Permissions error or non-existent document is normal for test doc
    return true;
  }
}

// Auth helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save or update user profile in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'ADHD Planner',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return user;
  } catch (err) {
    console.error('Sign in failed:', err);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// Real-time Firestore sync for tasks
export function subscribeToUserTasks(
  userId: string,
  onTasksUpdated: (tasks: MicroTask[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = `users/${userId}/tasks`;
  const tasksRef = collection(db, 'users', userId, 'tasks');

  const unsubscribe = onSnapshot(
    tasksRef,
    (snapshot) => {
      const tasks: MicroTask[] = [];
      snapshot.forEach((docSnap) => {
        tasks.push(docSnap.data() as MicroTask);
      });
      // Sort tasks by createdAt desc
      tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onTasksUpdated(tasks);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

// Save or create task in Firestore
export async function saveTaskToFirestore(userId: string, task: MicroTask): Promise<void> {
  const path = `users/${userId}/tasks/${task.id}`;
  try {
    const taskDocRef = doc(db, 'users', userId, 'tasks', task.id);
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
      createdAt: task.createdAt || new Date().toISOString(),
    };
    await setDoc(taskDocRef, sanitizedTask, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete task from Firestore
export async function deleteTaskFromFirestore(userId: string, taskId: string): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to parking lot items
export function subscribeToParkingLot(
  userId: string,
  onItemsUpdated: (items: ParkingLotItem[]) => void
): () => void {
  const path = `users/${userId}/parkingLot`;
  const itemsRef = collection(db, 'users', userId, 'parkingLot');

  return onSnapshot(
    itemsRef,
    (snapshot) => {
      const items: ParkingLotItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ParkingLotItem);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onItemsUpdated(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Save parking lot item
export async function saveParkingItemToFirestore(userId: string, item: ParkingLotItem): Promise<void> {
  const path = `users/${userId}/parkingLot/${item.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'parkingLot', item.id);
    await setDoc(docRef, {
      id: item.id,
      userId,
      text: item.text.slice(0, 500),
      createdAt: item.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete parking lot item
export async function deleteParkingItemFromFirestore(userId: string, itemId: string): Promise<void> {
  const path = `users/${userId}/parkingLot/${itemId}`;
  try {
    const docRef = doc(db, 'users', userId, 'parkingLot', itemId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
