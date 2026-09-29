import React from "react"
import { BRAIN_DUMP_TEMPLATES } from "../../../../data/seed-data"
import { BrainDumpTemplate } from "../types"

interface BrainDumpSparksProps {
  activeTemplate: string | null
  onApplyTemplate: (tpl: BrainDumpTemplate) => void
}

// Template quick sparks
export const BrainDumpSparks: React.FC<BrainDumpSparksProps> = ({
  activeTemplate,
  onApplyTemplate,
}) => {
  return (
    <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
      <span className="text-neutral-500 whitespace-nowrap">Sparks:</span>
      {BRAIN_DUMP_TEMPLATES.map((tpl) => (
        <button
          key={tpl.id}
          type="button"
          onClick={() => onApplyTemplate(tpl)}
          className={`px-2.5 py-1 rounded-md border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTemplate === tpl.id
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : "border-neutral-800 bg-neutral-950/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
          }`}
        >
          <span>{tpl.title}</span>
        </button>
      ))}
    </div>
  )
}
