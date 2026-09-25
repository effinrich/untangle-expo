import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import {
  Sparkles,
  Zap,
  Layers,
  RotateCcw,
  CheckCircle2,
  ListTodo,
  BrainCircuit,
  Flame,
  LogIn,
  LogOut,
  User as UserIcon,
  Cloud,
  CloudCheck,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { BrainDumpInput } from './features/braindump/BrainDumpInput';
import { TaskList } from './features/tasks/TaskList';
import { FocusRadarModal } from './features/focus/FocusRadarModal';
import { UnstickMeModal } from './features/unstick/UnstickMeModal';
import { DopamineTracker } from './features/stats/DopamineTracker';
import { INITIAL_SEED_TASKS } from './data/seedData';
import { DEFAULT_CATEGORIES } from './data/categories';
import { MicroTask, ParkingLotItem } from './types';
import { apiUntangleBrainDump } from './services/api';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  testFirestoreConnection,
  subscribeToUserTasks,
  saveTaskToFirestore,
  deleteTaskFromFirestore,
  subscribeToParkingLot,
  saveParkingItemToFirestore,
  deleteParkingItemFromFirestore,
} from './services/firebase';
import calmAmbientImg from './assets/images/calm_focus_ambient_1790313003505.jpg';

const queryClient = new QueryClient();

function TangleApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [firestoreConnected, setFirestoreConnected] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState<MicroTask[]>(() => {
    try {
      const saved = localStorage.getItem('tangle_tasks_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved tasks', e);
    }
    return INITIAL_SEED_TASKS;
  });

  // Parking lot state
  const [parkingLot, setParkingLot] = useState<ParkingLotItem[]>(() => {
    try {
      const saved = localStorage.getItem('tangle_parking_lot_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved parking lot', e);
    }
    return [];
  });

  const [focusTask, setFocusTask] = useState<MicroTask | null>(null);
  const [isUnstickOpen, setIsUnstickOpen] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'dump' | 'tasks' | 'momentum'>('all');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Test Firestore connection on boot (required by Firebase integration skill)
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setFirestoreConnected(connected);
    });
  }, []);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // When user is authenticated, listen to real-time Firestore collections
  useEffect(() => {
    if (!currentUser) return;

    // Migrate any local tasks to Firestore if user just logged in
    const localTasksJson = localStorage.getItem('tangle_tasks_v1');
    if (localTasksJson) {
      try {
        const localTasks: MicroTask[] = JSON.parse(localTasksJson);
        localTasks.forEach((t) => {
          saveTaskToFirestore(currentUser.uid, { ...t, userId: currentUser.uid });
        });
      } catch (e) {
        // ignore
      }
    }

    // Subscribe to Firestore tasks
    const unsubTasks = subscribeToUserTasks(
      currentUser.uid,
      (remoteTasks) => {
        if (remoteTasks.length > 0) {
          setTasks(remoteTasks);
        }
      },
      (err) => console.error('Tasks sync error:', err)
    );

    // Subscribe to Firestore parking lot
    const unsubParking = subscribeToParkingLot(currentUser.uid, (remoteItems) => {
      if (remoteItems.length > 0) {
        setParkingLot(remoteItems);
      }
    });

    return () => {
      unsubTasks();
      unsubParking();
    };
  }, [currentUser]);

  // Sync tasks to localStorage for offline / guest access
  useEffect(() => {
    try {
      localStorage.setItem('tangle_tasks_v1', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  // Sync parking lot to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tangle_parking_lot_v1', JSON.stringify(parkingLot));
    } catch (e) {
      console.error(e);
    }
  }, [parkingLot]);

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setAuthError(err?.message || 'Google sign-in was cancelled or failed.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Untangle Mutation via TanStack Query
  const untangleMutation = useMutation({
    mutationFn: ({ rawDump, energy }: { rawDump: string; energy: string }) =>
      apiUntangleBrainDump(rawDump, energy),
    onSuccess: (data) => {
      setAiSummary(data.summary);
      const newTasks = data.tasks.map((t) => ({
        ...t,
        userId: currentUser?.uid,
      }));
      setTasks((prev) => [...newTasks, ...prev]);

      // If signed in, persist to Firestore
      if (currentUser) {
        newTasks.forEach((t) => saveTaskToFirestore(currentUser.uid, t));
      }
    },
    onError: (error: any) => {
      console.error('Untangle failed:', error);
    },
  });

  const handleUntangle = async (rawDump: string, energyPreference: string) => {
    await untangleMutation.mutateAsync({ rawDump, energy: energyPreference });
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated: MicroTask = {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? new Date().toISOString() : undefined,
          };
          if (currentUser) {
            saveTaskToFirestore(currentUser.uid, updated);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const handleToggleSubstep = (taskId: string, substepId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubsteps = t.substeps.map((sub) =>
          sub.id === substepId ? { ...sub, completed: !sub.completed } : sub
        );
        const allCompleted = updatedSubsteps.every((s) => s.completed);
        const updatedTask: MicroTask = {
          ...t,
          substeps: updatedSubsteps,
          completed: allCompleted ? true : t.completed,
        };
        if (currentUser) {
          saveTaskToFirestore(currentUser.uid, updatedTask);
        }
        return updatedTask;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (currentUser) {
      deleteTaskFromFirestore(currentUser.uid, id);
    }
  };

  const handleUpdateTask = (updated: MicroTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (currentUser) {
      saveTaskToFirestore(currentUser.uid, updated);
    }
  };

  const handleAddTask = (newTask: Omit<MicroTask, 'id' | 'createdAt' | 'completed'>) => {
    const created: MicroTask = {
      ...newTask,
      id: `task_${Date.now()}`,
      userId: currentUser?.uid,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setTasks((prev) => [created, ...prev]);
    if (currentUser) {
      saveTaskToFirestore(currentUser.uid, created);
    }
  };

  const handleClearCompleted = () => {
    const completedTasks = tasks.filter((t) => t.completed);
    setTasks((prev) => prev.filter((t) => !t.completed));
    if (currentUser) {
      completedTasks.forEach((t) => deleteTaskFromFirestore(currentUser.uid, t.id));
    }
  };

  const handleAddParkingLotItem = (text: string) => {
    const item: ParkingLotItem = {
      id: `parking_${Date.now()}`,
      userId: currentUser?.uid,
      text,
      createdAt: new Date().toISOString(),
    };
    setParkingLot((prev) => [item, ...prev]);
    if (currentUser) {
      saveParkingItemToFirestore(currentUser.uid, item);
    }
  };

  const handleDeleteParkingLotItem = (id: string) => {
    setParkingLot((prev) => prev.filter((p) => p.id !== id));
    if (currentUser) {
      deleteParkingItemFromFirestore(currentUser.uid, id);
    }
  };

  const handleResetToSeed = () => {
    if (confirm('Load fresh sample ADHD tasks with priority categories?')) {
      setTasks(INITIAL_SEED_TASKS);
      setAiSummary(null);
      if (currentUser) {
        INITIAL_SEED_TASKS.forEach((t) =>
          saveTaskToFirestore(currentUser.uid, { ...t, userId: currentUser.uid })
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* 2. Top Bar Contract: Zone 1 (Brand) - Zone 2 (Nav Links) - Zone 3 (Auth & Actions) */}
      <header className="sticky top-0 z-40 bg-neutral-950/90 border-b border-neutral-800/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-100 select-none">
              Tangle
            </span>
            <span className="text-xs text-neutral-500 font-normal hidden sm:inline">
              · ADHD Brain Dump & Priority Areas
            </span>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
            <button
              onClick={() => setActiveView('all')}
              className={`hover:text-neutral-100 transition-colors ${
                activeView === 'all' ? 'text-amber-400 underline underline-offset-4' : ''
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => setActiveView('dump')}
              className={`hover:text-neutral-100 transition-colors ${
                activeView === 'dump' ? 'text-amber-400 underline underline-offset-4' : ''
              }`}
            >
              Brain Dump
            </button>
            <button
              onClick={() => setActiveView('tasks')}
              className={`hover:text-neutral-100 transition-colors ${
                activeView === 'tasks' ? 'text-amber-400 underline underline-offset-4' : ''
              }`}
            >
              Micro-Tasks
            </button>
            <button
              onClick={() => setActiveView('momentum')}
              className={`hover:text-neutral-100 transition-colors ${
                activeView === 'momentum' ? 'text-amber-400 underline underline-offset-4' : ''
              }`}
            >
              Momentum Ledger
            </button>
          </nav>

          {/* Zone 3: Auth & Primary Action */}
          <div className="flex items-center gap-2.5">
            {/* Firebase Auth User Status / Sign-In Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-1 pr-2 text-xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <span className="text-neutral-300 font-medium hidden sm:inline max-w-[100px] truncate">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-neutral-500 hover:text-rose-400 transition-colors ml-1 p-0.5"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-200 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                title="Sign in with Google to sync to Firestore"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Sign-In</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsUnstickOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 text-neutral-950 hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-neutral-950" />
              <span>Unstick Me</span>
            </button>

            <button
              type="button"
              onClick={handleResetToSeed}
              className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors rounded-lg hover:bg-neutral-900"
              title="Reset sample tasks"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Auth Error Banner if present */}
      {authError && (
        <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2 text-xs text-rose-300 flex items-center justify-between">
          <span>{authError}</span>
          <button
            type="button"
            onClick={() => setAuthError(null)}
            className="text-rose-400 hover:text-rose-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Subtle Ambient Focus Header Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800/80 bg-neutral-900/50 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img
              src={calmAmbientImg}
              alt="Calm ambient focus art"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Priority Area Categorization & ADHD Flow</span>
              {currentUser && (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Firestore Synced
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-100 text-balance">
              Organize chaotic thoughts across Work, Personal & Health.
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-2 leading-relaxed">
              Input via voice with Gemini 3.5 Transcribe or type freely. Filter by priority areas,
              and slice intimidating goals into immediate physical first steps with brown noise.
            </p>
          </div>

          {/* Quick Stats Pill Replacement */}
          <div className="relative z-10 flex items-center gap-3 text-xs text-neutral-400 self-stretch md:self-auto bg-neutral-950/80 border border-neutral-800/80 p-3 rounded-xl font-mono tabular-nums">
            <div className="text-center px-2">
              <span className="block text-lg font-bold text-neutral-100">
                {tasks.filter((t) => !t.completed).length}
              </span>
              <span className="text-[10px] text-neutral-500 font-sans">Active Tasks</span>
            </div>
            <span aria-hidden="true" className="text-neutral-700">|</span>
            <div className="text-center px-2">
              <span className="block text-lg font-bold text-amber-400">
                {tasks.filter((t) => t.category.toLowerCase().includes('work') && !t.completed).length}
              </span>
              <span className="text-[10px] text-neutral-500 font-sans">Work</span>
            </div>
            <span aria-hidden="true" className="text-neutral-700">|</span>
            <div className="text-center px-2">
              <span className="block text-lg font-bold text-emerald-400">
                {tasks.filter((t) => t.category.toLowerCase().includes('health') && !t.completed).length}
              </span>
              <span className="text-[10px] text-neutral-500 font-sans">Health</span>
            </div>
          </div>
        </div>

        {/* AI Validation Summary if just untangled */}
        {aiSummary && (
          <div className="p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl text-xs text-amber-200 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-amber-300">Untangled Rationale:</span>
              <p className="mt-0.5 leading-relaxed">{aiSummary}</p>
            </div>
            <button
              type="button"
              onClick={() => setAiSummary(null)}
              className="text-amber-400/60 hover:text-amber-300 text-xs shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Section Layout based on active view */}
        {(activeView === 'all' || activeView === 'dump') && (
          <section id="braindump-section">
            <BrainDumpInput
              onUntangle={handleUntangle}
              isLoading={untangleMutation.isPending}
            />
          </section>
        )}

        {(activeView === 'all' || activeView === 'tasks') && (
          <section id="tasks-section" className="space-y-4">
            <TaskList
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onToggleSubstep={handleToggleSubstep}
              onDelete={handleDeleteTask}
              onStartFocus={(task) => setFocusTask(task)}
              onUpdateTask={handleUpdateTask}
              onAddTask={handleAddTask}
              onClearCompleted={handleClearCompleted}
              onOpenUnstick={() => setIsUnstickOpen(true)}
            />
          </section>
        )}

        {(activeView === 'all' || activeView === 'momentum') && (
          <section id="momentum-section">
            <DopamineTracker tasks={tasks} />
          </section>
        )}
      </main>

      {/* Focus Radar Modal ("One Thing Mode") */}
      {focusTask && (
        <FocusRadarModal
          task={focusTask}
          isOpen={!!focusTask}
          onClose={() => setFocusTask(null)}
          onCompleteTask={(taskId) => {
            handleToggleComplete(taskId);
            setFocusTask(null);
          }}
          parkingLot={parkingLot}
          onAddParkingLotItem={handleAddParkingLotItem}
          onDeleteParkingLotItem={handleDeleteParkingLotItem}
        />
      )}

      {/* Unstick Me Decision Assistant Modal */}
      <UnstickMeModal
        isOpen={isUnstickOpen}
        onClose={() => setIsUnstickOpen(false)}
        tasks={tasks}
        onStartFocus={(task) => {
          setFocusTask(task);
          setIsUnstickOpen(false);
        }}
      />

      {/* Clean Footer */}
      <footer className="border-t border-neutral-900 py-6 text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Tangle · Powered by Gemini 3.8 Flash & Gemini 3.5 Transcribe</span>
            <span aria-hidden="true">·</span>
            <span className="text-neutral-400">Firebase Firestore Cloud Sync</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsUnstickOpen(true)}
              className="hover:text-neutral-300 transition-colors"
            >
              Unstick Assistant
            </button>
            <span aria-hidden="true">·</span>
            <span>Zero Guilt Guarantee</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TangleApp />
    </QueryClientProvider>
  );
}
