import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { MicroTask } from "../../types"
import { apiUntangleBrainDump } from "../../services/api"

export function useUntangle(onUntangled: (tasks: MicroTask[]) => void) {
  const [aiSummary, setAiSummary] = useState<string | null>(null)

  const untangleMutation = useMutation({
    mutationFn: ({ rawDump, energy }: { rawDump: string; energy: string }) =>
      apiUntangleBrainDump(rawDump, energy),
    onSuccess: (data) => {
      setAiSummary(data.summary)
      onUntangled(data.tasks)
    },
    onError: (error) => {
      console.error("Untangle failed:", error)
    },
  })

  const handleUntangle = async (rawDump: string, energyPreference: string) => {
    await untangleMutation.mutateAsync({ rawDump, energy: energyPreference })
  }

  return {
    aiSummary,
    clearAiSummary: () => setAiSummary(null),
    handleUntangle,
    isUntangling: untangleMutation.isPending,
  }
}
