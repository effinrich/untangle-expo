import React from "react"
import { View } from "react-native"

interface OnboardingDotsProps {
  count: number
  index: number
}

export function OnboardingDots({ count, index }: OnboardingDotsProps) {
  return (
    <View
      accessible
      accessibilityLabel={`Page ${index + 1} of ${count}`}
      className="flex-row justify-center gap-2 py-2"
    >
      {Array.from({ length: count }, (_, dot) => (
        <View
          key={dot}
          className={`h-2 rounded-full ${dot === index ? "w-6 bg-accent" : "w-2 bg-border-control"}`}
        />
      ))}
    </View>
  )
}
