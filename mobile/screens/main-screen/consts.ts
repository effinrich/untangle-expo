import { MicroTask } from "../../services/api"
import { SortType } from "./types"

export const SEED_TASKS: MicroTask[] = [
  {
    id: "seed-1",
    title: "Respond to dentist appointment confirmation",
    firstPhysicalStep: "Unlock phone and open text message from Dr. Miller",
    estimatedMinutes: 3,
    energyLevel: "low",
    category: "Health",
    priority: "high",
    whyItMatters: "Guarantees your slot and stops the nagging feeling",
    substeps: [],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    title: "Draft quarterly budget email to Jordan",
    firstPhysicalStep: "Open email app and type Jordan into To: field",
    estimatedMinutes: 15,
    energyLevel: "medium",
    category: "Work",
    priority: "high",
    whyItMatters: "Unblocks team deliverable",
    substeps: [],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-3",
    title: "Clear 3 empty coffee mugs off desk",
    firstPhysicalStep: "Stand up and pick up the blue mug",
    estimatedMinutes: 4,
    energyLevel: "low",
    category: "Personal",
    priority: "low",
    whyItMatters: "Clears cognitive visual noise",
    substeps: [],
    completed: false,
    createdAt: new Date().toISOString(),
  },
]

export const CATEGORIES = ["All", "Work", "Personal", "Health", "Finance", "Errands"]

export const SORT_OPTIONS: { id: SortType; label: string }[] = [
  { id: "energy-asc", label: "🔋 Low Energy First" },
  { id: "energy-desc", label: "🚀 Hyperfocus Surge" },
  { id: "time-asc", label: "⚡ Quick Wins (<5m)" },
]

export const ENERGY_ORDER = { low: 1, medium: 2, high: 3 }
