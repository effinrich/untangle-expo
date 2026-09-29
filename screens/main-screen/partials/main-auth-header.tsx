import React from "react"
import { View, Text, Pressable } from "react-native"
import { User } from "firebase/auth"
import { signOutUser } from "../../../services/firebase"

interface MainAuthHeaderProps {
  user: User | null
  canSignIn: boolean
  onSignIn: () => void
}

export function MainAuthHeader({ user, canSignIn, onSignIn }: MainAuthHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-4">
      {user ? (
        <View className="flex-row items-center justify-between flex-1">
          <Text className="text-sm font-bold text-neutral-100">
            Hi, {user.displayName || "User"}
          </Text>
          <Pressable
            onPress={() => signOutUser()}
            className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg"
          >
            <Text className="text-xs text-neutral-300">Sign Out</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row items-center justify-between flex-1">
          <Text className="text-sm font-bold text-neutral-400">Guest Mode (Local Only)</Text>
          <Pressable
            onPress={onSignIn}
            disabled={!canSignIn}
            className="px-3 py-1.5 bg-amber-500 rounded-lg"
          >
            <Text className="text-xs font-bold text-black">Sign in with Google</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
