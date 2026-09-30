import React from "react"

interface AppUndoBarProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
}

// Undo beats confirm for a recoverable delete. Names the object, offers the
// escape, and never takes focus, so the user keeps their hands where they were.
export const AppUndoBar: React.FC<AppUndoBarProps> = ({ message, onUndo, onDismiss }) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-800 bg-neutral-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 text-sm">
        <p className="text-neutral-300 truncate">{message}</p>
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            className="font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
