import React from "react"
import { View, Text, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { MicroTask } from "../../../services/api"
import { TaskCardMobile } from "../../../components/task-card-mobile"

interface MainTaskListProps {
  tasks: MicroTask[]
  onToggleComplete: (id: string) => void
}

export function MainTaskList({ tasks, onToggleComplete }: MainTaskListProps) {
  const router = useRouter()

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-bold text-neutral-100">Action Steps ({tasks.length})</Text>
        <Pressable
          onPress={() => router.push("/unstick")}
          className="bg-amber-400/20 border border-amber-400/40 px-2.5 py-1 rounded-lg"
        >
          <Text className="text-xs font-bold text-amber-300">⚡ Unstick Me</Text>
        </Pressable>
      </View>

      {tasks.map((task) => (
        <TaskCardMobile
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onStartFocus={(t) =>
            router.push({
              pathname: "/focus",
              params: {
                id: t.id,
                title: t.title,
                firstStep: t.firstPhysicalStep,
                minutes: String(t.estimatedMinutes),
              },
            })
          }
        />
      ))}
    </View>
  )
}
