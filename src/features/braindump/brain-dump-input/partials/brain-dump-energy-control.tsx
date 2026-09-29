import React from "react"
import { EnergyLevel } from "../../../../types"
import { ENERGY_LABELS, ENERGY_LEVELS } from "../consts"

interface BrainDumpEnergyControlProps {
  energyPreference: EnergyLevel
  onChange: (level: EnergyLevel) => void
}

// Energy preference segmented control
export const BrainDumpEnergyControl: React.FC<BrainDumpEnergyControlProps> = ({
  energyPreference,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs self-start md:self-auto">
      <span className="text-neutral-500 px-2 py-1 select-none">Battery:</span>
      {ENERGY_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
            energyPreference === level
              ? "bg-neutral-800 text-amber-300 shadow-sm border border-neutral-700/60"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          {ENERGY_LABELS[level]}
        </button>
      ))}
    </div>
  )
}
