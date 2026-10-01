import React, { useState } from "react"
import { useBrainDump } from "./hooks"
import { BrainDumpAreaFilter } from "./partials/brain-dump-area-filter"
import { BrainDumpAudioStatus } from "./partials/brain-dump-audio-status"
import { BrainDumpEnergyControl } from "./partials/brain-dump-energy-control"
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
  const [isFocused, setIsFocused] = useState(false)

  // Collapsed to a single row until someone actually wants it. That keeps the
  // composer above the list, so an untangle result lands below where the eye
  // already is, without the composer eating the whole first screen.
  const expanded = isFocused || !!dump.text.trim()

  // Blur bubbles from every child, so only collapse when focus has left the
  // composer entirely, not when it moves to one of the controls.
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocused(false)
  }

  return (
    <div className="w-full" onFocus={() => setIsFocused(true)} onBlur={handleBlur}>
      <BrainDumpHeader />

      <form onSubmit={dump.handleSubmit} className="mt-4">
        <div className="relative rounded-md border border-neutral-800 bg-neutral-950 focus-within:border-neutral-600 transition-colors">
          <textarea
            value={dump.text}
            onChange={(e) => dump.editText(e.target.value)}
            aria-label="Brain dump"
            placeholder="Whatever is in your head, in any order."
            rows={expanded ? 4 : 1}
            className={`w-full bg-transparent p-4 pr-16 text-base text-neutral-200 placeholder-neutral-500 leading-relaxed ${
              expanded ? "min-h-[110px] resize-y" : "min-h-11"
            }`}
          />
          <BrainDumpVoiceButton
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            recordingSeconds={recordingSeconds}
            onStart={startRecording}
            onStop={stopRecording}
          />
        </div>

        {expanded && (
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <BrainDumpEnergyControl
              energyPreference={dump.energyPreference}
              onChange={dump.setEnergyPreference}
            />
            <BrainDumpAreaFilter
              selectedFocusCategory={dump.selectedFocusCategory}
              onSelectCategory={dump.setSelectedFocusCategory}
              hasText={!!dump.text}
              onClear={dump.clearText}
            />
            <BrainDumpSparks
              activeTemplate={dump.activeTemplate}
              onApplyTemplate={dump.applyTemplate}
            />
          </div>
        )}

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
