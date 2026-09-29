import React from "react"
import { Copy } from "lucide-react"

interface TaskListFooterProps {
  activeCount: number
  completedCount: number
  sortLabel: string
  copiedNotification: boolean
  onExportMarkdown: () => void
  onClearCompleted: () => void
}

export const TaskListFooter: React.FC<TaskListFooterProps> = ({
  activeCount,
  completedCount,
  sortLabel,
  copiedNotification,
  onExportMarkdown,
  onClearCompleted,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-neutral-500 border-t border-neutral-800/60">
      <div className="flex items-center gap-3">
        <span>
          {activeCount} active · {completedCount} checked off
        </span>
        <span className="text-neutral-400 font-mono">Sorted: {sortLabel}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExportMarkdown}
          className="hover:text-neutral-300 flex items-center gap-1.5 transition-colors"
          title="Copy structured plan to clipboard"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{copiedNotification ? "Copied to Clipboard!" : "Copy Plan as Markdown"}</span>
        </button>

        {completedCount > 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            className="hover:text-rose-400 transition-colors"
          >
            Clear Completed
          </button>
        )}
      </div>
    </div>
  )
}
