import { ActiveView } from "./types"

export const RESET_TO_SEED_PROMPT = "Load fresh sample ADHD tasks with priority categories?"

export const NAV_ITEMS: { view: ActiveView; label: string }[] = [
  { view: "all", label: "Workspace" },
  { view: "dump", label: "Brain Dump" },
  { view: "tasks", label: "Micro-Tasks" },
  { view: "momentum", label: "Momentum Ledger" },
]
