import { SortType } from "./types"

export const ALL_AREAS = "All areas"

export const SORT_OPTIONS: { id: SortType; label: string; description: string }[] = [
  {
    id: "energy-asc",
    label: "Low energy first",
    description: "Easiest steps on top when you're running low",
  },
  {
    id: "energy-desc",
    label: "High energy first",
    description: "Big stuff on top while you're charged up",
  },
  { id: "time-asc", label: "Quickest first", description: "Short wins to build momentum" },
]

export const ENERGY_ORDER = { low: 1, medium: 2, high: 3 }

export const EXAMPLE_DUMP =
  "Need to call the dentist, the kitchen is a mess, reply to Jordan about the budget, and renew my car insurance before Friday."

export const SKELETON_ROWS = [0, 1, 2]
