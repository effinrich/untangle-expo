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
  const secondsRemainingRef = useRef(parseFocusSeconds(minutes))

  const [secondsRemaining, setSecondsRemaining] = useState(parseFocusSeconds(minutes))
  const [isRunning, setIsRunning] = useState(true)
  useEffect(() => {
    secondsRemainingRef.current = secondsRemaining
  }, [secondsRemaining])

  useEffect(() => {
    let cancelled = false

    const updateScheduledNotification = async () => {
      if (Platform.OS === "web") return

      if (!isRunning) {
        if (secondsRemainingRef.current > 0 && notificationIdRef.current) {
          await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current)
        }
        notificationIdRef.current = null
        return
      }

      if (notificationIdRef.current) {
        await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current)
      }
      if (cancelled || secondsRemainingRef.current <= 0) return

      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      const status =
        existingStatus === "granted"
          ? existingStatus
          : (await Notifications.requestPermissionsAsync()).status
      if (cancelled || status !== "granted") return

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time is up! ⚡",
          body: `Your focus sprint "${title}" is complete. Claim your dopamine!`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsRemainingRef.current,
        },
      })
      if (cancelled) {
        await Notifications.cancelScheduledNotificationAsync(notificationId)
        return
      }
      notificationIdRef.current = notificationId
    }

    updateScheduledNotification().catch((error) => {
      console.error("Failed to update focus notification:", error)
    })

    return () => {
      cancelled = true
    }
  }, [isRunning, title])

  useEffect(() => {
    return () => {
      if (notificationIdRef.current) {
        Notifications.cancelScheduledNotificationAsync(notificationIdRef.current).catch((error) => {
          console.error("Failed to cancel focus notification:", error)
        })
      }
    }
  }, [])

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
