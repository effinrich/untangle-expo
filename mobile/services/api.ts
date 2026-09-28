import Constants from "expo-constants"
import { MicroTask, UnstickResult } from "../types"

// Resolves backend API URL (local dev or deployed Cloud Run)
const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  (typeof window !== "undefined" && window.location?.origin) ||
  "https://ais-dev-hlh4jxillgrxmqnwolrxfw-124269995328.us-east1.run.app"

export async function untangleBrainDump(
  rawDump: string,
  userEnergyPreference: string = "all",
): Promise<{ summary: string; tasks: MicroTask[] }> {
  const response = await fetch(`${API_BASE_URL}/api/untangle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawDump, userEnergyPreference }),
  })

  if (!response.ok) {
    throw new Error("Failed to untangle brain dump")
  }

  const data = await response.json()
  return {
    summary: data.summary,
    tasks: (data.tasks || []).map((t: Record<string, unknown>, index: number) => ({
      id: t.id || `task_${Date.now()}_${index}`,
      title: t.title || "Untitled Action",
      firstPhysicalStep: t.firstPhysicalStep || "Open relevant tool or app",
      estimatedMinutes: Number(t.estimatedMinutes) || 10,
      energyLevel: t.energyLevel || "medium",
      category: t.category || "Personal",
      priority: t.priority || "medium",
      whyItMatters: t.whyItMatters || "Frees up mental RAM",
      substeps: Array.isArray(t.substeps)
        ? t.substeps.map((sub: string, sIdx: number) => ({
            id: `sub_${Date.now()}_${index}_${sIdx}`,
            text: typeof sub === "string" ? sub : (sub as { text: string }).text,
            completed: false,
          }))
        : [],
      completed: false,
      createdAt: new Date().toISOString(),
    })),
  }
}

export async function transcribeAudio(audioBase64: string, mimeType: string = "audio/m4a") {
  const response = await fetch(`${API_BASE_URL}/api/transcribe-audio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64, mimeType }),
  })

  if (!response.ok) {
    throw new Error("Audio transcription failed")
  }

  return response.json()
}

export async function unstickMe(tasks: MicroTask[], currentMood: string): Promise<UnstickResult> {
  const response = await fetch(`${API_BASE_URL}/api/unstick-me`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tasks, currentMood }),
  })

  if (!response.ok) {
    throw new Error("Unstick recommendation failed")
  }

  return response.json()
}

export async function breakdownTask(
  taskTitle: string,
  currentFirstStep?: string,
): Promise<{ easierFirstStep: string; microSteps: string[] }> {
  const res = await fetch(`${API_BASE_URL}/api/breakdown-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskTitle, currentFirstStep }),
  })

  if (!res.ok) {
    throw new Error("Failed to break down task")
  }

  return res.json()
}

// Aliases for compatibility with src/ code
export const apiUntangleBrainDump = untangleBrainDump;
export const apiBreakdownTask = breakdownTask;
export const apiUnstickMe = unstickMe;
export { MicroTask } from '../types'
