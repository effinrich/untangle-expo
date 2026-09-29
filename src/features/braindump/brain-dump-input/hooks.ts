import React, { useState } from "react"
import { EnergyLevel } from "../../../types"
import { useAudioRecorder } from "../../../shared/hooks/use-audio-recorder"
import { ALL_AREAS } from "./consts"
import { BrainDumpInputProps, BrainDumpTemplate } from "./types"
import { buildUntanglePayload } from "./utils"

export function useBrainDump({ onUntangle, isLoading }: BrainDumpInputProps) {
  const [text, setText] = useState("")
  const [energyPreference, setEnergyPreference] = useState<EnergyLevel>("medium")
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [selectedFocusCategory, setSelectedFocusCategory] = useState<string>(ALL_AREAS)
  const [audioError, setAudioError] = useState<string | null>(null)

  // Gemini 3.5 Transcribe Audio Recorder Hook
  const recorder = useAudioRecorder({
    onTranscription: (transcribedText) => {
      setText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText))
      setAudioError(null)
    },
    onError: (err) => {
      setAudioError(err)
    },
  })

  const applyTemplate = (tpl: BrainDumpTemplate) => {
    setActiveTemplate(tpl.id)
    setText(tpl.prompt)
  }

  const editText = (value: string) => {
    setText(value)
    setActiveTemplate(null)
  }

  const clearText = () => editText("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return
    onUntangle(buildUntanglePayload(text, selectedFocusCategory), energyPreference)
  }

  return {
    text,
    editText,
    clearText,
    energyPreference,
    setEnergyPreference,
    activeTemplate,
    applyTemplate,
    selectedFocusCategory,
    setSelectedFocusCategory,
    audioError,
    recorder,
    handleSubmit,
  }
}
