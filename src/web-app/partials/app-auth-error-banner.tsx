import React from "react"

interface AppAuthErrorBannerProps {
  message: string
  onDismiss: () => void
}

export const AppAuthErrorBanner: React.FC<AppAuthErrorBannerProps> = ({ message, onDismiss }) => {
  return (
    <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2 text-xs text-rose-300 flex items-center justify-between">
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-rose-400 hover:text-rose-200 underline"
      >
        Dismiss
      </button>
    </div>
  )
}
