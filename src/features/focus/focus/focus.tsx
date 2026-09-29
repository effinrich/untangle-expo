import React, { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { useFocusSession, useParkingThought } from "./hooks"
import { FocusAmbientBar } from "./partials/focus-ambient-bar"
import { FocusParkingLot } from "./partials/focus-parking-lot"
import { FocusTaskSpark } from "./partials/focus-task-spark"
import { FocusTimer } from "./partials/focus-timer"
import { FocusTopBar } from "./partials/focus-top-bar"
import { FocusRadarModalProps } from "./types"

export const FocusRadarModal: React.FC<FocusRadarModalProps> = ({
  task,
  isOpen,
  onClose,
  onCompleteTask,
  parkingLot,
  onAddParkingLotItem,
  onDeleteParkingLotItem,
}) => {
  const session = useFocusSession({ task, isOpen, onCompleteTask, onClose })
  const { parkingThought, setParkingThought, handleAddThought } =
    useParkingThought(onAddParkingLotItem)
  const [showParkingLot, setShowParkingLot] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/95 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
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

        {/* Mark Done / Finish button */}
        <button
          type="button"
          onClick={session.complete}
          className="w-full max-w-md py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I Finished This! (Claim Dopamine)</span>
        </button>

        {showParkingLot && (
          <FocusParkingLot
            parkingLot={parkingLot}
            parkingThought={parkingThought}
            onChangeThought={setParkingThought}
            onAddThought={handleAddThought}
            onDeleteItem={onDeleteParkingLotItem}
          />
        )}
      </div>
    </div>
  )
}
