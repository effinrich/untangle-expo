import React from "react"
import { Platform, useWindowDimensions } from "react-native"
import { DesktopDashboard } from "../features/home/desktop-dashboard"
import MobileHomeScreen from "../features/home/mobile-home-screen"

const DESKTOP_WEB_MIN_WIDTH = 768

export default function HomeRoute() {
  const { width } = useWindowDimensions()
  const isDesktopWeb =
    Platform.OS === "web" && width >= DESKTOP_WEB_MIN_WIDTH

  if (isDesktopWeb) {
    return <DesktopDashboard />
  }

  return <MobileHomeScreen />
}
