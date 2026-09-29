import confetti from "canvas-confetti"
import { EnergyLevel, PriorityLevel } from "../../types"
import { SortOptionConfig } from "./types"

export const SORT_OPTIONS: SortOptionConfig[] = [
  {
    id: "energy-asc",
    label: "Low to High Energy",
    shortLabel: "🔋 Low Energy First",
    icon: "🔋",
    description: "Start with lowest friction steps requiring almost zero willpower.",
    mentalState: "Brain is tired, foggy, or facing strong initiation resistance.",
  },
  {
    id: "energy-desc",
    label: "High to Low Energy",
    shortLabel: "🚀 Hyperfocus First",
    icon: "🚀",
    description: "Tackle heavy cognitive challenges while dopamine is surging.",
    mentalState: "Riding a hyperfocus wave or high morning motivation.",
  },
  {
    id: "time-asc",
    label: "Shortest Duration",
    shortLabel: "⚡ Quick Wins First",
    icon: "⚡",
    description: "Knock out 2-5 minute micro-tasks to trigger immediate momentum.",
    mentalState: "Need rapid positive reinforcement to unblock inertia.",
  },
  {
    id: "priority-desc",
    label: "Highest Priority",
    shortLabel: "🔥 Priority First",
    icon: "🔥",
    description: "Surface critical commitments and deadline-sensitive items.",
    mentalState: "Clear goal orientation without getting distracted by busywork.",
  },
  {
    id: "newest",
    label: "Recently Added",
    shortLabel: "🕒 Newest First",
    icon: "🕒",
    description: "Most recently untangled thoughts from your brain dump.",
    mentalState: "Working through your freshest stream of consciousness.",
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
  high: { text: "text-rose-400", label: "High Priority" },
  medium: { text: "text-amber-400", label: "Med Priority" },
  low: { text: "text-neutral-500", label: "Low Priority" },
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
