import React from "react"
import { EnergyLevel } from "../../../../types"
import { ENERGY_LABELS, ENERGY_LEVELS } from "../consts"

interface BrainDumpEnergyControlProps {
  energyPreference: EnergyLevel
  onChange: (level: EnergyLevel) => void
}

// A select, not a pill row. Same information, one control, no emoji.
export const BrainDumpEnergyControl: React.FC<BrainDumpEnergyControlProps> = ({
  energyPreference,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="dump-energy" className="text-sm text-neutral-500">
        Battery
      </label>
      <select
        id="dump-energy"
        value={energyPreference}
        onChange={(e) => onChange(e.target.value as EnergyLevel)}
        className="min-h-11 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-base text-neutral-200 focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {ENERGY_LEVELS.map((level) => (
          <option key={level} value={level}>
            {ENERGY_LABELS[level]}
          </option>
        ))}
      </select>
    </div>
  )
}
