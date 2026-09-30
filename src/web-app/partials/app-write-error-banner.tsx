import React from "react"

interface AppWriteErrorBannerProps {
  onDismiss: () => void
}

// Same contract as the native write-failure banner: the change was rolled back, say so.
export const AppWriteErrorBanner: React.FC<AppWriteErrorBannerProps> = ({ onDismiss }) => {
  return (
    <div
      role="alert"
      className="flex items-center justify-between border-b border-rose-500/30 bg-rose-500/15 px-4 py-2 text-xs text-rose-300"
    >
      <span>
        <span className="font-semibold">A change didn&rsquo;t save.</span> It may have been undone,
        so check your tasks and try again.
      </span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-rose-400 underline hover:text-rose-200"
      >
        Dismiss
      </button>
    </div>
  )
}
