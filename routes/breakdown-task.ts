import { Router } from "express"
import { Type } from "@google/genai"
import { ai, apiKey } from "./gemini"

export const breakdownTaskRouter = Router()

// 2. Micro-breakdown of a single stuck task
breakdownTaskRouter.post("/breakdown-task", async (req, res) => {
  try {
    const { taskTitle, currentFirstStep } = req.body
    if (!taskTitle) {
      res.status(400).json({ error: "Task title is required" })
      return
    }

    if (!apiKey) {
      res.json({
        microSteps: [
          `Open the exact app/tab for "${taskTitle}"`,
          "Spend just 60 seconds looking at the first screen",
          "Do one small 2-minute action and pause",
        ],
        easierFirstStep: `Touch your keyboard and open the relevant app for ${taskTitle}`,
      })
      return
    }

    const prompt = `The user with ADHD is stuck on this task: "${taskTitle}".
Current first step: "${currentFirstStep || ""}".
The task still feels too intimidating or huge.
Break it down into 3-4 ridiculously tiny, friction-free micro-steps that require almost zero willpower to start.
Also provide an even easier physical first step.`

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            easierFirstStep: { type: Type.STRING },
            microSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["easierFirstStep", "microSteps"],
        },
      },
    })

    const parsed = JSON.parse(response.text || "{}")
    res.json(parsed)
  } catch (err: any) {
    console.error("Error in /api/breakdown-task:", err)
    res.json({
      microSteps: [
        `Open the tool or tab for ${req.body.taskTitle || "this task"}`,
        "Set a 3-minute timer on your phone just to glance at it",
        "Type or do one tiny sentence/click",
      ],
      easierFirstStep: "Just sit down and open the screen, nothing more required",
    })
  }
})
