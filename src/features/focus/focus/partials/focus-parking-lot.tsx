import React from "react"
import { Trash2 } from "lucide-react"
import { ParkingLotItem } from "../../../../types"

interface FocusParkingLotProps {
  parkingLot: ParkingLotItem[]
  error?: string | null
  parkingThought: string
  onChangeThought: (value: string) => void
  onAddThought: (e: React.FormEvent) => void
  onDeleteItem: (id: string) => void
}

export const FocusParkingLot: React.FC<FocusParkingLotProps> = ({
  parkingLot,
  error,
  parkingThought,
  onChangeThought,
  onAddThought,
  onDeleteItem,
}) => {
  return (
    <div className="w-full mt-6 pt-6 border-t border-neutral-800 text-left">
      <h3 className="text-base text-neutral-100">Parked thoughts</h3>
      <p className="mt-1 text-sm text-neutral-500">
        Get it out of your head. It will be here when you are done.
      </p>

      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      <form onSubmit={onAddThought} className="flex gap-2 mt-4">
        <label htmlFor="parking-thought" className="sr-only">
          Park a thought
        </label>
        <input
          id="parking-thought"
          type="text"
          value={parkingThought}
          onChange={(e) => onChangeThought(e.target.value)}
          placeholder="Buy milk, reply to mum"
          className="flex-1 min-h-11 bg-neutral-950 border border-neutral-800 rounded-md px-3 text-base text-neutral-200 placeholder-neutral-500"
        />
        <button
          type="submit"
          disabled={!parkingThought.trim()}
          className="min-h-11 px-4 rounded-md border border-neutral-800 text-sm text-neutral-300 hover:text-neutral-100 disabled:opacity-40 transition-colors"
        >
          Park
        </button>
      </form>

      <ul className="mt-3 max-h-40 overflow-y-auto no-scrollbar divide-y divide-neutral-800">
        {parkingLot.length === 0 ? (
          <li className="py-3 text-sm text-neutral-500">Nothing parked yet.</li>
        ) : (
          parkingLot.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-1">
              <span className="flex-1 py-2 text-base text-neutral-300">{item.text}</span>
              <button
                type="button"
                onClick={() => onDeleteItem(item.id)}
                aria-label={`Remove parked thought "${item.text}"`}
                className="shrink-0 w-11 h-11 flex items-center justify-center rounded-md text-neutral-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
