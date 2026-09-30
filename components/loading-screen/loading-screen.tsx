import React from "react"
import { ActivityIndicator, View } from "react-native"
import colors from "../../theme/colors"

// Minimal boot placeholder for the window after the splash is force-hidden but before
// the onboarding flag or the collections are ready. Says "loading", never "empty".
export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  )
}
