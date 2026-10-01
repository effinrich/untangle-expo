import React from "react"
import { Pressable, Text, View } from "react-native"
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated"
import { ChevronDown, ChevronUp } from "../../../theme/icons"
import { MicroTask } from "../../../services/api"
import { TaskCardMobile } from "../../../components/task-card-mobile"
import colors from "../../../theme/colors"

interface MainTaskListProps {
  openTasks: MicroTask[]
  doneTasks: MicroTask[]
  showDone: boolean
  onToggleDone: () => void
  onSetCompleted: (id: string, completed: boolean) => void
  onStartFocus: (task: MicroTask) => void
  onDelete: (id: string) => void
}

export function MainTaskList({
  openTasks,
  doneTasks,
  showDone,
  onToggleDone,
  onSetCompleted,
  onStartFocus,
  onDelete,
}: MainTaskListProps) {
  const DoneChevron = showDone ? ChevronUp : ChevronDown

  return (
    <View className="gap-3">
      {openTasks.length === 0 ? (
        <Text className="px-4 py-6 text-center text-callout text-text-secondary">
          {doneTasks.length > 0
            ? "Everything in this view is done. Nice."
            : "No steps match this view. Try a different sort or area."}
        </Text>
      ) : (
        openTasks.map((task, index) => (
          <Animated.View
            key={task.id}
            entering={FadeInDown.delay(Math.min(index, 5) * 40)}
            exiting={FadeOut}
            layout={LinearTransition}
          >
            <TaskCardMobile
              task={task}
              onSetCompleted={onSetCompleted}
              onStartFocus={onStartFocus}
              onDelete={onDelete}
            />
          </Animated.View>
        ))
      )}

      {doneTasks.length > 0 ? (
        <Pressable
          onPress={onToggleDone}
          accessibilityRole="button"
          accessibilityLabel={`Done, ${doneTasks.length} ${doneTasks.length === 1 ? "step" : "steps"}`}
          accessibilityState={{ expanded: showDone }}
          className="min-h-control flex-row items-center justify-between px-1 active:opacity-70"
        >
          <Text className="text-callout font-semibold text-text-secondary">
            Done ({doneTasks.length})
          </Text>
          <DoneChevron size={20} color={colors["text-secondary"]} accessible={false} />
        </Pressable>
      ) : null}

      {showDone
        ? doneTasks.map((task) => (
            <Animated.View key={task.id} entering={FadeIn} layout={LinearTransition}>
              <TaskCardMobile
                task={task}
                onSetCompleted={onSetCompleted}
                onStartFocus={onStartFocus}
                onDelete={onDelete}
              />
            </Animated.View>
          ))
        : null}
    </View>
  )
}
