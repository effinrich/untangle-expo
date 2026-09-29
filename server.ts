import "dotenv/config"
import express from "express"
import { createServer as createViteServer } from "vite"
import path from "path"
import { fileURLToPath } from "url"
import { breakdownTaskRouter } from "./routes/breakdown-task"
import { transcribeAudioRouter } from "./routes/transcribe-audio"
import { unstickMeRouter } from "./routes/unstick-me"
import { untangleRouter } from "./routes/untangle"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

app.use(express.json({ limit: "10mb" }))
app.use("/api", transcribeAudioRouter, untangleRouter, breakdownTaskRouter, unstickMeRouter)

// Dev & Production serving
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    })
    app.use(vite.middlewares)
  } else {
    app.use(express.static(path.join(__dirname, "dist")))
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"))
    })
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Untangle server running on http://0.0.0.0:${PORT}`)
  })
}

main().catch((err) => {
  console.error("Failed to start server:", err)
})
