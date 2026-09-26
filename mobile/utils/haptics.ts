import { Platform } from "react-native"
import * as ExpoHaptics from "expo-haptics"

export { ImpactFeedbackStyle, NotificationFeedbackType } from "expo-haptics"

export const impactAsync = async (
  style: ExpoHaptics.ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle.Medium,
): Promise<void> => {
  if (Platform.OS === "web") return
  try {
    await ExpoHaptics.impactAsync(style)
  } catch (error) {
    console.warn("Haptics impactAsync error:", error)
  }
}

export const notificationAsync = async (
  type: ExpoHaptics.NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType.Success,
): Promise<void> => {
  if (Platform.OS === "web") return
  try {
    await ExpoHaptics.notificationAsync(type)
  } catch (error) {
    console.warn("Haptics notificationAsync error:", error)
  }
}

export const selectionAsync = async (): Promise<void> => {
  if (Platform.OS === "web") return
  try {
    await ExpoHaptics.selectionAsync()
  } catch (error) {
    console.warn("Haptics selectionAsync error:", error)
  }
}
