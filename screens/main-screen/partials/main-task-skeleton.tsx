import React, { useEffect } from "react"
import { Text, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { useAccessibleAnnouncement } from "../../../hooks/use-accessible-announcement"
import { SKELETON_ROWS } from "../consts"

export function MainTaskSkeleton() {
  const reduceMotion = useReducedMotion()
  const opacity = useSharedValue(1)
  useAccessibleAnnouncement("Untangling your thoughts")

  useEffect(() => {
    if (!reduceMotion) opacity.set(withRepeat(withTiming(0.45, { duration: 700 }), -1, true))
  }, [reduceMotion, opacity])

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.get() }))

  return (
    <View className="gap-3" accessibilityLiveRegion="polite">
      <Text className="text-subhead text-text-secondary">Untangling your thoughts…</Text>
      {SKELETON_ROWS.map((row) => (
        <Animated.View
          key={row}
          accessible={false}
          style={pulse}
          className="p-4 rounded-2xl bg-surface gap-3"
        >
          <View className="h-5 w-3/4 rounded-md bg-raised" />
          <View className="h-4 w-1/2 rounded-md bg-raised" />
          <View className="h-12 rounded-xl bg-raised" />
        </Animated.View>
      ))}
    </View>
  )
}
