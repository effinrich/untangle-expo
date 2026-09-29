import React from "react"
import { Layers, X, Zap } from "lucide-react"

interface FocusTopBarProps {
  showParkingLot: boolean
  parkingLotCount: number
  onToggleParkingLot: () => void
  onClose: () => void
}

export const FocusTopBar: React.FC<FocusTopBarProps> = ({
  showParkingLot,
  parkingLotCount,
  onToggleParkingLot,
  onClose,
}) => {
  return (
    <div className="w-full flex items-center justify-between mb-6">
      <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-amber-400">
        <Zap className="w-3.5 h-3.5 fill-amber-400" />
        <span>ONE THING RADAR</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleParkingLot}
          className={`px-3 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1.5 ${
            showParkingLot
              ? "bg-amber-400/20 border-amber-400/40 text-amber-300"
              : "bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Thought Parking Lot ({parkingLotCount})</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close focus session"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
