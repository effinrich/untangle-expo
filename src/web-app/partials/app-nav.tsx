import React from "react"
import { NAV_ITEMS } from "../consts"
import { ActiveView } from "../types"

interface AppNavProps {
  activeView: ActiveView
  onChangeView: (view: ActiveView) => void
}

// The nav is its own hairline row, not a third occupant of the wordmark row.
// It scrolls horizontally before it ever cramps, so it is always reachable.
export const AppNav: React.FC<AppNavProps> = ({ activeView, onChangeView }) => {
  return (
    <nav
      aria-label="Views"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-5 overflow-x-auto no-scrollbar text-sm text-neutral-400"
    >
      {NAV_ITEMS.map(({ view, label }) => {
        const isActive = activeView === view
        return (
          <button
            key={view}
            type="button"
            onClick={() => onChangeView(view)}
            aria-current={isActive ? "page" : undefined}
            className={`whitespace-nowrap transition-colors hover:text-neutral-100 ${
              isActive
                ? "text-neutral-100 font-medium underline underline-offset-4 decoration-neutral-600"
                : ""
            }`}
          >
            {label}
          </button>
        )
      })}
    </nav>
  )
}
