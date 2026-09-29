import React from "react"
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native"

interface MainBrainDumpPadProps {
  text: string
  onChangeText: (text: string) => void
  isRecording: boolean
  isTranscribing: boolean
  isUntangling: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onUntangle: () => void
}

// Brain dump voice pad
export function MainBrainDumpPad({
  text,
  onChangeText,
  isRecording,
  isTranscribing,
  isUntangling,
  onStartRecording,
  onStopRecording,
  onUntangle,
}: MainBrainDumpPadProps) {
  return (
    <View className="bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800 mb-4">
      <Text className="text-base font-bold text-neutral-100 mb-1">Stream of Consciousness</Text>
      <Text className="text-xs text-neutral-400 mb-3">
        Dump your thoughts without filtering. AI will slice into micro-actions.
      </Text>

      <TextInput
        value={text}
        onChangeText={onChangeText}
        placeholder="e.g. Call dentist, renew insurance, review slides..."
        placeholderTextColor="#737373"
        multiline
        numberOfLines={3}
        className="bg-neutral-950 p-3 rounded-xl text-neutral-100 text-sm border border-neutral-800 min-h-[80px] mb-3"
      />

      <View className="flex-row items-center justify-between">
        {/* Voice Record Button */}
        <Pressable
          onPress={isRecording ? onStopRecording : onStartRecording}
          disabled={isTranscribing}
          className={`px-3 py-2 rounded-xl flex-row items-center gap-2 border ${
            isRecording ? "bg-rose-500 border-rose-400" : "bg-neutral-950 border-neutral-700"
          }`}
        >
          <Text className="text-xs font-semibold text-white">
            {isRecording
              ? "🔴 Recording... Tap to Stop"
              : isTranscribing
                ? "⏳ Transcribing..."
                : "🎤 Voice Dump"}
          </Text>
        </Pressable>

        {/* Untangle Submit */}
        <Pressable
          onPress={onUntangle}
          disabled={!text.trim() || isUntangling}
          className="bg-amber-400 px-4 py-2.5 rounded-xl active:scale-95 disabled:opacity-50"
        >
          {isUntangling ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text className="text-xs font-bold text-neutral-950">✨ Slices to Micro-Tasks</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}
