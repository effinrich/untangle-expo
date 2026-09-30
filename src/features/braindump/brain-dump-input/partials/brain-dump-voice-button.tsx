import React from "react"
import { Loader2, Mic, MicOff } from "lucide-react"

interface BrainDumpVoiceButtonProps {
  isRecording: boolean
  isTranscribing: boolean
  recordingSeconds: number
  onStart: () => void
  onStop: () => void
}

// Voice dictation button with Gemini 3.5 Transcribe
export const BrainDumpVoiceButton: React.FC<BrainDumpVoiceButtonProps> = ({
  isRecording,
  isTranscribing,
  recordingSeconds,
  onStart,
  onStop,
}) => {
  return (
    <div className="absolute right-3 bottom-3 flex items-center gap-2">
      {isRecording && (
        <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 animate-pulse motion-reduce:animate-none">
          {recordingSeconds}s rec
        </span>
      )}
      <button
        type="button"
        onClick={isRecording ? onStop : onStart}
        disabled={isTranscribing}
        className={`p-2.5 rounded-lg border transition-all ${
          isRecording
            ? "bg-rose-500 text-white border-rose-400 animate-pulse motion-reduce:animate-none ring-2 ring-rose-400/40"
            : isTranscribing
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
        }`}
        title={
          isRecording
            ? "Click to stop and transcribe with gemini-3.5-transcribe"
            : "Record voice with gemini-3.5-transcribe audio"
        }
      >
        {isTranscribing ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
        ) : isRecording ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
