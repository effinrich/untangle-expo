import { BatteryMedium, Brain, Crosshair } from "../../theme/icons"

export const PAGES = [
  {
    id: "dump",
    icon: Brain,
    title: "Dump it all out",
    body: "Type or say everything swirling in your head. Untangle turns the mess into tiny steps you can start in under 2 minutes.",
  },
  {
    id: "energy",
    icon: BatteryMedium,
    title: "Match your energy",
    body: "Running on empty? Put the easiest steps first. Charged up? Go after the big ones.",
  },
  {
    id: "focus",
    icon: Crosshair,
    title: "One thing at a time",
    body: "Focus on a single step with a timer. Park stray thoughts so they don't pull you away.",
  },
] as const
