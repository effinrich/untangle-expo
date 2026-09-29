import React from "react"
import { Alert, Pressable, Text, View } from "react-native"
import { Check, Play, Trash2 } from "../theme/icons"
import * as Haptics from "../utils/haptics"
import { MicroTask } from "../services/api"
import colors from "../theme/colors"
import { Button } from "./button/button"

interface TaskCardMobileProps {
  task: MicroTask
  onSetCompleted: (id: string, completed: boolean) => void
  onStartFocus: (task: MicroTask) => void
  onDelete: (id: string) => void
}

const ENERGY_LABEL = { low: "Low energy", medium: "Medium energy", high: "High energy" }
const ENERGY_DOT = { low: "bg-success", medium: "bg-accent", high: "bg-danger" }

export function TaskCardMobile({ task, onSetCompleted, onStartFocus, onDelete }: TaskCardMobileProps) {
  const meta = `${task.category} · ${ENERGY_LABEL[task.energyLevel]} · ${task.estimatedMinutes} min`

  const toggle = () => {
    if (!task.completed) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    else Haptics.selectionAsync()
    onSetCompleted(task.id, !task.completed)
  }

  const confirmDelete = () =>
    Alert.alert("Delete this step?", task.title, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(task.id) },
    ])

  return (
    <View className={`flex-row gap-2 p-3 rounded-2xl ${task.completed ? "bg-canvas border border-divider" : "bg-surface"}`}>
      <Pressable
        onPress={toggle}
        accessibilityRole="checkbox"
        accessibilityLabel={task.title}
        accessibilityHint={task.completed ? "Marks this step as not done" : "Marks this step as done"}
        accessibilityState={{ checked: task.completed }}
        className="w-11 h-11 items-center justify-center"
      >
        <View
          className={`w-7 h-7 rounded-lg items-center justify-center ${
            task.completed ? "bg-success" : "border-2 border-border-field"
          }`}
        >
          {task.completed && <Check size={18} color={colors["on-success"]} strokeWidth={3} />}
        </View>
      </Pressable>

      <View className="flex-1 gap-3 py-2 pr-1">
        <View
          accessible
          accessibilityLabel={
            task.completed ? `${task.title}, done` : `${meta}. First step: ${task.firstPhysicalStep}`
          }
          className="gap-1"
        >
          <Text
            className={`text-body font-semibold ${
              task.completed ? "text-text-tertiary line-through" : "text-text-primary"
            }`}
          >
            {task.title}
          </Text>
          {!task.completed && (
            <View className="flex-row items-center gap-2">
              <View className={`w-2 h-2 rounded-full ${ENERGY_DOT[task.energyLevel]}`} />
              <Text className="text-footnote text-text-secondary shrink" style={{ fontVariant: ["tabular-nums"] }}>
                {meta}
              </Text>
            </View>
          )}
          {!task.completed && (
            <View className="mt-2 p-3 rounded-xl bg-raised gap-1">
              <Text className="text-footnote font-semibold text-accent-text">First step</Text>
              <Text className="text-callout text-text-primary">{task.firstPhysicalStep}</Text>
            </View>
          )}
        </View>

        {!task.completed && (
          <Button
            label="Start focus"
            accessibilityLabel={`Start focus on ${task.title}`}
            icon={Play}
            variant="secondary"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              onStartFocus(task)
            }}
            className="self-start"
          />
        )}
      </View>

      <Pressable
        onPress={confirmDelete}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${task.title}`}
        className="w-11 h-11 items-center justify-center active:opacity-70"
      >
        <Trash2 size={18} color={colors["text-secondary"]} accessible={false} />
      </Pressable>
    </View>
  )
}
