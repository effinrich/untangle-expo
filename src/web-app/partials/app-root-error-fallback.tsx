import React from "react"

interface AppRootErrorFallbackProps {
  onRetry: () => void
}

// Whole-page recovery for a crash outside any section boundary. Reload is the honest
// escape hatch, because a root-level crash can leave React state untrustworthy.
export function AppRootErrorFallback({ onRetry }: AppRootErrorFallbackProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-lg font-bold tracking-tight text-neutral-100">
        Untangle hit an unexpected error
      </h1>
      <p className="max-w-sm text-xs leading-relaxed text-neutral-400">
        Reload to get back to your tasks. Nothing you saved is lost.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-3 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-semibold text-neutral-950 hover:bg-amber-300"
      >
        Reload Untangle
      </button>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 text-xs text-neutral-400 underline underline-offset-4 hover:text-neutral-200"
      >
        Try again first
      </button>
    </div>
  )
}
