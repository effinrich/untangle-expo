import React, { forwardRef, useState } from "react"
import { Text, TextInput, TextInputProps, View } from "react-native"
import colors from "../../theme/colors"

interface TextFieldProps extends Omit<TextInputProps, "placeholderTextColor"> {
  label: string
  helper?: string
  error?: string
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, helper, error, multiline, onFocus, onBlur, className = "", ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false)
  const borderClass = error
    ? "border border-danger"
    : focused
      ? "border-accent border-2"
      : "border-border-field border"

  return (
    <View className="gap-2">
      <Text className="text-subhead font-semibold text-text-primary" accessible={false}>
        {label}
      </Text>
      <TextInput
        ref={ref}
        {...inputProps}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={error ?? helper}
        placeholderTextColor={colors["text-tertiary"]}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        textAlignVertical={multiline ? "top" : "center"}
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        className={`bg-field rounded-xl px-4 text-body text-text-primary ${
          multiline ? "min-h-[120px] py-3" : "min-h-control py-2"
        } ${borderClass} ${className}`}
      />
      {error ? (
        <Text className="text-footnote text-danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text className="text-footnote text-text-secondary" accessible={false}>
          {helper}
        </Text>
      ) : null}
    </View>
  )
})
