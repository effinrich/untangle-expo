import React from "react"
import { Text, View } from "react-native"
import { MicroTask, UnstickResult } from "../../../services/api"

interface UnstickResultCardProps {
  result: UnstickResult
  task?: MicroTask
}

export function UnstickResultCard({ result, task }: UnstickResultCardProps) {
  return (
    <View className="gap-4">
      <View className="p-4 rounded-2xl bg-surface gap-2" accessible>
        <Text className="text-footnote font-semibold text-text-secondary">Your easiest step</Text>
        <Text className="text-title3 font-bold text-text-primary">
          {task?.title ?? "Pick any small step"}
        </Text>
        <Text className="text-callout text-text-secondary">{result.reasoning}</Text>
      </View>
      <View className="p-4 rounded-2xl bg-accent-muted border border-accent gap-2" accessible>
        <Text className="text-footnote font-semibold text-accent-text">
          The 2-minute spark
        </Text>
        <Text className="text-body text-text-primary">{result.sparkChallenge}</Text>
      </View>
    </View>
  )
}
