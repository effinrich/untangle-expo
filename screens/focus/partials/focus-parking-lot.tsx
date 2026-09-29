import React from "react"
import { Pressable, Text, View } from "react-native"
import { X } from "../../../theme/icons"
import { Button } from "../../../components/button/button"
import { TextField } from "../../../components/text-field/text-field"
import type { ParkedThought } from "../../../services/db/types"
import colors from "../../../theme/colors"

interface FocusParkingLotProps {
  draft: string
  onChangeDraft: (text: string) => void
  thoughts: ParkedThought[]
  onPark: () => void
  onRemove: (id: string) => void
}

export function FocusParkingLot({
  draft,
  onChangeDraft,
  thoughts,
  onPark,
  onRemove,
}: FocusParkingLotProps) {
  return (
    <View className="gap-4 p-4 rounded-2xl bg-surface">
      <Text className="text-title3 font-bold text-text-primary" accessibilityRole="header">
        Parking lot
      </Text>
      <TextField
        label="Park a distracting thought"
        helper="Get it out of your head and back to your step. It'll be here later."
        placeholder="Remember to buy eggs…"
        value={draft}
        onChangeText={onChangeDraft}
        onSubmitEditing={onPark}
        returnKeyType="done"
        submitBehavior="submit"
      />
      <Button label="Park it" variant="secondary" onPress={onPark} disabled={!draft.trim()} />

      {thoughts.map((thought) => (
        <View key={thought.id} className="flex-row items-center gap-2 pl-4 rounded-xl bg-raised">
          <Text className="flex-1 py-3 text-callout text-text-primary">{thought.text}</Text>
          <Pressable
            onPress={() => onRemove(thought.id)}
            accessibilityRole="button"
            accessibilityLabel={`Remove "${thought.text}"`}
            className="w-11 h-11 items-center justify-center active:opacity-70"
          >
            <X size={18} color={colors["text-secondary"]} accessible={false} />
          </Pressable>
        </View>
      ))}
    </View>
  )
}
