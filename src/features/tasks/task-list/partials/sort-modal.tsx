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
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none items-end justify-center border-0 bg-neutral-950/80 p-0 text-neutral-100 sm:items-center sm:p-4 open:flex"
    >
      <div className="w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar">
        {/* Sheet header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
          <div>
            <h3
              id="sort-dialog-title"
              className="text-sm font-bold text-neutral-100 flex items-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Choose Mental State & Energy Sort</span>
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Pick the order that matches your current cognitive battery.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sort options"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Options list with full explanations */}
        <div className="space-y-2">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = sortBy === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectSort(opt.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? "bg-amber-400/10 border-amber-400/50 text-neutral-100 shadow-sm"
                    : "bg-neutral-950/60 border-neutral-800/80 text-neutral-300 hover:bg-neutral-950 hover:border-neutral-700"
                }`}
              >
                <span className="text-lg shrink-0 mt-0.5">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-100">{opt.label}</span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    {opt.description}
                  </p>
                  <div className="text-[10px] text-amber-400/90 mt-1 font-medium italic">
                    State: {opt.mentalState}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  )
}
