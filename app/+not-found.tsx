import { Platform, Text, View } from "react-native"
import { Link, Stack } from "expo-router"
import WebApp from "../components/web-app"

export default function NotFound() {
  if (Platform.OS === "web") return <WebApp />

  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View className="flex-1 items-center justify-center bg-neutral-950 p-6">
        <Text className="text-lg font-bold text-neutral-100">This screen does not exist.</Text>
        <Link href="/" className="mt-4 text-base text-amber-400">
          Go to home
        </Link>
      </View>
    </>
  )
}
