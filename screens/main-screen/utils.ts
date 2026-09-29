import { caseWhen, eq, type lower } from "@tanstack/db"
import { MicroTask } from "../../services/api"
import { ALL_AREAS, ENERGY_ORDER, SORT_OPTIONS } from "./consts"
import { SortType } from "./types"

type QueryExpression = Parameters<typeof lower>[0]

export function energyRank(energyLevel: QueryExpression) {
  return caseWhen(
    eq(energyLevel, "low"),
    ENERGY_ORDER.low,
    eq(energyLevel, "medium"),
    ENERGY_ORDER.medium,
    ENERGY_ORDER.high,
  )
}

export function areasFor(tasks: MicroTask[]): string[] {
  return [ALL_AREAS, ...new Set(tasks.map((t) => t.category))]
}

export function viewSummary(sortBy: SortType, area: string): string {
  const sortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? ""
  return `${sortLabel} · ${area}`
}
