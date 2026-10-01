import React, { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { useModalDialog } from "../../../shared/hooks/use-modal-dialog"
import { useFocusSession, useParkingThought } from "./hooks"
import { FocusAmbientBar } from "./partials/focus-ambient-bar"
import { FocusParkingLot } from "./partials/focus-parking-lot"
import { FocusTaskSpark } from "./partials/focus-task-spark"
import { FocusTimer } from "./partials/focus-timer"
import { FocusTopBar } from "./partials/focus-top-bar"
import { FocusProps } from "./types"

export const Focus: React.FC<FocusProps> = ({
  task,
  isOpen,
  onClose,
  onCompleteTask,
  parkingLot,
  parkingLotError,
  onAddParkingLotItem,
  onDeleteParkingLotItem,
}) => {
  const session = useFocusSession({ task, isOpen, onCompleteTask, onClose })
  const dialogRef = useModalDialog<HTMLDialogElement>(isOpen)
  const { parkingThought, setParkingThought, handleAddThought } =
    useParkingThought(onAddParkingLotItem)
  const [showParkingLot, setShowParkingLot] = useState(false)

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="focus-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        session.close()
      }}
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-neutral-950/95 p-4 text-neutral-100 open:flex"
    >
      <div className="relative w-full max-w-2xl rounded-lg border border-neutral-800 bg-neutral-900 p-6 md:p-8 flex flex-col items-center text-center">
        <h2 id="focus-dialog-title" className="sr-only">
          One Thing Radar: {task.title}
        </h2>
        <FocusTopBar
          showParkingLot={showParkingLot}
          parkingLotCount={parkingLot.length}
          onToggleParkingLot={() => setShowParkingLot(!showParkingLot)}
          onClose={session.close}
        />

        <FocusTaskSpark task={task} />

        <FocusTimer
          secondsRemaining={session.secondsRemaining}
          isRunning={session.isRunning}
          onToggleRunning={session.toggleRunning}
          onAddMinutes={session.addMinutes}
          onReset={session.resetTimer}
        />

        <FocusAmbientBar
          ambientSound={session.ambientSound}
          volume={session.volume}
          onChangeSound={session.changeAmbientSound}
          onChangeVolume={session.changeVolume}
        />

        {/* The one action that matters here. Success colour, because it means done. */}
        <button
          type="button"
          onClick={session.complete}
          className="w-full max-w-md min-h-11 rounded-md bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-base transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          <span>I finished this</span>
        </button>

        {showParkingLot && (
          <FocusParkingLot
            parkingLot={parkingLot}
            error={parkingLotError}
            parkingThought={parkingThought}
            onChangeThought={setParkingThought}
            onAddThought={handleAddThought}
            onDeleteItem={onDeleteParkingLotItem}
          />
        )}
      </div>
    </dialog>
  )
}
