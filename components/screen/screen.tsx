import React, { ReactNode } from "react"
import { ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface ScreenProps {
  children: ReactNode
  footer?: ReactNode
  topInset?: boolean
}

// Scrollable screen body on the canvas color. `topInset` is for screens without a native header;
// `footer` pins actions above the home indicator.
export function Screen({ children, footer, topInset = false }: ScreenProps) {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: topInset ? insets.top + 16 : 16,
          paddingBottom: footer ? 24 : insets.bottom + 32,
          gap: 24,
        }}
      >
        {children}
      </ScrollView>
      {footer ? (
        <View
          className="px-4 pt-3 gap-3 border-t border-divider bg-canvas"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  )
}
