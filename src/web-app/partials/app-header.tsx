import React from "react"
import { RotateCcw, Zap } from "lucide-react"
import { User } from "firebase/auth"
import { ActiveView } from "../types"
import { AppAuthStatus } from "./app-auth-status"
import { AppNav } from "./app-nav"
import { BrandMark } from "./brand-mark"

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

// Command bar: wordmark and the one amber action on the top row, the view
// switch on its own row below. Two jobs, two rows, no cramping.
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
    <header className="sticky top-0 z-40 bg-neutral-950 border-b border-neutral-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 select-none">
          <BrandMark className="w-5 h-5 text-amber-400" />
          <span className="text-lg font-semibold tracking-tight text-neutral-100">Untangle</span>
        </span>

        <div className="flex items-center gap-4">
          <AppAuthStatus
            currentUser={currentUser}
            authLoading={authLoading}
            onSignIn={onSignIn}
            onSignOut={onSignOut}
          />

          <button
            type="button"
            onClick={onOpenUnstick}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-amber-400 text-neutral-950 hover:bg-amber-300 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Zap className="w-4 h-4 fill-neutral-950" aria-hidden="true" />
            <span>Unstick me</span>
          </button>

          <button
            type="button"
            onClick={onResetToSeed}
            aria-label="Reset sample tasks"
            title="Reset sample tasks"
            className="p-2 text-neutral-500 hover:text-neutral-200 transition-colors rounded-md"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <AppNav activeView={activeView} onChangeView={onChangeView} />
      </div>
    </header>
  )
}
