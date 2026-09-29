import React, { useEffect, useLayoutEffect, useState } from 'react'
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native'
import { useNavigation } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import { LogIn, LogOut, RotateCcw, Sparkles, Zap } from 'lucide-react-native'
import type { User } from 'firebase/auth'
import { BrainDumpInput } from '../braindump/BrainDumpInput'
import { TaskList } from '../tasks/TaskList'
import { FocusRadarModal } from '../focus/focus'
import { UnstickMeModal } from '../unstick/UnstickMeModal'
import { DopamineTracker } from '../stats/DopamineTracker'
import { INITIAL_SEED_TASKS } from '../../data/seedData'
import type { MicroTask, ParkingLotItem } from '../../types'
import { untangleBrainDump } from '../../services/api'
import {
  auth,
  deleteParkingItemFromFirestore,
  deleteTaskFromFirestore,
  saveParkingItemToFirestore,
  saveTaskToFirestore,
  signInWithGoogleCredential,
  signOutUser,
  subscribeToParkingLot,
  subscribeToUserTasks,
  testFirestoreConnection
} from '../../services/firebase'

const TASKS_KEY = 'tangle_tasks_v1'
const PARKING_KEY = 'tangle_parking_lot_v1'

const calmAmbientImg = require('../../assets/calm_focus_ambient_1790313003505.jpg')

function loadJson<T>(key: string, fallback: T): T {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return fallback
  }
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved) as T
    }
  } catch (e) {
    console.warn(`Failed to parse ${key}`, e)
  }
  return fallback
}

function saveJson(key: string, value: unknown): void {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return
  }
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(e)
  }
}

async function confirmResetToSeed(): Promise<boolean> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.confirm(
      'Load fresh sample ADHD tasks with priority categories?'
    )
  }
  return new Promise(resolve => {
    Alert.alert(
      'Reset tasks',
      'Load fresh sample ADHD tasks with priority categories?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Reset', onPress: () => resolve(true) }
      ]
    )
  })
}

type ActiveView = 'all' | 'dump' | 'tasks' | 'momentum'

export function DesktopDashboard() {
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [firestoreConnected, setFirestoreConnected] = useState(false)

  const [tasks, setTasks] = useState<MicroTask[]>(() =>
    loadJson(TASKS_KEY, INITIAL_SEED_TASKS)
  )
  const [parkingLot, setParkingLot] = useState<ParkingLotItem[]>(() =>
    loadJson(PARKING_KEY, [])
  )

  const [focusTask, setFocusTask] = useState<MicroTask | null>(null)
  const [isUnstickOpen, setIsUnstickOpen] = useState(false)
  const [activeView, setActiveView] = useState<ActiveView>('all')
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    testFirestoreConnection().then(setFirestoreConnected)
  }, [])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!currentUser) {
      return
    }

    const localTasksJson =
      Platform.OS === 'web' ? localStorage.getItem(TASKS_KEY) : null
    if (localTasksJson) {
      try {
        const localTasks: MicroTask[] = JSON.parse(localTasksJson)
        localTasks.forEach(t => {
          saveTaskToFirestore(currentUser.uid, {
            ...t,
            userId: currentUser.uid
          })
        })
      } catch {
        /* ignore corrupt local cache */
      }
    }

    const unsubTasks = subscribeToUserTasks(
      currentUser.uid,
      remoteTasks => {
        if (remoteTasks.length > 0) {
          setTasks(remoteTasks)
        }
      },
      err => console.error('Tasks sync error:', err)
    )

    const unsubParking = subscribeToParkingLot(currentUser.uid, remoteItems => {
      if (remoteItems.length > 0) {
        setParkingLot(remoteItems)
      }
    })

    return () => {
      unsubTasks()
      unsubParking()
    }
  }, [currentUser])

  useEffect(() => {
    saveJson(TASKS_KEY, tasks)
  }, [tasks])

  useEffect(() => {
    saveJson(PARKING_KEY, parkingLot)
  }, [parkingLot])

  const handleGoogleSignIn = async () => {
    setAuthError(null)
    try {
      await signInWithGoogleCredential()
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Google sign-in was cancelled or failed.'
      // oxlint-disable no-console
      console.error('Google sign in error:', err)
      // oxlint-enable no-console
      setAuthError(message)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Sign out was cancelled or failed.'
      // oxlint-disable no-console
      console.error('Sign out error:', err)
      // oxlint-enable no-console
    }
  }

  const untangleMutation = useMutation({
    mutationFn: ({ rawDump, energy }: { rawDump: string; energy: string }) =>
      untangleBrainDump(rawDump, energy),
    onSuccess: data => {
      setAiSummary(data.summary)
      const newTasks = data.tasks.map(t => ({
        ...t,
        userId: currentUser?.uid
      }))
      setTasks(prev => [...newTasks, ...prev])
      if (currentUser) {
        newTasks.forEach(t => saveTaskToFirestore(currentUser.uid, t))
      }
    },
    onError: (error: unknown) => {
      // oxlint-disable no-console
      console.error('Untangle failed:', error)
      // oxlint-enable no-console
    }
  })

  const handleUntangle = async (rawDump: string, energyPreference: string) => {
    await untangleMutation.mutateAsync({ rawDump, energy: energyPreference })
  }

  const handleToggleComplete = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) {
          return t
        }
        const updated: MicroTask = {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : undefined
        }
        if (currentUser) {
          saveTaskToFirestore(currentUser.uid, updated)
        }
        return updated
      })
    )
  }

  const handleToggleSubstep = (taskId: string, substepId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) {
          return t
        }
        const updatedSubsteps = t.substeps.map(sub =>
          sub.id === substepId ? { ...sub, completed: !sub.completed } : sub
        )
        const allCompleted = updatedSubsteps.every(s => s.completed)
        const updatedTask: MicroTask = {
          ...t,
          substeps: updatedSubsteps,
          completed: allCompleted ? true : t.completed
        }
        if (currentUser) {
          saveTaskToFirestore(currentUser.uid, updatedTask)
        }
        return updatedTask
      })
    )
  }

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    if (currentUser) {
      deleteTaskFromFirestore(currentUser.uid, id)
    }
  }

  const handleUpdateTask = (updated: MicroTask) => {
    setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)))
    if (currentUser) {
      saveTaskToFirestore(currentUser.uid, updated)
    }
  }

  const handleAddTask = (
    newTask: Omit<MicroTask, 'id' | 'createdAt' | 'completed'>
  ) => {
    const created: MicroTask = {
      ...newTask,
      id: `task_${Date.now()}`,
      userId: currentUser?.uid,
      createdAt: new Date().toISOString(),
      completed: false
    }
    setTasks(prev => [created, ...prev])
    if (currentUser) {
      saveTaskToFirestore(currentUser.uid, created)
    }
  }

  const handleClearCompleted = () => {
    const completedTasks = tasks.filter(t => t.completed)
    setTasks(prev => prev.filter(t => !t.completed))
    if (currentUser) {
      completedTasks.forEach(t =>
        deleteTaskFromFirestore(currentUser.uid, t.id)
      )
    }
  }

  const handleAddParkingLotItem = (text: string) => {
    const item: ParkingLotItem = {
      id: `parking_${Date.now()}`,
      userId: currentUser?.uid,
      text,
      createdAt: new Date().toISOString()
    }
    setParkingLot(prev => [item, ...prev])
    if (currentUser) {
      saveParkingItemToFirestore(currentUser.uid, item)
    }
  }

  const handleDeleteParkingLotItem = (id: string) => {
    setParkingLot(prev => prev.filter(p => p.id !== id))
    if (currentUser) {
      deleteParkingItemFromFirestore(currentUser.uid, id)
    }
  }

  const handleResetToSeed = async () => {
    const ok = await confirmResetToSeed()
    if (!ok) {
      return
    }
    setTasks(INITIAL_SEED_TASKS)
    setAiSummary(null)
    if (currentUser) {
      INITIAL_SEED_TASKS.forEach(t =>
        saveTaskToFirestore(currentUser.uid, {
          ...t,
          userId: currentUser.uid
        })
      )
    }
  }

  const activeCount = tasks.filter(t => !t.completed).length
  const workCount = tasks.filter(
    t => t.category.toLowerCase().includes('work') && !t.completed
  ).length
  const healthCount = tasks.filter(
    t => t.category.toLowerCase().includes('health') && !t.completed
  ).length

  const navButton = (view: ActiveView, label: string) => (
    <Pressable key={view} onPress={() => setActiveView(view)}>
      <Text
        className={`text-xs font-medium ${
          activeView === view ? 'text-amber-400 underline' : 'text-neutral-400'
        }`}>
        {label}
      </Text>
    </Pressable>
  )

  return (
    <View className="flex-1 bg-neutral-950">
      <View className="border-b border-neutral-800/80 bg-neutral-950/90 px-4 sm:px-6 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-base sm:text-lg font-bold tracking-tight text-neutral-100">
            Untangle
          </Text>
          <Text className="text-xs text-neutral-500 hidden sm:flex">
            · ADHD Brain Dump & Priority Areas
          </Text>
        </View>

        <View className="hidden md:flex flex-row items-center gap-6">
          {navButton('all', 'Workspace')}
          {navButton('dump', 'Brain Dump')}
          {navButton('tasks', 'Micro-Tasks')}
          {navButton('momentum', 'Momentum Ledger')}
        </View>

        <View className="flex-row items-center gap-2">
          {currentUser ? (
            <View className="flex-row items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-1 pr-2">
              {currentUser.photoURL ? (
                <Image
                  source={{ uri: currentUser.photoURL }}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <View className="w-5 h-5 rounded-full bg-amber-400/20 items-center justify-center">
                  <Text className="text-[10px] font-bold text-amber-300">
                    {currentUser.displayName?.[0] ?? 'U'}
                  </Text>
                </View>
              )}
              <Text
                className="text-xs text-neutral-300 font-medium max-w-[100px]"
                numberOfLines={1}>
                {currentUser.displayName || currentUser.email}
              </Text>
              <Pressable onPress={handleSignOut} accessibilityLabel="Sign out">
                <LogOut size={14} color="#a3a3a3" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleGoogleSignIn}
              disabled={authLoading}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 flex-row items-center gap-1.5">
              <LogIn size={14} color="#fbbf24" />
              <Text className="text-xs text-neutral-200">Google Sign-In</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => setIsUnstickOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-400 flex-row items-center gap-1.5">
            <Zap size={14} color="#0a0a0a" />
            <Text className="text-xs font-semibold text-neutral-950">
              Unstick Me
            </Text>
          </Pressable>

          <Pressable
            onPress={handleResetToSeed}
            accessibilityLabel="Reset sample tasks"
            className="p-1.5 rounded-lg">
            <RotateCcw size={16} color="#737373" />
          </Pressable>
        </View>
      </View>

      {authError ? (
        <View className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2 flex-row items-center justify-between">
          <Text className="text-xs text-rose-300 flex-1">{authError}</Text>
          <Pressable onPress={() => setAuthError(null)}>
            <Text className="text-xs text-rose-400 underline">Dismiss</Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        <View className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 gap-6">
          <View className="relative rounded-2xl overflow-hidden border border-neutral-800/80 bg-neutral-900/50 p-6 md:p-8 flex-col md:flex-row gap-6">
            <Image
              source={calmAmbientImg}
              className="absolute inset-0 w-full h-full opacity-20"
              resizeMode="cover"
            />
            <View className="relative z-10 max-w-xl gap-2">
              <View className="flex-row items-center gap-2">
                <Sparkles size={14} color="#fbbf24" />
                <Text className="text-xs text-amber-400 font-medium">
                  Priority Area Categorization & ADHD Flow
                </Text>
                {currentUser ? (
                  <Text className="text-[11px] text-emerald-400 font-mono ml-2">
                    {firestoreConnected ? 'Firestore Synced' : 'Sync pending'}
                  </Text>
                ) : null}
              </View>
              <Text className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-100">
                Organize chaotic thoughts across Work, Personal & Health.
              </Text>
              <Text className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                Input via voice with Gemini 3.5 Transcribe or type freely.
                Filter by priority areas, and slice intimidating goals into
                immediate physical first steps with brown noise.
              </Text>
            </View>

            <View className="relative z-10 flex-row items-center gap-3 bg-neutral-950/80 border border-neutral-800/80 p-3 rounded-xl self-start">
              <View className="items-center px-2">
                <Text className="text-lg font-bold text-neutral-100 font-mono">
                  {activeCount}
                </Text>
                <Text className="text-[10px] text-neutral-500">
                  Active Tasks
                </Text>
              </View>
              <Text className="text-neutral-700">|</Text>
              <View className="items-center px-2">
                <Text className="text-lg font-bold text-amber-400 font-mono">
                  {workCount}
                </Text>
                <Text className="text-[10px] text-neutral-500">Work</Text>
              </View>
              <Text className="text-neutral-700">|</Text>
              <View className="items-center px-2">
                <Text className="text-lg font-bold text-emerald-400 font-mono">
                  {healthCount}
                </Text>
                <Text className="text-[10px] text-neutral-500">Health</Text>
              </View>
            </View>
          </View>

          {aiSummary ? (
            <View className="p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl flex-row items-start gap-3">
              <Sparkles size={16} color="#fbbf24" />
              <View className="flex-1">
                <Text className="font-semibold text-amber-300 text-xs">
                  Untangled Rationale:
                </Text>
                <Text className="text-xs text-amber-200 mt-0.5 leading-relaxed">
                  {aiSummary}
                </Text>
              </View>
              <Pressable onPress={() => setAiSummary(null)}>
                <Text className="text-xs text-amber-400/60">Dismiss</Text>
              </Pressable>
            </View>
          ) : null}

          {activeView === 'all' || activeView === 'dump' ? (
            <BrainDumpInput
              onUntangle={handleUntangle}
              isLoading={untangleMutation.isPending}
            />
          ) : null}

          {activeView === 'all' || activeView === 'tasks' ? (
            <TaskList
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onToggleSubstep={handleToggleSubstep}
              onDelete={handleDeleteTask}
              onStartFocus={task => setFocusTask(task)}
              onUpdateTask={handleUpdateTask}
              onAddTask={handleAddTask}
              onClearCompleted={handleClearCompleted}
              onOpenUnstick={() => setIsUnstickOpen(true)}
            />
          ) : null}

          {activeView === 'all' || activeView === 'momentum' ? (
            <DopamineTracker tasks={tasks} />
          ) : null}
        </View>

        <View className="border-t border-neutral-900 py-6 px-4 sm:px-6">
          <View className="max-w-6xl mx-auto flex-col sm:flex-row items-center justify-between gap-3">
            <Text className="text-xs text-neutral-500">
              Untangle · Powered by Gemini · Firebase Firestore Cloud Sync
            </Text>
            <Pressable onPress={() => setIsUnstickOpen(true)}>
              <Text className="text-xs text-neutral-500">
                Unstick Assistant
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {focusTask ? (
        <FocusRadarModal
          task={focusTask}
          isOpen={Boolean(focusTask)}
          onClose={() => setFocusTask(null)}
          onCompleteTask={taskId => {
            handleToggleComplete(taskId)
            setFocusTask(null)
          }}
          parkingLot={parkingLot}
          onAddParkingLotItem={handleAddParkingLotItem}
          onDeleteParkingLotItem={handleDeleteParkingLotItem}
        />
      ) : null}

      <UnstickMeModal
        isOpen={isUnstickOpen}
        onClose={() => setIsUnstickOpen(false)}
        tasks={tasks}
        onStartFocus={task => {
          setFocusTask(task)
          setIsUnstickOpen(false)
        }}
      />
    </View>
  )
}
