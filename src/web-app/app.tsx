import { useEffect, useRef, useState } from "react"
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
import { AppUndoBar } from "./partials/app-undo-bar"
import { AppWriteErrorBanner } from "./partials/app-write-error-banner"
import { FirstRunEntry } from "./partials/first-run-entry"
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
    restoreTask,
    updateTask,
    addTask,
    addUntangledTasks,
    clearCompleted,
    resetToSeed,
  } = useTasks(currentUser)
  const { parkingLot, parkingLotError, addParkingLotItem, deleteParkingLotItem } =
    useParkingLot(currentUser)
  const { aiSummary, untangleError, clearAiSummary, handleUntangle, isUntangling } = useUntangle(
    addUntangledTasks,
  )

  const [focusTask, setFocusTask] = useState<MicroTask | null>(null)
  const [isUnstickOpen, setIsUnstickOpen] = useState(false)
  const [activeView, setActiveView] = useState<ActiveView>("all")
  const [undo, setUndo] = useState<{ task: MicroTask; message: string } | null>(null)

  // A single delete is recoverable, so it gets undo rather than a confirm, and
  // the bar clears itself if the user moves on. Bulk delete keeps a confirm.
  useEffect(() => {
    if (!undo) return
    const timer = setTimeout(() => setUndo(null), 7000)
    return () => clearTimeout(timer)
  }, [undo])

  const handleDeleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    deleteTask(id)
    setUndo({ task, message: `Removed "${task.title}".` })
  }

  const handleClearCompleted = () => {
    if (!confirm("Delete every completed step? This cannot be undone.")) return
    clearCompleted()
  }

  const untangleResultRef = useRef<HTMLDivElement>(null)

  // A result that renders off-screen reads as nothing happening at all. The
  // composer sitting above the list is the real fix; this is the safety net for
  // anyone scrolled past it.
  useEffect(() => {
    if (!aiSummary) return
    untangleResultRef.current?.scrollIntoView({ block: "nearest" })
  }, [aiSummary])

  const handleResetToSeed = () => {
    if (!confirm(RESET_TO_SEED_PROMPT)) return
    resetToSeed()
    clearAiSummary()
  }

  const hasTasks = tasks.length > 0

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

        {/* The composer is the entry point, so it sits above the list: untangle
            results then appear below where you are looking, instead of above
            your viewport. It stays collapsed to one row so the list still owns
            the first screen. The ledger is a footnote. */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-9 space-y-9">
          {/* Nothing to count yet, so the status readout would just say zero.
              A first-run visitor gets the context instead; everyone else gets
              the instrument with no pitch in front of it. */}
          {hasTasks ? (
            <AppStatusLine tasks={tasks} isSynced={!!currentUser} />
          ) : (
            <FirstRunEntry />
          )}

          {/* Stable live region. Its text changes when a dump is untangled, so
              the result is announced without moving focus. <output> carries
              role="status" natively, so no ARIA is needed. */}
          <output className="sr-only">{aiSummary ?? ""}</output>

          {(activeView === "all" || activeView === "dump") && (
            <section id="braindump-section" className="space-y-4">
              {untangleError && (
                <p
                  role="alert"
                  className="rounded-md border border-rose-500/40 bg-rose-950/40 p-3 text-sm text-rose-300"
                >
                  {untangleError}
                </p>
              )}
              <ErrorBoundary>
                <BrainDumpInput onUntangle={handleUntangle} isLoading={isUntangling} />
              </ErrorBoundary>
            </section>
          )}

          {/* The result belongs to the composer, so it hides with the composer
              rather than lingering over a view that did not produce it. */}
          {(activeView === "all" || activeView === "dump") && aiSummary && (
            <div ref={untangleResultRef}>
              <UntangleSummary summary={aiSummary} onDismiss={clearAiSummary} />
            </div>
          )}

          {hasTasks && (activeView === "all" || activeView === "tasks") && (
            <section id="tasks-section" className="space-y-4">
              <ErrorBoundary>
                <TaskList
                  tasks={tasks}
                  onToggleComplete={toggleComplete}
                  onToggleSubstep={toggleSubstep}
                  onDelete={handleDeleteTask}
                  onStartFocus={(task) => setFocusTask(task)}
                  onUpdateTask={updateTask}
                  onAddTask={addTask}
                  onClearCompleted={handleClearCompleted}
                  onOpenUnstick={() => setIsUnstickOpen(true)}
                />
              </ErrorBoundary>
            </section>
          )}

          {hasTasks && (activeView === "all" || activeView === "momentum") && (
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
              parkingLotError={parkingLotError}
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

        {undo && (
          <AppUndoBar
            message={undo.message}
            onUndo={() => {
              restoreTask(undo.task)
              setUndo(null)
            }}
            onDismiss={() => setUndo(null)}
          />
        )}

        <AppFooter onOpenUnstick={() => setIsUnstickOpen(true)} />
      </ErrorBoundary>
    </div>
  )
}
