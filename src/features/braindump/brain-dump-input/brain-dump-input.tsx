import React from "react"
import { useBrainDump } from "./hooks"
import { BrainDumpAreaFilter } from "./partials/brain-dump-area-filter"
import { BrainDumpAudioStatus } from "./partials/brain-dump-audio-status"
import { BrainDumpFooter } from "./partials/brain-dump-footer"
import { BrainDumpHeader } from "./partials/brain-dump-header"
import { BrainDumpSparks } from "./partials/brain-dump-sparks"
import { BrainDumpVoiceButton } from "./partials/brain-dump-voice-button"
import { BrainDumpInputProps } from "./types"
import { countWords } from "./utils"

export const BrainDumpInput: React.FC<BrainDumpInputProps> = ({ onUntangle, isLoading }) => {
  const dump = useBrainDump({ onUntangle, isLoading })
  const { isRecording, isTranscribing, recordingSeconds, startRecording, stopRecording } =
    dump.recorder

  return (
    <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 md:p-6 backdrop-blur-sm shadow-xl">
      <BrainDumpHeader
        energyPreference={dump.energyPreference}
        onChangeEnergy={dump.setEnergyPreference}
      />

      <BrainDumpAreaFilter
        selectedFocusCategory={dump.selectedFocusCategory}
        onSelectCategory={dump.setSelectedFocusCategory}
        hasText={!!dump.text}
        onClear={dump.clearText}
      />

      <BrainDumpSparks activeTemplate={dump.activeTemplate} onApplyTemplate={dump.applyTemplate} />

      {/* Input Textarea & Voice Button */}
      <form onSubmit={dump.handleSubmit} className="relative">
        <div className="relative rounded-lg border border-neutral-800 bg-neutral-950/90 focus-within:border-amber-500/50 transition-colors">
          <label htmlFor="brain-dump-text" className="sr-only">
            Brain dump
          </label>
          <textarea
            id="brain-dump-text"
            value={dump.text}
            onChange={(e) => dump.editText(e.target.value)}
            placeholder="What's floating in your head right now? e.g. Need to pay the electric bill before Friday, cat needs medication, finish the budget report for Sarah, clean the laundry mountain off the chair..."
            rows={4}
            className="w-full bg-transparent p-4 pr-16 text-base text-neutral-200 placeholder-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 resize-y min-h-[110px] leading-relaxed"
          />

          <BrainDumpVoiceButton
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            recordingSeconds={recordingSeconds}
            onStart={startRecording}
            onStop={stopRecording}
          />
        </div>

        <BrainDumpAudioStatus
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          recordingSeconds={recordingSeconds}
          audioError={dump.audioError}
          onStop={stopRecording}
        />

        <BrainDumpFooter
          wordCount={countWords(dump.text)}
          isRecording={isRecording}
          isLoading={isLoading}
          canSubmit={!!dump.text.trim() && !isLoading}
        />
      </form>
    </div>
  )
}
