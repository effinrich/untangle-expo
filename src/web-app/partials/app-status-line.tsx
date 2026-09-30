import React from "react"
import { MicroTask } from "../../types"
import { countActive, countActiveInCategory } from "../utils"

interface AppStatusLineProps {
  tasks: MicroTask[]
  isSynced: boolean
}

// One quiet line where the hero card used to be. It states the load and the
// sync state, then gets out of the way of the list.
export const AppStatusLine: React.FC<AppStatusLineProps> = ({ tasks, isSynced }) => {
  const active = countActive(tasks)

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-4 border-b border-neutral-800">
      <p className="text-sm text-neutral-400">
        <span className="text-neutral-100 font-medium tabular-nums">{active}</span>
        {active === 1 ? " step left" : " steps left"}
        <span aria-hidden="true" className="text-neutral-700">
          {" · "}
        </span>
        {countActiveInCategory(tasks, "work")} work
        <span aria-hidden="true" className="text-neutral-700">
          {" · "}
        </span>
        {countActiveInCategory(tasks, "health")} health
      </p>
      <p className="text-xs text-neutral-500">{isSynced ? "Synced" : "On this device"}</p>
    </div>
  )
}
