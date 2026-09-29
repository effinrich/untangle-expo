import React, { useEffect, useRef, useState } from "react"
import { Text } from "react-native"
import { Redirect, Stack, useRouter } from "expo-router"
import { Screen } from "../../components/screen/screen"
import { StatusBanner } from "../../components/status-banner/status-banner"
import { useAppState } from "../../hooks/app-context"
import { useTasks } from "../../hooks/use-live-data"
import { EXAMPLE_DUMP } from "./consts"
import { useBrainDump, useTaskView } from "./hooks"
import { MainAccountButton } from "./partials/main-account-button"
import { MainComposer } from "./partials/main-composer"
import { MainEmptyState } from "./partials/main-empty-state"
import { MainFilterSheet } from "./partials/main-filter-sheet"
import { MainListHeader } from "./partials/main-list-header"
import { MainStuckCard } from "./partials/main-stuck-card"
import { MainTaskList } from "./partials/main-task-list"
import { MainTaskSkeleton } from "./partials/main-task-skeleton"
import { focusHref } from "../../utils/focus-href"
import { viewSummary } from "./utils"

export default function MainScreen() {
  const router = useRouter()
  const app = useAppState()
  const dump = useBrainDump(app.addTasks)
  const tasks = useTasks()
  const view = useTaskView(tasks)
  const [returning, setReturning] = useState(false)
  const returningCaptured = useRef(false)

  useEffect(() => {
    if (!app.dataReady || returningCaptured.current) return
    returningCaptured.current = true
    setReturning(tasks.some((task) => !task.completed))
  }, [tasks, app.dataReady])

  if (app.onboardingComplete === null) return null
  if (!app.onboardingComplete) return <Redirect href="/onboarding" />

  const untangling = dump.status.state === "untangling"
  const hasTasks = tasks.length > 0

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <MainAccountButton
              user={app.user}
              canSignIn={app.canSignIn}
              onSignIn={app.signIn}
              onSignOut={app.signOut}
              hasUnsyncedChanges={app.hasUnsyncedChanges}
            />
          ),
        }}
      />
      <Screen>
        {returning && view.openTasks.length > 0 ? (
          <Text className="text-callout text-text-secondary -mt-2">
            Welcome back. {view.openTasks.length} {view.openTasks.length === 1 ? "step is" : "steps are"}{" "}
            waiting when you’re ready.
          </Text>
        ) : null}

        {app.signInError ? (
          <StatusBanner title="Sign-in didn't work" message={app.signInError} />
        ) : null}

        {app.syncError ? (
          <StatusBanner
            title="A change didn't save"
            message={`It may have been undone, so check your tasks and try again. (${app.syncError})`}
            actionLabel="Dismiss"
            onAction={app.clearSyncError}
          />
        ) : null}

        <MainComposer
          inputRef={dump.inputRef}
          text={dump.text}
          onChangeText={dump.changeText}
          status={dump.status}
          emptyError={dump.emptyError}
          isRecording={dump.isRecording}
          isTranscribing={dump.isTranscribing}
          onStartRecording={dump.startRecording}
          onStopRecording={dump.stopRecording}
          onSubmit={dump.submit}
        />

        {hasTasks ? (
          <MainListHeader
            count={view.openTasks.length}
            summary={viewSummary(view.sortBy, view.area)}
            onOpenSheet={view.openSheet}
          />
        ) : null}

        {untangling ? <MainTaskSkeleton /> : null}

        {!hasTasks && !untangling ? (
          <MainEmptyState onTryExample={() => dump.fillExample(EXAMPLE_DUMP)} />
        ) : null}

        {view.openTasks.length > 1 ? (
          <MainStuckCard onPress={() => router.push("/unstick")} />
        ) : null}

        <MainTaskList
          openTasks={view.openTasks}
          doneTasks={view.doneTasks}
          showDone={view.showDone}
          onToggleDone={view.toggleDone}
          onSetCompleted={app.setCompleted}
          onStartFocus={(task) => router.push(focusHref(task.id))}
          onDelete={app.deleteTask}
        />
      </Screen>

      <MainFilterSheet
        visible={view.sheetOpen}
        onClose={view.closeSheet}
        sortBy={view.sortBy}
        onSelectSort={view.selectSort}
        area={view.area}
        areas={view.areas}
        onSelectArea={view.selectArea}
      />
    </>
  )
}
