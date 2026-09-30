import React from "react"

interface OverlayErrorFallbackProps {
  onClose: () => void
}

// Recovery UI for a crashed modal: keeps the overlay shape so the page behind stays dimmed.
export function OverlayErrorFallback({ onClose }: OverlayErrorFallbackProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/90 p-4">
      <div
        role="alert"
        className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-center"
      >
        <h2 className="text-sm font-bold text-neutral-100">This view stopped working</h2>
        <p className="mt-1 text-xs leading-relaxed text-neutral-400">
          Close it and try again. The rest of the app is fine.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-neutral-800 py-2.5 text-xs font-medium text-neutral-200 hover:bg-neutral-700"
        >
          Close
        </button>
      </div>
    </div>
  )
}
