import React from "react"
import { ScrollView } from "react-native"
import { useBrainDumpPad, useGoogleAuth, useMainTasks, useTaskFilters } from "./hooks"
import { MainAuthHeader } from "./partials/main-auth-header"
import { MainBrainDumpPad } from "./partials/main-brain-dump-pad"
import { MainCategoryPills } from "./partials/main-category-pills"
import { MainEnergySortStrip } from "./partials/main-energy-sort-strip"
import { MainTaskList } from "./partials/main-task-list"

export default function MainScreen() {
  const { user, canSignIn, promptAsync } = useGoogleAuth()
  const { tasks, addUntangledTasks, toggleComplete } = useMainTasks(user)
  const pad = useBrainDumpPad(addUntangledTasks)
  const { selectedCategory, selectCategory, sortBy, selectSort, sortedTasks } =
    useTaskFilters(tasks)

  return (
    <ScrollView className="flex-1 bg-neutral-950 px-4 pt-3 pb-12">
      <MainAuthHeader user={user} canSignIn={canSignIn} onSignIn={() => promptAsync()} />

      <MainBrainDumpPad
        text={pad.brainDumpText}
        onChangeText={pad.setBrainDumpText}
        isRecording={pad.isRecording}
        isTranscribing={pad.isTranscribing}
        isUntangling={pad.isUntangling}
        onStartRecording={pad.startRecording}
        onStopRecording={pad.stopRecording}
        onUntangle={pad.handleUntangle}
      />

      <MainEnergySortStrip sortBy={sortBy} onSelectSort={selectSort} />

      <MainCategoryPills selectedCategory={selectedCategory} onSelectCategory={selectCategory} />

      <MainTaskList tasks={sortedTasks} onToggleComplete={toggleComplete} />
    </ScrollView>
  )
}
