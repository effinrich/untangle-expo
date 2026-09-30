import React from "react"
import { EnergyLevel, PriorityLevel } from "../../../../types"
import { QuickAddFormState } from "../hooks"

interface QuickAddFormProps {
  form: QuickAddFormState
  categoryNames: string[]
  onCancel: () => void
}

export const QuickAddForm: React.FC<QuickAddFormProps> = ({ form, categoryNames, onCancel }) => {
  return (
    <form
      onSubmit={form.handleCreateTask}
      className="p-4 bg-neutral-900/90 border border-amber-500/30 rounded-xl space-y-3"
    >
      <div className="text-xs font-semibold text-amber-300">Add a step</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="quick-add-title" className="text-[11px] text-neutral-400 block mb-1">
            Step title
          </label>
          <input
            id="quick-add-title"
            type="text"
            value={form.newTitle}
            onChange={(e) => form.setNewTitle(e.target.value)}
            placeholder="e.g. Call pharmacy for refill"
            required
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-base text-neutral-200 focus-visible:ring-2 focus-visible:ring-amber-400"
          />
        </div>
        <div>
          <label
            htmlFor="quick-add-first-step"
            className="text-[11px] text-neutral-400 block mb-1"
          >
            First physical action (the spark)
          </label>
          <input
            id="quick-add-first-step"
            type="text"
            value={form.newFirstStep}
            onChange={(e) => form.setNewFirstStep(e.target.value)}
            placeholder="e.g. Tap green phone icon and dial 1-800..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-base text-neutral-200 focus-visible:ring-2 focus-visible:ring-amber-400"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <div className="flex items-center gap-2">
          <label htmlFor="quick-add-category" className="text-[11px] text-neutral-400">
            Category
          </label>
          <select
            id="quick-add-category"
            value={form.newCategory}
            onChange={(e) => form.setNewCategory(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-base text-neutral-200 focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {categoryNames.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="quick-add-priority" className="text-[11px] text-neutral-400">
            Priority
          </label>
          <select
            id="quick-add-priority"
            value={form.newPriority}
            onChange={(e) => form.setNewPriority(e.target.value as PriorityLevel)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-base text-neutral-200 focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="quick-add-minutes" className="text-[11px] text-neutral-400">
            Minutes
          </label>
          <input
            id="quick-add-minutes"
            type="number"
            min={1}
            max={60}
            value={form.newMinutes}
            onChange={(e) => form.setNewMinutes(Number(e.target.value))}
            className="w-16 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-base text-neutral-200 text-center font-mono tabular-nums focus-visible:ring-2 focus-visible:ring-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="quick-add-energy" className="text-[11px] text-neutral-400">
            Energy
          </label>
          <select
            id="quick-add-energy"
            value={form.newEnergy}
            onChange={(e) => form.setNewEnergy(e.target.value as EnergyLevel)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-base text-neutral-200 focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <option value="low">Low Energy</option>
            <option value="medium">Medium</option>
            <option value="high">High Focus</option>
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 text-neutral-950 hover:bg-amber-300"
          >
            Save step
          </button>
        </div>
      </div>
    </form>
  )
}
