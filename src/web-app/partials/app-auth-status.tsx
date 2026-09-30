import React from "react"
import { LogIn, LogOut } from "lucide-react"
import { User } from "firebase/auth"

interface AppAuthStatusProps {
  currentUser: User | null
  authLoading: boolean
  onSignIn: () => void
  onSignOut: () => void
}

export const AppAuthStatus: React.FC<AppAuthStatusProps> = ({
  currentUser,
  authLoading,
  onSignIn,
  onSignOut,
}) => {
  if (!currentUser) {
    return (
      <button
        type="button"
        onClick={onSignIn}
        disabled={authLoading}
        className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-200 transition-colors flex items-center gap-1.5 whitespace-nowrap"
        title="Sign in with Google to sync to Firestore"
      >
        <LogIn className="w-3.5 h-3.5 text-amber-400" />
        <span>Google Sign-In</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-1 pr-2 text-xs">
      {currentUser.photoURL ? (
        <img
          src={currentUser.photoURL}
          alt={currentUser.displayName || "User"}
          className="w-5 h-5 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">
          {currentUser.displayName ? currentUser.displayName[0] : "U"}
        </div>
      )}
      <span className="text-neutral-300 font-medium hidden sm:inline max-w-[100px] truncate">
        {currentUser.displayName || currentUser.email}
      </span>
      <button
        type="button"
        onClick={onSignOut}
        aria-label="Sign out"
        className="text-neutral-500 hover:text-rose-400 transition-colors ml-1 p-0.5"
        title="Sign Out"
      >
        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
