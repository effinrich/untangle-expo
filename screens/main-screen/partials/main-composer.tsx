import React, { RefObject } from "react"
import { Text, TextInput, View } from "react-native"
import { Mic, Sparkles, Square } from "../../../theme/icons"
import { Button } from "../../../components/button/button"
import { StatusBanner } from "../../../components/status-banner/status-banner"
import { TextField } from "../../../components/text-field/text-field"
import { UntangleStatus } from "../types"

interface MainComposerProps {
  inputRef: RefObject<TextInput>
  text: string
  onChangeText: (text: string) => void
  status: UntangleStatus
  emptyError: boolean
  isRecording: boolean
  isTranscribing: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onSubmit: () => void
}

export function MainComposer({
  inputRef,
  text,
  onChangeText,
  status,
  emptyError,
  isRecording,
  isTranscribing,
  onStartRecording,
  onStopRecording,
  onSubmit,
}: MainComposerProps) {
  const untangling = status.state === "untangling"

  return (
    <View className="bg-surface rounded-2xl p-4 gap-4">
      <TextField
        ref={inputRef}
        label="What's on your mind?"
        helper="Dump everything, messy is fine. Untangle turns it into small next steps."
        error={emptyError ? "Type or speak a few thoughts first." : undefined}
        placeholder="Call dentist, renew insurance, finish slides…"
        value={text}
        onChangeText={onChangeText}
        editable={!untangling}
        multiline
      />

      {isRecording ? (
        <View className="flex-row items-center gap-2" accessibilityLiveRegion="polite">
          <View className="w-2.5 h-2.5 rounded-full bg-danger" accessible={false} />
          <Text className="text-subhead text-text-secondary">Listening… tap Stop when you’re done.</Text>
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <Button
          label={isRecording ? "Stop" : "Speak"}
          loadingLabel="Transcribing…"
          accessibilityHint={isRecording ? undefined : "Record your thoughts instead of typing"}
          icon={isRecording ? Square : Mic}
          variant="secondary"
          size="lg"
          loading={isTranscribing}
          disabled={untangling}
          onPress={isRecording ? onStopRecording : onStartRecording}
        />
        <Button
          label="Untangle"
          loadingLabel="Untangling…"
          accessibilityHint="Turns your thoughts into small next steps"
          icon={Sparkles}
          size="lg"
          loading={untangling}
          disabled={isRecording || isTranscribing}
          onPress={onSubmit}
          className="flex-1"
        />
      </View>

      {status.state === "error" ? (
        <StatusBanner
          tone={status.kind === "offline" ? "offline" : "error"}
          title={status.kind === "offline" ? "You're offline" : "Couldn't untangle that"}
          message={`${status.message} Your text is still here.`}
          actionLabel="Try again"
          onAction={onSubmit}
        />
      ) : null}
    </View>
  )
}
