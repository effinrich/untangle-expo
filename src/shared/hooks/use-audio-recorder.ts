import { useCallback, useRef, useState } from "react"
import { apiTranscribeAudio } from "../../services/api"

interface UseAudioRecorderOptions {
  onTranscription: (text: string) => void
  onError?: (err: string) => void
}

export function useAudioRecorder({ onTranscription, onError }: UseAudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone access is not supported in this browser.")
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []

      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : ""

      const options = mimeType ? { mimeType } : undefined
      const mediaRecorder = new MediaRecorder(stream, options)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Clean up tracks
        stream.getTracks().forEach((track) => track.stop())

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        })

        if (audioBlob.size === 0) {
          return
        }

        // Send to Gemini 3.5 Transcribe
        setIsTranscribing(true)
        try {
          const reader = new FileReader()
          reader.readAsDataURL(audioBlob)
          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result as string
              const data = await apiTranscribeAudio(base64Audio, audioBlob.type || "audio/webm")
              if (data.text) {
                onTranscription(data.text)
              }
            } catch (err) {
              console.error("Transcription error:", err)
              if (onError) onError((err instanceof Error && err.message) || "Transcription failed")
            } finally {
              setIsTranscribing(false)
            }
          }
        } catch (err) {
          setIsTranscribing(false)
          if (onError) onError((err instanceof Error && err.message) || "Error processing audio")
        }
      }

      mediaRecorder.start(250) // collect in 250ms chunks
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingSeconds(0)

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("Microphone error:", err)
      setIsRecording(false)
      if (onError) onError((err instanceof Error && err.message) || "Could not access microphone")
    }
  }, [onTranscription, onError])

  const stopRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }, [])

  return {
    isRecording,
    isTranscribing,
    recordingSeconds,
    startRecording,
    stopRecording,
  }
}
