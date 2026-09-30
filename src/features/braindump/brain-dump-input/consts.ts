import { DEFAULT_CATEGORIES } from "../../../data/categories"
import { EnergyLevel } from "../../../types"

export const ALL_AREAS = "all"

export const ENERGY_LEVELS: EnergyLevel[] = ["low", "medium", "high"]

export const ENERGY_LABELS: Record<EnergyLevel, string> = {
  low: "Low energy",
  medium: "Medium energy",
  high: "Hyperfocus",
}

export const TARGET_AREA_CATEGORIES = DEFAULT_CATEGORIES.slice(0, 4)
