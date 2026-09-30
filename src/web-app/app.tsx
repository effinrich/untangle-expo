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
import { ErrorBoundary } from "../shared/ui/error-boundary/error-boundary"
import { OverlayErrorFallback } from "../shared/ui/error-boundary/partials/overlay-error-fallback"
import { MicroTask } from "../types"
import { RESET_TO_SEED_PROMPT } from "./consts"
import { useAuth, useFirestoreConnectionTest } from "./hooks"
import { AppAuthErrorBanner } from "./partials/app-auth-error-banner"
import { AppFooter } from "./partials/app-footer"
import { AppHeader } from "./partials/app-header"
import { AppRootErrorFallback } from "./partials/app-root-error-fallback"
import { AppStatusLine } from "./partials/app-status-line"
import { AppWriteErrorBanner } from "./partials/app-write-error-banner"
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
    writeError,
    clearWriteError,
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
      <ErrorBoundary fallback={({ reset }) => <AppRootErrorFallback onRetry={reset} />}>
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

        {writeError && <AppWriteErrorBanner onDismiss={clearWriteError} />}

        {/* The list is the instrument, so it leads. The composer is a tool and
            the ledger is a footnote; neither earns a panel above the work. */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-9 space-y-9">
          <AppStatusLine tasks={tasks} isSynced={!!currentUser} />

          {aiSummary && <UntangleSummary summary={aiSummary} onDismiss={clearAiSummary} />}

          {(activeView === "all" || activeView === "tasks") && (
            <section id="tasks-section" className="space-y-4">
              <ErrorBoundary>
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
              </ErrorBoundary>
            </section>
          )}

          {(activeView === "all" || activeView === "dump") && (
            <section id="braindump-section">
              <ErrorBoundary>
                <BrainDumpInput onUntangle={handleUntangle} isLoading={isUntangling} />
              </ErrorBoundary>
            </section>
          )}

          {(activeView === "all" || activeView === "momentum") && (
            <section id="momentum-section">
              <ErrorBoundary>
                <DopamineTracker tasks={tasks} />
              </ErrorBoundary>
            </section>
          )}
        </main>

        {/* Focus Radar Modal ("One Thing Mode") */}
        {focusTask && (
          <ErrorBoundary
            fallback={() => <OverlayErrorFallback onClose={() => setFocusTask(null)} />}
          >
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
          </ErrorBoundary>
        )}

        {/* Unstick Me Decision Assistant Modal */}
        <ErrorBoundary
          fallback={() => <OverlayErrorFallback onClose={() => setIsUnstickOpen(false)} />}
          resetKeys={[isUnstickOpen]}
        >
          <UnstickMeModal
            isOpen={isUnstickOpen}
            onClose={() => setIsUnstickOpen(false)}
            tasks={tasks}
            onStartFocus={(task) => {
              setFocusTask(task)
              setIsUnstickOpen(false)
            }}
          />
        </ErrorBoundary>

        <AppFooter onOpenUnstick={() => setIsUnstickOpen(true)} />
      </ErrorBoundary>
    </div>
  )
}
