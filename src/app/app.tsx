import { useState } from "react"
import { BrainDumpInput } from "../features/braindump/brain-dump-input/brain-dump-input"
import { useUntangle } from "../features/braindump/hooks"
import { UntangleSummary } from "../features/braindump/untangle-summary/untangle-summary"
import { TaskList } from "../features/tasks/task-list/task-list"
import { Focus } from "../features/focus/focus/focus"
import { UnstickMeModal } from "../features/unstick/unstick-me-modal/unstick-me-modal"
import { DopamineTracker } from "../features/stats/dopamine-tracker/dopamine-tracker"
import { useParkingLot } from "../shared/hooks/use-parking-lot"
import { useTasks } from "../shared/hooks/use-tasks"
import { MicroTask } from "../types"
import { RESET_TO_SEED_PROMPT } from "./consts"
import { useAuth, useFirestoreConnectionTest } from "./hooks"
import { AppAuthErrorBanner } from "./partials/app-auth-error-banner"
import { AppFooter } from "./partials/app-footer"
import { AppHeader } from "./partials/app-header"
import { AppHeroBanner } from "./partials/app-hero-banner"
import { ActiveView } from "./types"

export default function App() {
  useFirestoreConnectionTest()
  const {
    currentUser,
    authLoading,
    authError,
    dismissAuthError,
    handleGoogleSignIn,
    handleSignOut,
  } = useAuth()
  const {
    tasks,
    toggleComplete,
    toggleSubstep,
    deleteTask,
    updateTask,
    addTask,
    addUntangledTasks,
    clearCompleted,
    resetToSeed,
  } = useTasks(currentUser)
  const { parkingLot, addParkingLotItem, deleteParkingLotItem } = useParkingLot(currentUser)
  const { aiSummary, clearAiSummary, handleUntangle, isUntangling } = useUntangle(addUntangledTasks)

  const [focusTask, setFocusTask] = useState<MicroTask | null>(null)
  const [isUnstickOpen, setIsUnstickOpen] = useState(false)
  const [activeView, setActiveView] = useState<ActiveView>("all")

  const handleResetToSeed = () => {
    if (!confirm(RESET_TO_SEED_PROMPT)) return
    resetToSeed()
    clearAiSummary()
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      <AppHeader
        activeView={activeView}
        onChangeView={setActiveView}
        currentUser={currentUser}
        authLoading={authLoading}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onOpenUnstick={() => setIsUnstickOpen(true)}
        onResetToSeed={handleResetToSeed}
      />

      {authError && <AppAuthErrorBanner message={authError} onDismiss={dismissAuthError} />}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        <AppHeroBanner tasks={tasks} isSynced={!!currentUser} />

        {aiSummary && <UntangleSummary summary={aiSummary} onDismiss={clearAiSummary} />}

        {/* Dynamic Section Layout based on active view */}
        {(activeView === "all" || activeView === "dump") && (
          <section id="braindump-section">
            <BrainDumpInput onUntangle={handleUntangle} isLoading={isUntangling} />
          </section>
        )}

        {(activeView === "all" || activeView === "tasks") && (
          <section id="tasks-section" className="space-y-4">
            <TaskList
              tasks={tasks}
              onToggleComplete={toggleComplete}
              onToggleSubstep={toggleSubstep}
              onDelete={deleteTask}
              onStartFocus={(task) => setFocusTask(task)}
              onUpdateTask={updateTask}
              onAddTask={addTask}
              onClearCompleted={clearCompleted}
              onOpenUnstick={() => setIsUnstickOpen(true)}
            />
          </section>
        )}

        {(activeView === "all" || activeView === "momentum") && (
          <section id="momentum-section">
            <DopamineTracker tasks={tasks} />
          </section>
        )}
      </main>

      {/* Focus Radar Modal ("One Thing Mode") */}
      {focusTask && (
        <Focus
          task={focusTask}
          isOpen={!!focusTask}
          onClose={() => setFocusTask(null)}
          onCompleteTask={(taskId) => {
            toggleComplete(taskId)
            setFocusTask(null)
          }}
          parkingLot={parkingLot}
          onAddParkingLotItem={addParkingLotItem}
          onDeleteParkingLotItem={deleteParkingLotItem}
        />
      )}

      {/* Unstick Me Decision Assistant Modal */}
      <UnstickMeModal
        isOpen={isUnstickOpen}
        onClose={() => setIsUnstickOpen(false)}
        tasks={tasks}
        onStartFocus={(task) => {
          setFocusTask(task)
          setIsUnstickOpen(false)
        }}
      />

      <AppFooter onOpenUnstick={() => setIsUnstickOpen(true)} />
    </div>
  )
}
