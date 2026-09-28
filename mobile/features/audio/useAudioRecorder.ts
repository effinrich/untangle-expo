import { useState, useCallback } from "react"
import { Platform } from "react-native"
import { Audio } from "expo-av"
import * as FileSystem from "expo-file-system"
import { transcribeAudio } from "../../services/api"

interface UseAudioRecorderOptions {
  onTranscription: (text: string) => void
  onError?: (err: string) => void
}

export function useAudioRecorder({ onTranscription, onError }: UseAudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(async () => {
    try {
      if (Platform.OS !== "web") {
        const permission = await Audio.requestPermissionsAsync()
        if (!permission.granted) {
          throw new Error("Microphone permission is .")
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        })
      }

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      )
      setRecording(newRecording)
      setIsRecording(true)
      setRecordingSeconds(0)

      const interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
      setTimerInterval(interval)
    } catch (err: unknown) {
      console.error("Microphone error:", err)
      setIsRecording(false)
      if (onError) {
        onError(
          err instanceof Error ? err.message : "Could not access microphone",
        )
      }
    }
  }, [onError])

  const stopRecording = useCallback(async () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    if (!recording) return
    setIsRecording(false)

    try {
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      setRecording(null)

      if (!uri) return

      setIsTranscribing(true)

      let base64Audio = ""
      let mimeType = "audio/m4a"

      if (Platform.OS === "web") {
        const res = await fetch(uri)
        const blob = await res.blob()
        mimeType = blob.type || "audio/webm"
        base64Audio = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result)
            } else {
              reject(new Error("Invalid read result"))
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } else {
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        })
        base64Audio = `data:audio/m4a;base64,${base64Data}`
      }

      const data = await transcribeAudio(base64Audio, mimeType)
      if (data.text) {
        onTranscription(data.text)
      }
    } catch (err: unknown) {
      console.error("Transcription error:", err)
      if (onError) {
        onError(
          err instanceof Error ? err.message : "Transcription failed",
        )
      }
    } finally {
      setIsTranscribing(false)
    }
  }, [recording, timerInterval, onTranscription, onError])

  return {
    isRecording,
    isTranscribing,
    recordingSeconds,
    startRecording,
    stopRecording,
  }
}
