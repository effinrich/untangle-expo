import { useEffect } from "react"
import { AccessibilityInfo, Platform } from "react-native"

// iOS ignores accessibilityLiveRegion, so the same message is announced explicitly.
export function useAccessibleAnnouncement(message: string) {
  useEffect(() => {
    if (!message || Platform.OS !== "ios") return
    AccessibilityInfo.announceForAccessibility(message)
  }, [message])
}
