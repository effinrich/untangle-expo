import React from "react"
import { Text, View } from "react-native"
import { Stack, useRouter } from "expo-router"
import { Play, RotateCcw, Sparkles } from "../../theme/icons"
import { Button } from "../../components/button/button"
import { OptionRow } from "../../components/option-row/option-row"
import { Screen } from "../../components/screen/screen"
import { StatusBanner } from "../../components/status-banner/status-banner"
import { useOpenTasks } from "../../hooks/use-live-data"
import { focusHref } from "../../utils/focus-href"
import { MOODS, SPARK_MINUTES } from "./consts"
import { useUnstick } from "./hooks"
import { UnstickResultCard } from "./partials/unstick-result-card"

export default function UnstickScreen() {
  const router = useRouter()
  const openTasks = useOpenTasks()
  const unstick = useUnstick(openTasks)

  const closeButton = () => <Button label="Close" variant="ghost" onPress={() => router.back()} />

  if (openTasks.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerRight: closeButton }} />
        <Screen>
          <Text className="text-title2 font-bold text-text-primary">Nothing to pick from yet</Text>
          <Text className="text-body text-text-secondary">
            Do a quick brain dump first. Then Untangle can pick the easiest step for you.
          </Text>
          <Button label="Back to brain dump" size="lg" onPress={() => router.back()} />
        </Screen>
      </>
    )
  }

  const footer = unstick.result ? (
    <>
      <Button
        label="Start 2-minute spark"
        icon={Play}
        size="lg"
        disabled={!unstick.chosenTask}
        onPress={() =>
          unstick.chosenTask &&
          router.replace(focusHref(unstick.chosenTask.id, SPARK_MINUTES))
        }
      />
      <Button label="Pick again" icon={RotateCcw} variant="ghost" onPress={unstick.reset} />
    </>
  ) : (
    <Button
      label="Pick my easiest step"
      loadingLabel="Picking…"
      icon={Sparkles}
      size="lg"
      loading={unstick.loading}
      onPress={unstick.pick}
    />
  )

  return (
    <>
      <Stack.Screen options={{ headerRight: closeButton }} />
      <Screen footer={footer}>
        {unstick.result ? (
          <UnstickResultCard result={unstick.result} task={unstick.chosenTask} />
        ) : (
          <>
            <View className="gap-2">
              <Text className="text-title2 font-bold text-text-primary" accessibilityRole="header">
                Let Untangle decide
              </Text>
              <Text className="text-body text-text-secondary">
                Deciding burns energy you don’t have right now. Tell us how your brain feels and
                we’ll pick the lowest-effort way in.
              </Text>
            </View>

            <View className="gap-3" accessibilityRole="radiogroup" accessibilityLabel="How does your brain feel right now?">
              <Text className="text-callout font-semibold text-text-primary">
                How does your brain feel right now?
              </Text>
              {MOODS.map((mood) => (
                <OptionRow
                  key={mood.id}
                  label={mood.label}
                  description={mood.description}
                  selected={unstick.moodId === mood.id}
                  onSelect={() => unstick.selectMood(mood.id)}
                />
              ))}
            </View>

            {unstick.error ? (
              <StatusBanner title="Couldn't pick a step" message={unstick.error} />
            ) : null}
          </>
        )}
      </Screen>
    </>
  )
}
