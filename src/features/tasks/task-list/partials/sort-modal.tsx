import React from "react"
import { ArrowUpDown, Check, X } from "lucide-react"
import { useModalDialog } from "../../../../shared/hooks/use-modal-dialog"
import { SORT_OPTIONS } from "../consts"
import { SortOption } from "../types"

interface SortModalProps {
  sortBy: SortOption
  onSelectSort: (option: SortOption) => void
  onClose: () => void
}

export const SortModal: React.FC<SortModalProps> = ({ sortBy, onSelectSort, onClose }) => {
  const dialogRef = useModalDialog<HTMLDialogElement>(true)

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="sort-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none items-end justify-center border-0 bg-neutral-950/85 p-0 text-neutral-100 sm:items-center sm:p-4 open:flex"
    >
      <div className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto no-scrollbar rounded-t-lg sm:rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h2 id="sort-dialog-title" className="text-base font-semibold text-neutral-100">
              Sort
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Pick the order that matches the energy you have.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sort options"
            className="shrink-0 w-11 h-11 -mt-2 -mr-2 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <ul className="mt-2">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = sortBy === opt.id
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => onSelectSort(opt.id)}
                  aria-pressed={isSelected}
                  className={`w-full min-h-11 text-left px-3 py-3 rounded-md transition-colors ${
                    isSelected ? "bg-neutral-800 text-neutral-100" : "text-neutral-300 hover:bg-neutral-800/60"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-medium">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 shrink-0 text-neutral-100" aria-hidden="true" />
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-neutral-500">{opt.description}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 px-4 rounded-md border border-neutral-800 text-sm text-neutral-300 hover:text-neutral-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  )
}
