import React from "react"
import { Volume2 } from "lucide-react"
import { AmbientSoundType } from "../../../../types"
import { AMBIENT_SOUND_LABELS, AMBIENT_SOUND_TYPES } from "../consts"

interface FocusAmbientBarProps {
  ambientSound: AmbientSoundType
  volume: number
  onChangeSound: (type: AmbientSoundType) => void
  onChangeVolume: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FocusAmbientBar: React.FC<FocusAmbientBarProps> = ({
  ambientSound,
  volume,
  onChangeSound,
  onChangeVolume,
}) => {
  return (
    <div className="w-full max-w-md bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mb-6">
      {/* Toggle buttons with a pressed state rather than role="radio": the
          arrow-key model is not implemented, and a role is a promise. */}
      <fieldset className="flex items-center gap-1.5 border-0 p-0 m-0 min-w-0">
        <legend className="sr-only">Ambient sound</legend>
        <span className="text-neutral-500 font-medium mr-1">ADHD Noise:</span>
        {AMBIENT_SOUND_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={ambientSound === type}
            onClick={() => onChangeSound(type)}
            className={`min-h-11 px-2 py-1 rounded-md transition-colors ${
              ambientSound === type
                ? "bg-neutral-800 text-amber-300 font-semibold border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {AMBIENT_SOUND_LABELS[type]}
          </button>
        ))}
      </fieldset>

      {ambientSound !== "none" && (
        <div className="flex items-center gap-2 shrink-0">
          <Volume2 className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={onChangeVolume}
            aria-label="Ambient volume"
            className="w-16 accent-amber-400"
          />
        </div>
      )}
    </div>
  )
}
