import React from "react"
import { ScrollView, Text, View } from "react-native"
import type { LucideIcon } from "lucide-react-native"
import colors from "../../../theme/colors"

interface OnboardingPageProps {
  icon: LucideIcon
  title: string
  body: string
  width: number
  active: boolean
}

export function OnboardingPage({ icon: Icon, title, body, width, active }: OnboardingPageProps) {
  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24, gap: 24 }}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
    >
      <View
        accessible={false}
        className="w-28 h-28 rounded-full bg-accent-muted border border-accent items-center justify-center self-center"
      >
        <Icon size={52} color={colors["accent-text"]} />
      </View>
      <View className="gap-3">
        <Text
          accessibilityRole="header"
          className="text-title1 font-bold text-text-primary text-center"
        >
          {title}
        </Text>
        <Text className="text-body text-text-secondary text-center">{body}</Text>
      </View>
    </ScrollView>
  )
}
