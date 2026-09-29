import React, { useEffect, useRef, useState } from "react"
import { Text } from "react-native"
import { Redirect, Stack, useRouter } from "expo-router"
import { Screen } from "../../components/screen/screen"
import { StatusBanner } from "../../components/status-banner/status-banner"
import { useAppState } from "../../hooks/app-context"
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
  const view = useTaskView(app.tasks)
  const [returning, setReturning] = useState(false)
  const returningCaptured = useRef(false)

  useEffect(() => {
    if (!app.tasksReady || returningCaptured.current) return
    returningCaptured.current = true
    setReturning(app.tasks.some((task) => !task.completed))
  }, [app.tasks, app.tasksReady])

  if (app.onboardingComplete === null) return null
  if (!app.onboardingComplete) return <Redirect href="/onboarding" />

  const untangling = dump.status.state === "untangling"
  const hasTasks = app.tasks.length > 0

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
