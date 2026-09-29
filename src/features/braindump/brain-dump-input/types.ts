import { BRAIN_DUMP_TEMPLATES } from "../../../data/seed-data"

export interface BrainDumpInputProps {
  onUntangle: (rawDump: string, energyPreference: string) => Promise<void>
  isLoading: boolean
}

export type BrainDumpTemplate = (typeof BRAIN_DUMP_TEMPLATES)[0]
