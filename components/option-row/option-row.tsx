import React from "react"
import { Pressable, Text, View } from "react-native"
import { Check } from "../../theme/icons"
import colors from "../../theme/colors"

interface OptionRowProps {
  label: string
  description?: string
  selected: boolean
  onSelect: () => void
  role?: "radio" | "checkbox"
}

export function OptionRow({
  label,
  description,
  selected,
  onSelect,
  role = "radio",
}: OptionRowProps) {
  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole={role}
      accessibilityLabel={description ? `${label}. ${description}` : label}
      accessibilityState={{ checked: selected, selected }}
      className={`min-h-cta flex-row items-center gap-3 px-4 py-3 rounded-2xl active:opacity-80 ${
        selected ? "bg-accent-muted border-2 border-accent" : "bg-raised border border-border-control"
      }`}
    >
      <View
        accessible={false}
        className={`w-6 h-6 items-center justify-center ${role === "radio" ? "rounded-full" : "rounded-md"} ${
          selected ? "bg-accent" : "border-2 border-border-field"
        }`}
      >
        {selected && <Check size={16} color={colors["on-accent"]} strokeWidth={3} />}
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          className={`text-body font-medium ${selected ? "text-accent-text" : "text-text-primary"}`}
        >
          {label}
        </Text>
        {description ? (
          <Text className="text-footnote text-text-secondary">{description}</Text>
        ) : null}
      </View>
    </Pressable>
  )
}
