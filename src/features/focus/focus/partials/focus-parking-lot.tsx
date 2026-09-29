import React from "react"
import { Trash2 } from "lucide-react"
import { ParkingLotItem } from "../../../../types"

interface FocusParkingLotProps {
  parkingLot: ParkingLotItem[]
  parkingThought: string
  onChangeThought: (value: string) => void
  onAddThought: (e: React.FormEvent) => void
  onDeleteItem: (id: string) => void
}

// Thought parking lot drawer
export const FocusParkingLot: React.FC<FocusParkingLotProps> = ({
  parkingLot,
  parkingThought,
  onChangeThought,
  onAddThought,
  onDeleteItem,
}) => {
  return (
    <div className="w-full mt-6 pt-5 border-t border-neutral-800 text-left">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-neutral-300">Mental Parking Lot</div>
        <span className="text-[11px] text-neutral-500">
          Dump random thoughts here so you don’t derail
        </span>
      </div>

      <form onSubmit={onAddThought} className="flex gap-2 mb-3">
        <input
          type="text"
          value={parkingThought}
          onChange={(e) => onChangeThought(e.target.value)}
          placeholder="e.g. Remember to buy milk, check text from mom..."
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={!parkingThought.trim()}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 disabled:opacity-40"
        >
          Park Thought
        </button>
      </form>

      <div className="max-h-36 overflow-y-auto space-y-1.5 no-scrollbar">
        {parkingLot.length === 0 ? (
          <div className="text-xs text-neutral-600 text-center py-2">
            No parked thoughts yet. Whenever your mind wanders, type it here.
          </div>
        ) : (
          parkingLot.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-md bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300"
            >
              <span>{item.text}</span>
              <button
                type="button"
                onClick={() => onDeleteItem(item.id)}
                className="text-neutral-500 hover:text-rose-400 ml-2"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
