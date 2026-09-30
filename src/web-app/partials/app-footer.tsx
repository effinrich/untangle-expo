import React from "react"

interface AppFooterProps {
  onOpenUnstick: () => void
}

export const AppFooter: React.FC<AppFooterProps> = ({ onOpenUnstick }) => {
  return (
    <footer className="border-t border-neutral-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-500">
        <p>Untangle · your steps stay on this device until you sign in</p>
        <button
          type="button"
          onClick={onOpenUnstick}
          className="hover:text-neutral-300 transition-colors"
        >
          Unstick assistant
        </button>
      </div>
    </footer>
  )
}
