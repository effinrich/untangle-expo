import React from "react"
import { EnergyLevel } from "../../../../types"
import { BrainDumpEnergyControl } from "./brain-dump-energy-control"

interface BrainDumpHeaderProps {
  energyPreference: EnergyLevel
  onChangeEnergy: (level: EnergyLevel) => void
}

export const BrainDumpHeader: React.FC<BrainDumpHeaderProps> = ({
  energyPreference,
  onChangeEnergy,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-100 tracking-tight flex items-center gap-2">
          <span>Stream of Consciousness Dump</span>
          <span className="text-xs text-neutral-500 font-normal">
            Type or speak with Gemini 3.5 audio transcribe
          </span>
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Do not organize yet. Dump every thought, chore, worry, or half-baked idea. AI will
          categorize and slice it into micro-steps.
        </p>
      </div>

      <BrainDumpEnergyControl energyPreference={energyPreference} onChange={onChangeEnergy} />
    </div>
  )
}
