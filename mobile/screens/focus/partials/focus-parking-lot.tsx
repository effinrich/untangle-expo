import React from "react"
import { View, Text, TextInput, Pressable } from "react-native"

interface FocusParkingLotProps {
  parkingThought: string
  onChangeThought: (text: string) => void
  parkingLot: string[]
  onParkThought: () => void
}

// Thought parking lot
export function FocusParkingLot({
  parkingThought,
  onChangeThought,
  parkingLot,
  onParkThought,
}: FocusParkingLotProps) {
  return (
    <View className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 mt-4 mb-10">
      <Text className="text-xs font-bold text-neutral-300 mb-1">Mental Parking Lot</Text>
      <Text className="text-[11px] text-neutral-500 mb-3">
        Dump intrusive thoughts here so you don’t get derailed.
      </Text>

      <View className="flex-row gap-2 mb-3">
        <TextInput
          value={parkingThought}
          onChangeText={onChangeThought}
          placeholder="e.g. remember to buy eggs..."
          placeholderTextColor="#737373"
          className="flex-1 bg-neutral-950 p-2.5 rounded-xl text-neutral-100 text-xs border border-neutral-800"
        />
        <Pressable
          onPress={onParkThought}
          className="bg-neutral-800 px-3 py-2 rounded-xl justify-center"
        >
          <Text className="text-xs font-semibold text-white">Park</Text>
        </Pressable>
      </View>

      {parkingLot.map((item, idx) => (
        <View
          key={idx}
          className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800/60 mb-1.5"
        >
          <Text className="text-xs text-neutral-300">{item}</Text>
        </View>
      ))}
    </View>
  )
}
