import { useEffect, useRef, useState } from "react"
import { Platform } from "react-native"
import * as Notifications from "expo-notifications"
import * as Haptics from "../../utils/haptics"
import { parseFocusSeconds } from "./utils"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

// Countdown plus a local push notification scheduled for when the sprint ends
export function useFocusTimer(title: string | undefined, minutes: string | undefined) {
  const notificationIdRef = useRef<string | null>(null)

  useEffect(() => {
    ;(async () => {
      if (Platform.OS !== "web") {
        const { status } = await Notifications.getPermissionsAsync()
        if (status !== "granted") {
          await Notifications.requestPermissionsAsync()
        }
      }
    })()
    return () => {
      // Cleanup notification on unmount
      if (notificationIdRef.current) {
        Notifications.cancelScheduledNotificationAsync(notificationIdRef.current)
      }
    }
  }, [])

  const [secondsRemaining, setSecondsRemaining] = useState(parseFocusSeconds(minutes))
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    // Handle local push notification scheduling
    const scheduleNotification = async () => {
      if (Platform.OS === "web") return
      if (isRunning && secondsRemaining > 0) {
        if (notificationIdRef.current) {
          await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current)
        }
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time is up! ⚡",
            body: `Your focus sprint "${title}" is complete. Claim your dopamine!`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsRemaining,
          },
        })
        notificationIdRef.current = id
      } else {
        if (notificationIdRef.current) {
          await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current)
          notificationIdRef.current = null
        }
      }
    }
    scheduleNotification()
  }, [isRunning, secondsRemaining, title])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1)
      }, 1000)
    } else if (secondsRemaining === 0) {
      setIsRunning(false)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, secondsRemaining])

  const toggleRunning = () => {
    setIsRunning(!isRunning)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  return { secondsRemaining, isRunning, toggleRunning }
}

export function useParkingLot() {
  const [parkingThought, setParkingThought] = useState("")
  const [parkingLot, setParkingLot] = useState<string[]>([])

  const parkThought = () => {
    if (!parkingThought.trim()) return
    setParkingLot((prev) => [parkingThought.trim(), ...prev])
    setParkingThought("")
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  return { parkingThought, setParkingThought, parkingLot, parkThought }
}
