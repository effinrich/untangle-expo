import React, { useState } from "react"
import { Text, View } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Button } from "../../components/button/button"
import { Screen } from "../../components/screen/screen"
import { useAppState } from "../../hooks/app-context"
import * as Haptics from "../../utils/haptics"
import { useFocusTimer } from "./hooks"
import { FocusParkingLot } from "./partials/focus-parking-lot"
import { FocusTimer } from "./partials/focus-timer"
import { parseFocusSeconds } from "./utils"

export default function Focus() {
  const router = useRouter()
  const { id, minutes } = useLocalSearchParams<{ id: string; minutes?: string }>()
  const { tasks, setCompleted, thoughts, parkThought, removeThought } = useAppState()
  const task = tasks.find((t) => t.id === id)
  const sprintMinutes = minutes ?? String(task?.estimatedMinutes ?? 10)
  const { secondsRemaining, isRunning, toggleRunning } = useFocusTimer(task?.title, sprintMinutes)
  const [draft, setDraft] = useState("")

  const complete = () => {
    if (task) setCompleted(task.id, true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    router.back()
  }

  const park = () => {
    if (!draft.trim()) return
    parkThought(draft)
    setDraft("")
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <Button label="Close" variant="ghost" onPress={() => router.back()} />,
        }}
      />
      <Screen>
        <View className="gap-3">
          <Text className="text-title2 font-bold text-text-primary" accessibilityRole="header">
            {task?.title ?? "Your next step"}
          </Text>
          {task ? (
            <View className="p-4 rounded-2xl bg-raised gap-1">
              <Text className="text-footnote font-semibold text-accent-text">First step</Text>
              <Text className="text-body text-text-primary">{task.firstPhysicalStep}</Text>
            </View>
          ) : null}
        </View>

        <FocusTimer
          secondsRemaining={secondsRemaining}
          totalSeconds={parseFocusSeconds(sprintMinutes)}
          isRunning={isRunning}
          onToggleRunning={toggleRunning}
          onComplete={complete}
        />

        <FocusParkingLot
          draft={draft}
          onChangeDraft={setDraft}
          thoughts={thoughts}
          onPark={park}
          onRemove={removeThought}
        />
      </Screen>
    </>
  )
}
