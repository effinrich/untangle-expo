import React from "react"
import { Text, View } from "react-native"
import { Check, Pause, Play } from "../../../theme/icons"
import { Button } from "../../../components/button/button"
import { useAccessibleAnnouncement } from "../../../hooks/use-accessible-announcement"
import { formatTimer, spokenTime } from "../utils"

interface FocusTimerProps {
  secondsRemaining: number
  totalSeconds: number
  isRunning: boolean
  onToggleRunning: () => void
  onComplete: () => void
}

export function FocusTimer({
  secondsRemaining,
  totalSeconds,
  isRunning,
  onToggleRunning,
  onComplete,
}: FocusTimerProps) {
  const timeUp = secondsRemaining <= 0
  const progress = totalSeconds > 0 ? 1 - secondsRemaining / totalSeconds : 1
  const status = timeUp ? "Time's up. Nice work." : isRunning ? "Focusing" : "Paused"
  useAccessibleAnnouncement(status)

  return (
    <View className="gap-6">
      <View className="items-center gap-2">
        <Text
          accessibilityRole="timer"
          accessibilityLabel={spokenTime(secondsRemaining)}
          maxFontSizeMultiplier={1.5}
          adjustsFontSizeToFit
          numberOfLines={1}
          className="text-display font-bold text-text-primary"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {formatTimer(Math.max(secondsRemaining, 0))}
        </Text>
        <Text className="text-callout text-text-secondary" accessibilityLiveRegion="polite">
          {status}
        </Text>
        <View className="w-full h-2 rounded-full bg-raised overflow-hidden" accessible={false}>
          <View className="h-full bg-accent" style={{ width: `${Math.round(progress * 100)}%` }} />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {!timeUp ? (
          <Button
            label={isRunning ? "Pause" : "Resume"}
            icon={isRunning ? Pause : Play}
            variant="secondary"
            size="lg"
            onPress={onToggleRunning}
            className="flex-1 min-w-[140px]"
          />
        ) : null}
        <Button
          label="Mark done"
          accessibilityHint="Completes this step and closes focus"
          icon={Check}
          variant="success"
          size="lg"
          onPress={onComplete}
          className="flex-1 min-w-[140px]"
        />
      </View>
    </View>
  )
}
