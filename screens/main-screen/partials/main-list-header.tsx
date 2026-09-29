import React from "react"
import { Pressable, Text, View } from "react-native"
import { SlidersHorizontal } from "../../../theme/icons"
import colors from "../../../theme/colors"

interface MainListHeaderProps {
  count: number
  summary: string
  onOpenSheet: () => void
}

export function MainListHeader({ count, summary, onOpenSheet }: MainListHeaderProps) {
  return (
    <View className="gap-2">
      <Text className="text-title3 font-bold text-text-primary" accessibilityRole="header">
        Next steps{count > 0 ? ` (${count})` : ""}
      </Text>
      <Pressable
        onPress={onOpenSheet}
        accessibilityRole="button"
        accessibilityLabel={`Sort and filter. Currently ${summary}`}
        className="min-h-control flex-row items-center gap-2 self-start px-4 rounded-full bg-raised border border-border-control active:opacity-80"
      >
        <SlidersHorizontal size={18} color={colors["text-primary"]} accessible={false} />
        <Text className="text-subhead font-medium text-text-primary shrink">{summary}</Text>
      </Pressable>
    </View>
  )
}
