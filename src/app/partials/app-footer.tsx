import React from "react"

interface AppFooterProps {
  onOpenUnstick: () => void
}

export const AppFooter: React.FC<AppFooterProps> = ({ onOpenUnstick }) => {
  return (
    <footer className="border-t border-neutral-900 py-6 text-xs text-neutral-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>Untangle · Powered by Gemini 3.8 Flash & Gemini 3.5 Transcribe</span>
          <span aria-hidden="true">·</span>
          <span className="text-neutral-400">Firebase Firestore Cloud Sync</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onOpenUnstick} className="hover:text-neutral-300 transition-colors">
            Unstick Assistant
          </button>
          <span aria-hidden="true">·</span>
          <span>Zero Guilt Guarantee</span>
        </div>
      </div>
    </footer>
  )
}
