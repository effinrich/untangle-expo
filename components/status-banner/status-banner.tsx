import React from "react"
import { Pressable, Text, View } from "react-native"
import { CircleAlert, WifiOff } from "../../theme/icons"
import colors from "../../theme/colors"

interface StatusBannerProps {
  title: string
  message: string
  tone?: "error" | "offline"
  actionLabel?: string
  onAction?: () => void
}

export function StatusBanner({
  title,
  message,
  tone = "error",
  actionLabel,
  onAction,
}: StatusBannerProps) {
  const Icon = tone === "offline" ? WifiOff : CircleAlert

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      className="flex-row gap-3 p-4 rounded-2xl bg-danger-muted border border-danger"
    >
      <Icon size={22} color={colors["danger-text"]} accessible={false} />
      <View className="flex-1 gap-1">
        <Text className="text-callout font-semibold text-text-primary">{title}</Text>
        <Text className="text-subhead text-danger-text">{message}</Text>
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            hitSlop={8}
            className="self-start min-h-touch justify-center active:opacity-70"
          >
            <Text className="text-callout font-semibold text-text-primary underline">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}
