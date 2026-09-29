import React, { ReactNode } from "react"

// Web renders the DOM app and never mounts this; the stub keeps expo-sqlite (native-only) out of the web bundle.
export function AppProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
