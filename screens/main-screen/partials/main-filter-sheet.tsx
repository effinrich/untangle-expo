import React from "react"
import { Modal, ScrollView, Text, View } from "react-native"
import { Button } from "../../../components/button/button"
import { OptionRow } from "../../../components/option-row/option-row"
import { SORT_OPTIONS } from "../consts"
import { SortType } from "../types"

interface MainFilterSheetProps {
  visible: boolean
  onClose: () => void
  sortBy: SortType
  onSelectSort: (sort: SortType) => void
  area: string
  areas: string[]
  onSelectArea: (area: string) => void
}

// Native page sheet: swipe down or tap Done to dismiss.
export function MainFilterSheet({
  visible,
  onClose,
  sortBy,
  onSelectSort,
  area,
  areas,
  onSelectArea,
}: MainFilterSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Text className="text-title3 font-bold text-text-primary" accessibilityRole="header">
            Sort & filter
          </Text>
          <Button label="Done" variant="ghost" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 24 }}>
          <View className="gap-3" accessibilityRole="radiogroup" accessibilityLabel="Sort by energy">
            <Text className="text-callout font-semibold text-text-secondary">
              Match your energy
            </Text>
            {SORT_OPTIONS.map((option) => (
              <OptionRow
                key={option.id}
                label={option.label}
                description={option.description}
                selected={sortBy === option.id}
                onSelect={() => onSelectSort(option.id)}
              />
            ))}
          </View>
          <View className="gap-3" accessibilityRole="radiogroup" accessibilityLabel="Life area">
            <Text className="text-callout font-semibold text-text-secondary">Life area</Text>
            {areas.map((option) => (
              <OptionRow
                key={option}
                label={option}
                selected={area === option}
                onSelect={() => onSelectArea(option)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}
