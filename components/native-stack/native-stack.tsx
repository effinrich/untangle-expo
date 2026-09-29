import React from "react"
import { Stack } from "expo-router"
import colors from "../../theme/colors"

export function NativeStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.canvas },
        headerTintColor: colors["text-primary"],
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.canvas },
        animation: "default",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Untangle",
          headerLargeTitle: true,
          headerLargeStyle: { backgroundColor: colors.canvas },
          headerLargeTitleShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, gestureEnabled: false, animation: "fade" }}
      />
      <Stack.Screen
        name="focus"
        options={{
          title: "Focus",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="unstick"
        options={{
          title: "Get unstuck",
          presentation: "modal",
        }}
      />
    </Stack>
  )
}
