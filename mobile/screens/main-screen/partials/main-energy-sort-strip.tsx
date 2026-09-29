import React from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import { SORT_OPTIONS } from "../consts"
import { SortType } from "../types"

interface MainEnergySortStripProps {
  sortBy: SortType
  onSelectSort: (sort: SortType) => void
}

// Mental state & energy sort strip
export function MainEnergySortStrip({ sortBy, onSelectSort }: MainEnergySortStripProps) {
  return (
    <View className="mb-3">
      <Text className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
        Match Your Battery (Energy Sort)
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
        {SORT_OPTIONS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onSelectSort(item.id)}
            className={`px-3 py-2 rounded-xl border mr-2 ${
              sortBy === item.id
                ? "bg-amber-400/20 border-amber-400 text-amber-300"
                : "bg-neutral-900 border-neutral-800"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                sortBy === item.id ? "text-amber-300" : "text-neutral-400"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
