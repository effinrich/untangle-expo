import React from "react"
import { RotateCcw, Zap } from "lucide-react"
import { User } from "firebase/auth"
import { ActiveView } from "../types"
import { AppAuthStatus } from "./app-auth-status"
import { AppNav } from "./app-nav"

interface AppHeaderProps {
  activeView: ActiveView
  onChangeView: (view: ActiveView) => void
  currentUser: User | null
  authLoading: boolean
  onSignIn: () => void
  onSignOut: () => void
  onOpenUnstick: () => void
  onResetToSeed: () => void
}

// Top Bar Contract: Zone 1 (Brand) - Zone 2 (Nav Links) - Zone 3 (Auth & Actions)
export const AppHeader: React.FC<AppHeaderProps> = ({
  activeView,
  onChangeView,
  currentUser,
  authLoading,
  onSignIn,
  onSignOut,
  onOpenUnstick,
  onResetToSeed,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 border-b border-neutral-800/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-100 select-none">
            Untangle
          </span>
          <span className="text-xs text-neutral-500 font-normal hidden sm:inline">
            · ADHD Brain Dump & Priority Areas
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <AppNav activeView={activeView} onChangeView={onChangeView} />

        {/* Zone 3: Auth & Primary Action */}
        <div className="flex items-center gap-2.5">
          <AppAuthStatus
            currentUser={currentUser}
            authLoading={authLoading}
            onSignIn={onSignIn}
            onSignOut={onSignOut}
          />

          <button
            type="button"
            onClick={onOpenUnstick}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 text-neutral-950 hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 fill-neutral-950" />
            <span>Unstick Me</span>
          </button>

          <button
            type="button"
            onClick={onResetToSeed}
            aria-label="Reset sample tasks"
            className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors rounded-lg hover:bg-neutral-900"
            title="Reset sample tasks"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
