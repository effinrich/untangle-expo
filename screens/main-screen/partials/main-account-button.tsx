import React from "react"
import { Alert, Pressable, Text, View } from "react-native"
import { User } from "firebase/auth"

interface MainAccountButtonProps {
  user: User | null
  canSignIn: boolean
  onSignIn: () => void
  onSignOut: () => Promise<void>
  hasUnsyncedChanges: () => boolean
}

export function MainAccountButton({
  user,
  canSignIn,
  onSignIn,
  onSignOut,
  hasUnsyncedChanges,
}: MainAccountButtonProps) {
  if (!user) {
    return (
      <Pressable
        onPress={onSignIn}
        disabled={!canSignIn}
        accessibilityRole="button"
        accessibilityLabel="Sign in with Google"
        accessibilityHint="Syncs your steps across devices"
        accessibilityState={{ disabled: !canSignIn }}
        hitSlop={8}
        className="min-h-touch min-w-touch justify-center px-2 active:opacity-70"
      >
        <Text className="text-body font-semibold text-accent-text">Sign in</Text>
      </Pressable>
    )
  }

  const name = user.displayName || user.email || "your account"
  const confirmSignOut = () =>
    Alert.alert(
      `Signed in as ${name}`,
      hasUnsyncedChanges()
        ? "Some changes haven’t synced yet. Signing out removes them from this device."
        : "Your steps sync to this Google account.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: () => void onSignOut() },
      ],
    )

  return (
    <Pressable
      onPress={confirmSignOut}
      accessibilityRole="button"
      accessibilityLabel={`Account, signed in as ${name}`}
      hitSlop={8}
      className="min-h-touch min-w-touch items-center justify-center active:opacity-70"
    >
      <View className="w-9 h-9 rounded-full bg-accent items-center justify-center">
        <Text className="text-callout font-bold text-on-accent">{name.charAt(0).toUpperCase()}</Text>
      </View>
    </Pressable>
  )
}
