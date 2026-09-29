import React from "react"
import { ActivityIndicator, Pressable, Text } from "react-native"
import colors from "../../theme/colors"
import {
  CONTAINER_CLASSES,
  DISABLED_CONTAINER,
  DISABLED_LABEL,
  ICON_COLORS,
  LABEL_CLASSES,
  LABEL_SIZE_CLASSES,
  SIZE_CLASSES,
} from "./consts"
import { ButtonProps } from "./types"

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  loadingLabel,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  className = "",
}: ButtonProps) {
  const inactive = disabled || loading
  const iconColor = disabled ? colors["text-tertiary"] : ICON_COLORS[variant]
  const shownLabel = loading && loadingLabel ? loadingLabel : label

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? shownLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      className={`flex-row items-center justify-center gap-2 active:opacity-80 ${SIZE_CLASSES[size]} ${
        disabled ? DISABLED_CONTAINER : CONTAINER_CLASSES[variant]
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        Icon && <Icon size={20} color={iconColor} accessible={false} />
      )}
      <Text
        className={`font-semibold text-center ${LABEL_SIZE_CLASSES[size]} ${
          disabled ? DISABLED_LABEL : LABEL_CLASSES[variant]
        }`}
      >
        {shownLabel}
      </Text>
    </Pressable>
  )
}
