import React from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import { CATEGORIES } from "../consts"

interface MainCategoryPillsProps {
  selectedCategory: string
  onSelectCategory: (cat: string) => void
}

export function MainCategoryPills({ selectedCategory, onSelectCategory }: MainCategoryPillsProps) {
  return (
    <View className="mb-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 rounded-lg border mr-2 ${
              selectedCategory === cat
                ? "bg-neutral-800 border-neutral-600"
                : "bg-neutral-950 border-neutral-800"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                selectedCategory === cat ? "text-amber-300" : "text-neutral-400"
              }`}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
