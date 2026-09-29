import React from "react"
import { NAV_ITEMS } from "../consts"
import { ActiveView } from "../types"

interface AppNavProps {
  activeView: ActiveView
  onChangeView: (view: ActiveView) => void
}

export const AppNav: React.FC<AppNavProps> = ({ activeView, onChangeView }) => {
  return (
    <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
      {NAV_ITEMS.map(({ view, label }) => (
        <button
          key={view}
          onClick={() => onChangeView(view)}
          className={`hover:text-neutral-100 transition-colors ${
            activeView === view ? "text-amber-400 underline underline-offset-4" : ""
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
