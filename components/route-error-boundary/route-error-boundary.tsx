import React from "react"
import { Text, View } from "react-native"
import colors from "../../theme/colors"
import { CircleAlert } from "../../theme/icons"
import { Button } from "../button/button"
import { Screen } from "../screen/screen"

interface RouteErrorBoundaryProps {
  error: Error
  retry: () => void
}

// Exported from each route file as `ErrorBoundary`; Expo Router calls it with the thrown
// error and a retry that re-renders the route, so one broken screen never takes the app down.
export function RouteErrorBoundary({ error, retry }: RouteErrorBoundaryProps) {
  return (
    <Screen>
      <View className="items-center gap-3 py-16">
        <CircleAlert size={28} color={colors["danger-text"]} accessible={false} />
        <Text className="text-title2 font-bold text-text-primary" accessibilityRole="header">
          This screen stopped working
        </Text>
        <Text className="text-body text-text-secondary text-center">
          Try again. If it keeps happening, restart the app — your tasks are saved on this device.
        </Text>
        <Text className="text-footnote text-text-tertiary" numberOfLines={2}>
          {error.message}
        </Text>
        <Button label="Try again" size="lg" onPress={retry} className="mt-2" />
      </View>
    </Screen>
  )
}
