import { GoogleGenAI } from "@google/genai"

// Initialize Google GenAI
export const apiKey = process.env.GEMINI_API_KEY || ""
export const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
})
