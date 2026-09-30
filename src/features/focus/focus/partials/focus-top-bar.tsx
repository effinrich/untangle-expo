import React from "react"
import { Layers, X } from "lucide-react"

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
    <div className="w-full flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Layers className="w-4 h-4" aria-hidden="true" />
        <span>Focus</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleParkingLot}
          aria-expanded={showParkingLot}
          className={`min-h-11 px-3 rounded-md border text-sm transition-colors flex items-center gap-2 ${
            showParkingLot
              ? "border-neutral-600 text-neutral-100"
              : "border-neutral-800 text-neutral-300 hover:text-neutral-100"
          }`}
        >
          <span>Parked thoughts ({parkingLotCount})</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close focus session"
          className="w-11 h-11 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
