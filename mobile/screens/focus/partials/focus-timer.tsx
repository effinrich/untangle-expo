import React from "react"
import { View, Text, Pressable } from "react-native"
import { formatTimer } from "../utils"

interface FocusTimerProps {
  secondsRemaining: number
  isRunning: boolean
  onToggleRunning: () => void
  onDone: () => void
}

export function FocusTimer({
  secondsRemaining,
  isRunning,
  onToggleRunning,
  onDone,
}: FocusTimerProps) {
  return (
    <>
      {/* Large Timer */}
      <View className="items-center my-6">
        <Text className="text-7xl font-mono font-extrabold text-neutral-100 tracking-tight">
          {formatTimer(secondsRemaining)}
        </Text>
        <Text className="text-xs text-neutral-500 mt-2">Zero distraction sprint</Text>
      </View>

      {/* Play / Pause */}
      <View className="flex-row justify-center gap-4 mb-8">
        <Pressable
          onPress={onToggleRunning}
          className="bg-neutral-900 border border-neutral-700 px-6 py-3 rounded-2xl"
        >
          <Text className="text-sm font-semibold text-neutral-200">
            {isRunning ? "Pause" : "Resume"}
          </Text>
        </Pressable>

        <Pressable
          onPress={onDone}
          className="bg-emerald-500 px-6 py-3 rounded-2xl active:scale-95"
        >
          <Text className="text-sm font-bold text-black">✓ Claim Dopamine</Text>
        </Pressable>
      </View>
    </>
  )
}
