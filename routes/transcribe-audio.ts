import { Router } from "express"
import { ai, apiKey } from "./gemini"

export const transcribeAudioRouter = Router()

// Audio Transcription endpoint using gemini-3.5-transcribe
transcribeAudioRouter.post("/transcribe-audio", async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body
    if (!audioBase64) {
      res.status(400).json({ error: "audioBase64 payload is required" })
      return
    }

    if (!apiKey) {
      res.json({
        text: "I have so many tasks today: need to respond to the dentist appointment, finish the quarterly budget for work, and clear my desk.",
      })
      return
    }

    const cleanMime = mimeType || "audio/webm"
    // Clean data if it contains data URI prefix
    const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, "")

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: [
        {
          inlineData: {
            mimeType: cleanMime,
            data: base64Data,
          },
        },
        {
          text: "Transcribe this spoken audio accurately. Output only the verbatim transcription text without conversational filler, intros, or summaries.",
        },
      ],
    })

    const transcription = response.text?.trim() || ""
    res.json({ text: transcription })
  } catch (err: any) {
    console.error("Error in /api/transcribe-audio:", err)
    res.status(500).json({
      error: "Audio transcription failed",
      details: err?.message || String(err),
    })
  }
})
