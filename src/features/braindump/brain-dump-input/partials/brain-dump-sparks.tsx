import React from "react"
import { BRAIN_DUMP_TEMPLATES } from "../../../../data/seed-data"
import { BrainDumpTemplate } from "../types"

interface BrainDumpSparksProps {
  activeTemplate: string | null
  onApplyTemplate: (tpl: BrainDumpTemplate) => void
}

// Starting examples, as a select. Four bordered chips became one control.
export const BrainDumpSparks: React.FC<BrainDumpSparksProps> = ({
  activeTemplate,
  onApplyTemplate,
}) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="dump-example" className="text-sm text-neutral-500">
        Start from
      </label>
      <select
        id="dump-example"
        value={activeTemplate ?? ""}
        onChange={(e) => {
          const template = BRAIN_DUMP_TEMPLATES.find((t) => t.id === e.target.value)
          if (template) onApplyTemplate(template)
        }}
        className="min-h-11 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-base text-neutral-200 focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <option value="">Nothing, I&rsquo;ll type</option>
        {BRAIN_DUMP_TEMPLATES.map((tpl) => (
          <option key={tpl.id} value={tpl.id}>
            {tpl.title}
          </option>
        ))}
      </select>
    </div>
  )
}
