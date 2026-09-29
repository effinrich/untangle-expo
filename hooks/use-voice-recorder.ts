import { useState } from "react"
import { Alert } from "react-native"
import { Audio } from "expo-av"
import * as Haptics from "../utils/haptics"
import { readAudioAsBase64 } from "../utils/audio"
import { transcribeAudio } from "../services/api"

export function useVoiceRecorder(onTranscribed: (text: string) => void) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState<Audio.Recording | null>(null)

  // Start Audio Recording with expo-av
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync()
      if (!permission.granted) {
        Alert.alert("Microphone Needed", "Permission is required to dictate your brain dump.")
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      )
      setRecording(newRecording)
      setIsRecording(true)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch (err: unknown) {
      console.error("Failed to start recording", err)
    }
  }

  // Stop Recording and Transcribe via Gemini 3.5 Transcribe
  const stopRecording = async () => {
    if (!recording) return
    setIsRecording(false)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    try {
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      if (!uri) return

      setIsTranscribing(true)
      const base64Audio = await readAudioAsBase64(uri)

      const response = await transcribeAudio(base64Audio, "audio/m4a")
      if (response && response.text) {
        onTranscribed(response.text)
      }
      setRecording(null)
    } catch (err) {
      console.error("Failed to transcribe", err)
      Alert.alert("Transcription Error", "Could not process audio.")
    } finally {
      setIsTranscribing(false)
    }
  }

  return { isRecording, isTranscribing, startRecording, stopRecording }
}
