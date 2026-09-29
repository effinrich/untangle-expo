import { postJson } from "./api-client"

export interface MicroTask {
  id: string
  userId?: string
  title: string
  firstPhysicalStep: string
  estimatedMinutes: number
  energyLevel: "low" | "medium" | "high"
  category: string
  priority?: "high" | "medium" | "low"
  whyItMatters: string
  substeps: {
    id: string
    text: string
    completed: boolean
  }[]
  completed: boolean
  completedAt?: string
  createdAt: string
}

export interface UnstickResult {
  chosenTaskId: string
  reasoning: string
  sparkChallenge: string
}

export async function untangleBrainDump(
  rawDump: string,
  userEnergyPreference: string = "all",
): Promise<{ summary: string; tasks: MicroTask[] }> {
  const data = await postJson<{ summary?: string; tasks?: Record<string, unknown>[] }>(
    "/api/untangle",
    { rawDump, userEnergyPreference },
  )
  return {
    summary: data.summary ?? "",
    tasks: (data.tasks || []).map((t: Record<string, unknown>, index: number) => ({
      id: (t.id as string) || `task_${Date.now()}_${index}`,
      title: (t.title as string) || "Untitled Action",
      firstPhysicalStep: (t.firstPhysicalStep as string) || "Open relevant tool or app",
      estimatedMinutes: Number(t.estimatedMinutes) || 10,
      energyLevel: (t.energyLevel as MicroTask["energyLevel"]) || "medium",
      category: (t.category as string) || "Personal",
      priority: (t.priority as MicroTask["priority"]) || "medium",
      whyItMatters: (t.whyItMatters as string) || "Frees up mental RAM",
      substeps: Array.isArray(t.substeps)
        ? t.substeps.map((sub: string | { text: string }, sIdx: number) => ({
            id: `sub_${Date.now()}_${index}_${sIdx}`,
            text: typeof sub === "string" ? sub : sub.text,
            completed: false,
          }))
        : [],
      completed: false,
      createdAt: new Date().toISOString(),
    })),
  }
}

export function transcribeAudio(audioBase64: string, mimeType: string = "audio/m4a") {
  return postJson<{ text?: string }>("/api/transcribe-audio", { audioBase64, mimeType })
}

export function unstickMe(tasks: MicroTask[], currentMood: string) {
  return postJson<UnstickResult>("/api/unstick-me", { tasks, currentMood })
}
