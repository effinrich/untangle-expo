import React from "react"
import { Loader2 } from "lucide-react"

interface BrainDumpAudioStatusProps {
  isRecording: boolean
  isTranscribing: boolean
  recordingSeconds: number
  audioError: string | null
  onStop: () => void
}

// Audio recording / transcription status banners
export const BrainDumpAudioStatus: React.FC<BrainDumpAudioStatusProps> = ({
  isRecording,
  isTranscribing,
  recordingSeconds,
  audioError,
  onStop,
}) => {
  return (
    <>
      {isRecording && (
        <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping motion-reduce:animate-none" />
            <span>Recording audio... Speak naturally. Tap microphone when done to transcribe.</span>
          </div>
          <button
            type="button"
            onClick={onStop}
            className="px-2 py-0.5 bg-rose-500 text-white rounded font-medium text-[11px]"
          >
            Finish ({recordingSeconds}s)
          </button>
        </div>
      )}

      {isTranscribing && (
        <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-xs text-amber-300">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Transcribing audio with Gemini 3.5 Transcribe model...</span>
        </div>
      )}

      {audioError && (
        <div className="mt-2 p-2 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-300">
          {audioError}
        </div>
      )}
    </>
  )
}
