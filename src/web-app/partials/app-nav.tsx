import React from "react"
import { NAV_ITEMS } from "../consts"
import { ActiveView } from "../types"

interface AppNavProps {
  activeView: ActiveView
  onChangeView: (view: ActiveView) => void
}

// Quiet text nav. The active state is carried by weight and a neutral rule, not
// by amber, so amber means one thing on this screen: the primary action.
export const AppNav: React.FC<AppNavProps> = ({ activeView, onChangeView }) => {
  return (
    <nav aria-label="Views" className="hidden md:flex items-center gap-5 text-sm text-neutral-400">
      {NAV_ITEMS.map(({ view, label }) => {
        const isActive = activeView === view
        return (
          <button
            key={view}
            type="button"
            onClick={() => onChangeView(view)}
            aria-current={isActive ? "page" : undefined}
            className={`transition-colors hover:text-neutral-100 ${
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
