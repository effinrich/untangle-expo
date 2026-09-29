import React from "react"
import { Pressable, Text, View } from "react-native"
import { ChevronRight, Zap } from "../../../theme/icons"
import colors from "../../../theme/colors"

interface MainStuckCardProps {
  onPress: () => void
}

export function MainStuckCard({ onPress }: MainStuckCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Stuck? Let Untangle pick your easiest step"
      className="min-h-cta flex-row items-center gap-3 p-4 rounded-2xl bg-accent-muted border border-accent active:opacity-80"
    >
      <Zap size={22} color={colors["accent-text"]} accessible={false} />
      <View className="flex-1">
        <Text className="text-callout font-semibold text-text-primary">Stuck?</Text>
        <Text className="text-subhead text-accent-text">Let Untangle pick your easiest step</Text>
      </View>
      <ChevronRight size={20} color={colors["accent-text"]} accessible={false} />
    </Pressable>
  )
}
