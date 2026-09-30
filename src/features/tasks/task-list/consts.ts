import confetti from "canvas-confetti"
import { EnergyLevel, PriorityLevel } from "../../../types"
import { SortOptionConfig } from "./types"

export const SORT_OPTIONS: SortOptionConfig[] = [
  {
    id: "energy-asc",
    label: "Low to high energy",
    description: "Start with the lowest-friction steps, requiring almost no willpower.",
    mentalState: "Brain is tired, foggy, or facing strong initiation resistance.",
  },
  {
    id: "energy-desc",
    label: "High to low energy",
    description: "Tackle the heavy cognitive work while it is available.",
    mentalState: "Riding a hyperfocus wave or high morning motivation.",
  },
  {
    id: "time-asc",
    label: "Shortest first",
    description: "Knock out the 2 to 5 minute steps to build momentum.",
    mentalState: "Need rapid positive reinforcement to unblock inertia.",
  },
  {
    id: "priority-desc",
    label: "Highest priority",
    description: "Surface critical commitments and deadline-sensitive items.",
    mentalState: "Clear goal orientation without getting pulled into busywork.",
  },
  {
    id: "newest",
    label: "Recently added",
    description: "The freshest thoughts from your last brain dump.",
    mentalState: "Working through your most recent stream of consciousness.",
  },
]

export const energyValues: Record<EnergyLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

export const priorityValues: Record<PriorityLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

export const energyColors: Record<EnergyLevel, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-rose-400",
}

export const priorityStyles: Record<PriorityLevel, { text: string; label: string }> = {
  high: { text: "text-rose-400", label: "High priority" },
  medium: { text: "text-amber-400", label: "Medium priority" },
  low: { text: "text-neutral-500", label: "Low priority" },
}

export const priorityCycle: Record<PriorityLevel, PriorityLevel> = {
  high: "medium",
  medium: "low",
  low: "high",
}

export const completionConfetti: confetti.Options = {
  particleCount: 45,
  spread: 55,
  origin: { y: 0.75 },
  colors: ["#F59E0B", "#10B981", "#6366F1", "#EC4899"],
  disableForReducedMotion: true,
}
