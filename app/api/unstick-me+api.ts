import { Type } from "@google/genai"
import { ai, apiKey } from "../../server/gemini"

// 3. Unstick Me (Emergency Decision Helper)
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  try {
    const { tasks, currentMood } = body
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return Response.json({ error: "No tasks provided" }, { status: 400 })
    }

    if (!apiKey) {
      const easiest = tasks[0]
      return Response.json({
        chosenTaskId: easiest.id,
        reasoning:
          "This has the lowest barrier to entry. Just doing 2 minutes of it will kickstart your dopamine loop.",
        sparkChallenge: `Do "${easiest.title}" for literally 2 minutes. If you still hate it after 2 minutes, you have permission to stop.`,
      })
    }

    const prompt = `A user with ADHD is experiencing executive paralysis / overwhelm.
They cannot decide what to work on.
Here are their uncompleted tasks:
${JSON.stringify(tasks.map((t) => ({ id: t.id, title: t.title, time: t.estimatedMinutes, energy: t.energyLevel })))}

User's reported state: "${currentMood || "feeling stuck / low energy"}".

Pick the SINGLE best task for them right now. Bias heavily toward:
1. Low energy requirement OR shortest duration (a quick 3-5 min win).
2. High immediate dopamine/relief.
Provide warm, compassionate ADHD-friendly reasoning and a 2-minute "Spark Challenge".`

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chosenTaskId: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            sparkChallenge: { type: Type.STRING },
          },
          required: ["chosenTaskId", "reasoning", "sparkChallenge"],
        },
      },
    })

    const parsed = JSON.parse(response.text || "{}")
    return Response.json(parsed)
  } catch (err: any) {
    console.error("Error in /api/unstick-me:", err)
    const first = body.tasks?.[0] || {
      id: "fallback",
      title: "Start simplest item",
    }
    return Response.json({
      chosenTaskId: first.id,
      reasoning: "Let's build quick momentum with the lowest friction step.",
      sparkChallenge: `Just do 2 minutes of "${first.title}". Zero pressure to finish.`,
    })
  }
}
