import React, { useState } from "react"
import { ArrowRight, Check, Loader2, X } from "lucide-react"
import { useModalDialog } from "../../../shared/hooks/use-modal-dialog"
import { MicroTask, UnstickResult } from "../../../types"
import { apiUnstickMe } from "../../../services/api"

interface UnstickMeModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: MicroTask[]
  onStartFocus: (task: MicroTask) => void
}

export const UnstickMeModal: React.FC<UnstickMeModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onStartFocus,
}) => {
  const [mood, setMood] = useState("Paralyzed / cannot pick where to start")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UnstickResult | null>(null)
  const dialogRef = useModalDialog<HTMLDialogElement>(isOpen)

  if (!isOpen) return null

  const incompleteTasks = tasks.filter((t) => !t.completed)

  const moodOptions = [
    "Paralyzed / cannot pick where to start",
    "Brain is completely fried (0% energy)",
    "Restless, distracted, opening 15 tabs",
    "Dreading a high-stakes thing",
  ]

  const handleDiagnose = async () => {
    if (incompleteTasks.length === 0) return
    setLoading(true)
    try {
      const res = await apiUnstickMe(incompleteTasks, mood)
      setResult(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const chosenTask =
    incompleteTasks.find((t) => t.id === result?.chosenTaskId) || incompleteTasks[0]

  const handleAcceptSpark = () => {
    if (chosenTask) {
      onStartFocus({
        ...chosenTask,
        estimatedMinutes: 2,
      })
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="unstick-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-neutral-950/95 p-4 text-neutral-100 open:flex"
    >
      <div className="relative w-full max-w-lg rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 id="unstick-dialog-title" className="text-lg text-neutral-100">
            Let Untangle pick
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close unstick assistant"
            className="shrink-0 w-11 h-11 -mt-2 -mr-2 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {incompleteTasks.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-base text-neutral-200">Nothing left to pick from</p>
            <p className="mt-2 text-sm text-neutral-500">
              Every step is done. Add a brain dump, or take the rest.
            </p>
          </div>
        ) : !result ? (
          <div>
            <p className="text-sm text-neutral-400">
              Deciding costs energy you may not have. Say how your brain feels and this picks the
              lowest-effort way in.
            </p>

            <fieldset className="mt-4">
              <legend className="text-sm text-neutral-500 mb-2">
                How does your brain feel right now?
              </legend>
              <div className="space-y-1">
                {moodOptions.map((opt) => {
                  const isSelected = mood === opt
                  return (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 min-h-11 px-3 rounded-md cursor-pointer transition-colors ${
                        isSelected ? "bg-neutral-800 text-neutral-100" : "text-neutral-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mood"
                        value={opt}
                        checked={isSelected}
                        onChange={() => setMood(opt)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 ${
                          isSelected
                            ? "border-neutral-100 bg-neutral-100 text-neutral-900"
                            : "border-neutral-600 text-transparent"
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span className="text-sm">{opt}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={handleDiagnose}
              disabled={loading}
              className="w-full min-h-11 mt-4 rounded-md bg-amber-400 text-neutral-950 font-semibold text-base hover:bg-amber-300 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />}
              <span>Pick one for me</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-neutral-800 p-4">
              <p className="text-sm text-neutral-500">Picked for you</p>
              <h3 className="mt-1 text-lg text-neutral-100">{chosenTask.title}</h3>
              <p className="mt-1 text-sm text-neutral-400">{result.reasoning}</p>
            </div>

            <div className="rounded-md border border-neutral-800 p-4">
              <p className="text-sm text-neutral-500">Two minutes, then you are free</p>
              <p className="mt-1 text-base text-neutral-200">{result.sparkChallenge}</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="min-h-11 px-4 rounded-md border border-neutral-800 text-sm text-neutral-300 hover:text-neutral-100 transition-colors"
              >
                Pick again
              </button>
              <button
                type="button"
                onClick={handleAcceptSpark}
                className="flex-1 min-h-11 rounded-md bg-amber-400 text-neutral-950 font-semibold text-base hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
              >
                <span>Start the two minutes</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  )
}
