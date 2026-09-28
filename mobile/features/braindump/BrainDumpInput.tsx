import { View, Text, Pressable, TextInput } from 'react-native';
import React, { useState, useEffect, useRef } from "react"
import {
  Mic,
  MicOff,
  Sparkles,
  Wand2,
  RotateCcw,
  Flame,
  Radio,
  Loader2,
  Tag,
  Briefcase,
  Home,
  Heart,
  Landmark,
} from "lucide-react-native"
import { BRAIN_DUMP_TEMPLATES } from "../../data/seedData"
import { DEFAULT_CATEGORIES } from "../../data/categories"
import { EnergyLevel } from "../../types"
import { useAudioRecorder } from "../audio/useAudioRecorder"

interface BrainDumpInputProps {
  onUntangle: (rawDump: string, energyPreference: string) => Promise<void>
  isLoading: boolean
}

export const BrainDumpInput: React.FC<BrainDumpInputProps> = ({ onUntangle, isLoading }) => {
  const [text, setText] = useState("")
  const [energyPreference, setEnergyPreference] = useState<EnergyLevel>("medium")
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [selectedFocusCategory, setSelectedFocusCategory] = useState<string>("all")
  const [audioError, setAudioError] = useState<string | null>(null)

  // Gemini 3.5 Transcribe Audio Recorder Hook
  const { isRecording, isTranscribing, recordingSeconds, startRecording, stopRecording } =
    useAudioRecorder({
      onTranscription: (transcribedText) => {
        setText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText))
        setAudioError(null)
      },
      onError: (err) => {
        setAudioError(err)
      },
    })

  const handleApplyTemplate = (tpl: (typeof BRAIN_DUMP_TEMPLATES)[0]) => {
    setActiveTemplate(tpl.id)
    setText(tpl.prompt)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return

    let payloadText = text
    if (selectedFocusCategory !== "all") {
      payloadText = `[Priority Area: ${selectedFocusCategory}] ${text}`
    }
    onUntangle(payloadText, energyPreference)
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <View className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 md:p-6 backdrop-blur-sm shadow-xl">
      <View className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <View>
          <Text className="text-lg font-semibold text-neutral-100 tracking-tight flex items-center gap-2">
            <Text>Stream of Consciousness Dump</Text>
            <Text className="text-xs text-neutral-500 font-normal">
              Type or speak with Gemini 3.5 audio transcribe
            </Text>
          </Text>
          <Text className="text-xs text-neutral-400 mt-0.5">
            Do not organize yet. Dump every thought, chore, worry, or half-baked idea. AI will
            categorize and slice it into micro-steps.
          </Text>
        </View>

        {/* Energy Preference Segmented Control */}
        <View className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs self-start md:self-auto">
          <Text className="text-neutral-500 px-2 py-1 select-none">Battery:</Text>
          {(["low", "medium", "high"] as EnergyLevel[]).map((level) => {
            const labels = {
              low: "Low 🔋",
              medium: "Medium ⚡",
              high: "Hyperfocus 🚀",
            }
            const isSelected = energyPreference === level
            return (
              <Pressable
                key={level}
                
                onPress={() => setEnergyPreference(level)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                  isSelected
                    ? "bg-neutral-800 text-amber-300 shadow-sm border border-neutral-700/60"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {labels[level]}
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* Category Priority Focus & Sparks Bar */}
      <View className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs">
        {/* Priority Area Focus Filter */}
        <View className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <Text className="text-neutral-500 whitespace-nowrap flex items-center gap-1">
            <Tag className="w-3 h-3 text-neutral-400" />
            <Text>Target Area:</Text>
          </Text>
          <Pressable
            
            onPress={() => setSelectedFocusCategory("all")}
            className={`px-2 py-0.5 rounded-md border text-[11px] whitespace-nowrap transition-colors ${
              selectedFocusCategory === "all"
                ? "bg-neutral-800 border-neutral-600 text-amber-300 font-medium"
                : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Auto-Detect All
          </Pressable>
          {DEFAULT_CATEGORIES.slice(0, 4).map((cat) => (
            <Pressable
              key={cat.id}
              
              onPress={() => setSelectedFocusCategory(cat.name)}
              className={`px-2 py-0.5 rounded-md border text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedFocusCategory === cat.name
                  ? `${cat.bgLight} ${cat.borderColor} ${cat.textColor} font-semibold`
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Text>{cat.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Clear button if text exists */}
        {text && (
          <Pressable
            
            onPress={() => {
              setText("")
              setActiveTemplate(null)
            }}
            className="text-neutral-500 hover:text-neutral-300 text-xs flex items-center gap-1 transition-colors self-end sm:self-auto"
            
          >
            <RotateCcw className="w-3 h-3" />
            <Text>Clear Dump</Text>
          </Pressable>
        )}
      </View>

      {/* Template Quick Sparks */}
      <View className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <Text className="text-neutral-500 whitespace-nowrap">Sparks:</Text>
        {BRAIN_DUMP_TEMPLATES.map((tpl) => (
          <Pressable
            key={tpl.id}
            
            onPress={() => handleApplyTemplate(tpl)}
            className={`px-2.5 py-1 rounded-md border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTemplate === tpl.id
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : "border-neutral-800 bg-neutral-950/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
            }`}
          >
            <Text>{tpl.title}</Text>
          </Pressable>
        ))}
      </View>

      {/* Input Textarea & Voice Button */}
      <View  className="relative">
        <View className="relative rounded-lg border border-neutral-800 bg-neutral-950/90 focus-within:border-amber-500/50 transition-colors">
          <TextInput
            value={text}
            onChange={(e) => {
              setText(e.nativeEvent.text || "")
              setActiveTemplate(null)
            }}
            placeholder="What's floating in your head right now? e.g. Need to pay the electric bill before Friday, cat needs medication, finish the budget report for Sarah, clean the laundry mountain off the chair..."
            
            className="w-full bg-transparent p-4 pr-16 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none resize-y min-h-[110px] leading-relaxed"
          />

          {/* Voice dictation button with Gemini 3.5 Transcribe */}
          <View className="absolute right-3 bottom-3 flex items-center gap-2">
            {isRecording && (
              <Text className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 animate-pulse">
                {recordingSeconds}s rec
              </Text>
            )}
            <Pressable
              
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={`p-2.5 rounded-lg border transition-all ${
                isRecording
                  ? "bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30 ring-2 ring-rose-400/40"
                  : isTranscribing
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              }`}
              
            >
              {isTranscribing ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              ) : isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Audio Recording / Transcription Status Banner */}
        {isRecording && (
          <View className="mt-2 p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center justify-between text-xs text-rose-300">
            <View className="flex items-center gap-2">
              <Text className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <Text>
                Recording audio... Speak naturally. Tap microphone when done to transcribe.
              </Text>
            </View>
            <Pressable
              
              onPress={stopRecording}
              className="px-2 py-0.5 bg-rose-500 text-white rounded font-medium text-[11px]"
            >
              Finish ({recordingSeconds}s)
            </Pressable>
          </View>
        )}

        {isTranscribing && (
          <View className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-xs text-amber-300">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <Text>Transcribing audio with Gemini 3.5 Transcribe model...</Text>
          </View>
        )}

        {audioError && (
          <View className="mt-2 p-2 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-300">
            {audioError}
          </View>
        )}

        {/* Footer actions */}
        <View className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3.5">
          <View className="flex items-center gap-3 text-xs text-neutral-500">
            <Text>{wordCount} words</Text>
            <Text aria-hidden={true}>·</Text>
            <Text>
              {isRecording ? (
                <Text className="text-rose-400 font-medium">Recording audio input...</Text>
              ) : (
                "Micro-step & category decomposition engine ready"
              )}
            </Text>
          </View>

          <View className="flex items-center gap-2">
            <Pressable
              
              disabled={!text.trim() || isLoading}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-lg bg-amber-400 text-neutral-950 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-amber-500/10 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Wand2 className="w-3.5 h-3.5 animate-spin" />
                  <Text>Categorizing & Slicing into Micro-Tasks...</Text>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <Text>Untangle & Create Micro-Tasks</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}
