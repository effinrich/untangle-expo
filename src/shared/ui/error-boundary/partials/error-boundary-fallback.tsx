import React from "react"

interface ErrorBoundaryFallbackProps {
  error: Error
  onReset: () => void
}

// Default recovery UI for a crashed subtree. The surrounding app stays usable.
export function ErrorBoundaryFallback({ error, onReset }: ErrorBoundaryFallbackProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-center"
    >
      <h2 className="text-sm font-semibold text-neutral-100">This view stopped working</h2>
      <p className="mt-1 text-xs leading-relaxed text-neutral-400">
        The rest of the app is fine. The error:{" "}
        <span className="font-mono">{error.message.slice(0, 140)}</span>
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-amber-300"
      >
        Try again
      </button>
    </div>
  )
}
