import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { MicroTask } from "../../types"
import { apiUntangleBrainDump } from "../../services/api"

export function useUntangle(onUntangled: (tasks: MicroTask[]) => void) {
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [untangleError, setUntangleError] = useState<string | null>(null)

  const untangleMutation = useMutation({
    mutationFn: ({ rawDump, energy }: { rawDump: string; energy: string }) =>
      apiUntangleBrainDump(rawDump, energy),
    onSuccess: (data) => {
      setAiSummary(data.summary)
      setUntangleError(null)
      onUntangled(data.tasks)
    },
    onError: (error) => {
      console.error("Untangle failed:", error)
      setUntangleError(
        (error as { status?: number } | null)?.status === 503
          ? "Untangle's model is busy right now. Try again in a moment."
          : "Couldn't reach Untangle right now. Your dump is still here.",
      )
    },
  })

  const handleUntangle = async (rawDump: string, energyPreference: string) => {
    try {
      await untangleMutation.mutateAsync({ rawDump, energy: energyPreference })
    } catch {
      // Surfaced via untangleError; the dump stays in the composer for retry.
    }
  }

  return {
    aiSummary,
    untangleError,
    clearAiSummary: () => setAiSummary(null),
    handleUntangle,
    isUntangling: untangleMutation.isPending,
  }
}
