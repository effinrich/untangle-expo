import React from "react"
import { Text, View } from "react-native"
import { ListTodo } from "../../../theme/icons"
import { Button } from "../../../components/button/button"
import colors from "../../../theme/colors"

interface MainEmptyStateProps {
  onTryExample: () => void
}

export function MainEmptyState({ onTryExample }: MainEmptyStateProps) {
  return (
    <View className="items-center gap-3 px-4 py-8 rounded-2xl border border-dashed border-border-control">
      <ListTodo size={40} color={colors["accent-text"]} accessible={false} />
      <Text className="text-body font-semibold text-text-primary text-center">
        Nothing on your plate yet
      </Text>
      <Text className="text-subhead text-text-secondary text-center">
        Write or say what’s swirling around. Untangle breaks it into steps you can start in under 2
        minutes.
      </Text>
      <Button
        label="Try an example"
        variant="ghost"
        onPress={onTryExample}
        accessibilityHint="Fills the brain dump box with sample thoughts"
      />
    </View>
  )
}
