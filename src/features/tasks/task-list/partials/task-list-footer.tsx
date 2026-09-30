import React from "react"
import { Copy } from "lucide-react"

interface TaskListFooterProps {
  activeCount: number
  completedCount: number
  copiedNotification: boolean
  onExportMarkdown: () => void
  onClearCompleted: () => void
}

export const TaskListFooter: React.FC<TaskListFooterProps> = ({
  activeCount,
  completedCount,
  copiedNotification,
  onExportMarkdown,
  onClearCompleted,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm text-neutral-500 border-t border-neutral-800">
      <p>
        {activeCount} active · {completedCount} done
      </p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onExportMarkdown}
          className="hover:text-neutral-300 flex items-center gap-2 transition-colors"
        >
          <Copy className="w-4 h-4" aria-hidden="true" />
          <span>{copiedNotification ? "Copied" : "Copy as markdown"}</span>
        </button>

        {completedCount > 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            className="hover:text-rose-400 transition-colors"
          >
            Clear done
          </button>
        )}
      </div>
    </div>
  )
}
