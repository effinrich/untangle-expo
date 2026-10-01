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
// Social scrapers require an absolute URL here; a relative path renders no card.
// Point this at the production domain once one is attached.
const OG_IMAGE = "https://untangle-expo-app-silk.vercel.app/og.png"

export default function RootLayout() {
  if (Platform.OS === "web") {
    return (
      <>
        <Head>
          <title>{TITLE}</title>
          <meta name="description" content={DESCRIPTION} />
          <link rel="icon" type="image/svg+xml" href="/icon.svg" />
          <link rel="icon" type="image/png" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="theme-color" content="#0a0a0a" />
          <meta property="og:title" content={TITLE} />
          <meta property="og:description" content={DESCRIPTION} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={OG_IMAGE} />
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
