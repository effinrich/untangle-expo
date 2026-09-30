import React from "react"
import { Platform } from "react-native"
import { Slot } from "expo-router"
import Head from "expo-router/head"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as SplashScreen from "expo-splash-screen"
import { AppProvider } from "../components/app-provider/app-provider"
import { NativeStack } from "../components/native-stack/native-stack"
import "../global.css"

export { RouteErrorBoundary as ErrorBoundary } from "../components/route-error-boundary/route-error-boundary"

if (Platform.OS !== "web") SplashScreen.preventAutoHideAsync().catch(() => {})

const queryClient = new QueryClient()

const TITLE = "Untangle - ADHD Brain Dump & Next Steps"
const DESCRIPTION =
  "Turn chaotic thoughts and ADHD brain dumps into short, bite-sized steps with energy levels, dopamine rewards, and one-thing-at-a-time focus."

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
        <StatusBar style="light" />
        <AppProvider>
          <NativeStack />
        </AppProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
