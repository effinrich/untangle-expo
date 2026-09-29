"use dom"

import { StrictMode, useEffect, useState } from "react"
import type { DOMProps } from "expo/dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "../src/web-app/app"
import "../src/index.css"

const queryClient = new QueryClient()

interface WebAppProps {
  dom?: DOMProps
}

export default function WebApp(_props: WebAppProps) {
  // src/ reads localStorage during render, so it must skip the server render pass.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  )
}
