import React from "react"
import { View, Text, Pressable, ScrollView } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as Haptics from "../../utils/haptics"
import { useFocusTimer, useParkingLot } from "./hooks"
import { FocusParkingLot } from "./partials/focus-parking-lot"
import { FocusTimer } from "./partials/focus-timer"

export default function Focus() {
  const router = useRouter()
  const { title, firstStep, minutes } = useLocalSearchParams<{
    id: string
    title: string
    firstStep: string
    minutes: string
  }>()
  const { secondsRemaining, isRunning, toggleRunning } = useFocusTimer(title, minutes)
  const { parkingThought, setParkingThought, parkingLot, parkThought } = useParkingLot()

  const handleDone = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    router.back()
  }

  return (
    <ScrollView className="flex-1 bg-neutral-950 px-6 pt-12 pb-8">
      {/* Top Header */}
      <View className="flex-row items-center justify-between mb-8">
        <Text className="text-amber-400 font-bold text-xs uppercase tracking-wider">
          ⚡ ONE THING RADAR
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800"
        >
          <Text className="text-xs text-neutral-300">Exit</Text>
        </Pressable>
      </View>

      {/* Task Heading */}
      <Text className="text-2xl font-extrabold text-neutral-100 text-center leading-tight mb-4">
        {title || "Current Micro-Action"}
      </Text>

      {/* The Physical Trigger Spark */}
      <View className="bg-neutral-900/90 p-4 rounded-2xl border border-amber-500/30 mb-8">
        <Text className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
          First Physical Action:
        </Text>
        <Text className="text-sm font-medium text-neutral-200 leading-relaxed">
          {firstStep || "Open the app or document"}
        </Text>
      </View>

      <FocusTimer
        secondsRemaining={secondsRemaining}
        isRunning={isRunning}
        onToggleRunning={toggleRunning}
        onDone={handleDone}
      />

      <FocusParkingLot
        parkingThought={parkingThought}
        onChangeThought={setParkingThought}
        parkingLot={parkingLot}
        onParkThought={parkThought}
      />
    </ScrollView>
  )
}
