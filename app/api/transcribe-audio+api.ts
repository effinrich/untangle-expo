import { ai, apiKey } from "../../server/gemini"

// Audio Transcription endpoint using gemini-3.5-transcribe
export async function POST(request: Request) {
  try {
    const { audioBase64, mimeType } = await request.json().catch(() => ({}))
    if (!audioBase64) {
      return Response.json({ error: "audioBase64 payload is required" }, { status: 400 })
    }

    if (!apiKey) {
      return Response.json({
        text: "I have so many tasks today: need to respond to the dentist appointment, finish the quarterly budget for work, and clear my desk.",
      })
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
    return Response.json({ text: transcription })
  } catch (err: any) {
    console.error("Error in /api/transcribe-audio:", err)
    return Response.json(
      {
        error: "Audio transcription failed",
        details: err?.message || String(err),
      },
      { status: 500 },
    )
  }
}
