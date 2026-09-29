import React from "react"
import { Platform } from "react-native"
import { Slot, Stack } from "expo-router"
import Head from "expo-router/head"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "../global.css"

const queryClient = new QueryClient()

const TITLE = "Untangle - ADHD Brain Dump & Micro-Task Planner"
const DESCRIPTION =
  "Turn chaotic thoughts and ADHD brain dumps into short, bite-sized micro-tasks with energy levels, dopamine rewards, and single-task focus radar."

export default function RootLayout() {
  if (Platform.OS === "web") {
    return (
      <>
        <Head>
          <title>{TITLE}</title>
          <meta name="description" content={DESCRIPTION} />
          <meta property="og:title" content={TITLE} />
          <meta property="og:description" content={DESCRIPTION} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <Slot />
      </>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0a0a0a" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#0a0a0a" },
            headerTintColor: "#f5f5f5",
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: "#0a0a0a" },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Untangle",
              headerLargeTitle: false,
            }}
          />
          <Stack.Screen
            name="focus"
            options={{
              title: "One Thing Radar",
              presentation: "modal",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="unstick"
            options={{
              title: "Unstick Assistant",
              presentation: "modal",
              headerShown: false,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
