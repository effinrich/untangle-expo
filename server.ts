import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface DeconstructedTask {
  id: string;
  title: string;
  firstPhysicalStep: string;
  estimatedMinutes: number;
  energyLevel: 'low' | 'medium' | 'high';
  category: string;
  whyItMatters: string;
  substeps?: string[];
}

// Audio Transcription endpoint using gemini-3.5-transcribe
app.post('/api/transcribe-audio', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      res.status(400).json({ error: 'audioBase64 payload is required' });
      return;
    }

    if (!apiKey) {
      res.json({
        text: "I have so many tasks today: need to respond to the dentist appointment, finish the quarterly budget for work, and clear my desk.",
      });
      return;
    }

    const cleanMime = mimeType || 'audio/webm';
    // Clean data if it contains data URI prefix
    const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          inlineData: {
            mimeType: cleanMime,
            data: base64Data,
          },
        },
        {
          text: 'Transcribe this spoken audio accurately. Output only the verbatim transcription text without conversational filler, intros, or summaries.',
        },
      ],
    });

    const transcription = response.text?.trim() || '';
    res.json({ text: transcription });
  } catch (err: any) {
    console.error('Error in /api/transcribe-audio:', err);
    res.status(500).json({
      error: 'Audio transcription failed',
      details: err?.message || String(err),
    });
  }
});

// 1. Untangle Brain Dump endpoint
app.post('/api/untangle', async (req, res) => {
  try {
    const { rawDump, userEnergyPreference } = req.body;

    if (!rawDump || typeof rawDump !== 'string' || !rawDump.trim()) {
      res.status(400).json({ error: 'Please provide a brain dump text.' });
      return;
    }

    if (!apiKey) {
      // Graceful fallback for offline / mock dev mode if API key is not present
      const fallbackTasks = generateFallbackUntangle(rawDump);
      res.json({
        summary: "Parsed from your thoughts into quick micro-actions.",
        tasks: fallbackTasks,
      });
      return;
    }

    const prompt = `You are an expert ADHD Executive Function coach and productivity architect.
The user just provided a chaotic, overwhelming "brain dump" of thoughts, tasks, worries, or to-dos.
ADHD brains get paralyzed by ambiguous, large tasks. Your job is to:
1. Untangle this into concrete, bite-sized MICRO-TASKS (ideally 3 to 20 minutes each).
2. For each task, extract the EXACT "First Physical Step" (the frictionless spark action, e.g. "Pick up your phone and open the banking app", "Open Chrome and search for John's email", "Stand up and grab a trash bag").
3. Assign realistic estimatedMinutes (e.g., 3, 5, 10, 15, 20, 25).
4. Assign energyLevel: "low" (brain fried/lazy), "medium" (standard), or "high" (requires hyperfocus/deep creativity).
5. Assign a concise priority category (e.g. Work, Personal, Health, Finance / Admin, Errands, Creative).
6. Assign priority: "high", "medium", or "low".
7. Give a 1-sentence "whyItMatters" that gives a quick dopamine reason or removes anxiety.
8. Break down any medium/larger task into 2-3 microscopic sequential substeps.

User's current state/energy preference: ${userEnergyPreference || 'all'}
User's raw brain dump:
"""
${rawDump}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "You transform chaotic ADHD thoughts into actionable, non-intimidating, high-clarity micro-steps.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A warm, validating 1-2 sentence assessment showing they are heard and everything is manageable.",
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING, description: "Short, punchy action-verb title" },
                  firstPhysicalStep: { type: Type.STRING, description: "The immediate physical micro-movement to start" },
                  estimatedMinutes: { type: Type.INTEGER, description: "Estimated time in minutes (3 to 30)" },
                  energyLevel: { type: Type.STRING, description: "'low', 'medium', or 'high'" },
                  category: { type: Type.STRING, description: "Category label such as Work, Personal, Health, Finance / Admin, Errands" },
                  priority: { type: Type.STRING, description: "'high', 'medium', or 'low'" },
                  whyItMatters: { type: Type.STRING, description: "Quick motivational or anxiety-reducing rationale" },
                  substeps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "2-3 micro mini-steps",
                  },
                },
                required: ['title', 'firstPhysicalStep', 'estimatedMinutes', 'energyLevel', 'category', 'whyItMatters'],
              },
            },
          },
          required: ['summary', 'tasks'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response generated by model');
    }

    const data = JSON.parse(text);
    // Ensure every task has an id
    if (Array.isArray(data.tasks)) {
      data.tasks = data.tasks.map((t: any, idx: number) => ({
        ...t,
        id: t.id || `task_${Date.now()}_${idx}`,
        energyLevel: ['low', 'medium', 'high'].includes(t.energyLevel) ? t.energyLevel : 'medium',
        estimatedMinutes: Math.max(1, Number(t.estimatedMinutes) || 10),
      }));
    }

    res.json(data);
  } catch (err: any) {
    console.error('Error in /api/untangle:', err);
    // Fallback if API call hits quota or fails
    const fallbackTasks = generateFallbackUntangle(req.body.rawDump || '');
    res.json({
      summary: "I've structured your brain dump into clean micro-steps.",
      tasks: fallbackTasks,
    });
  }
});

// 2. Micro-breakdown of a single stuck task
app.post('/api/breakdown-task', async (req, res) => {
  try {
    const { taskTitle, currentFirstStep } = req.body;
    if (!taskTitle) {
      res.status(400).json({ error: 'Task title is required' });
      return;
    }

    if (!apiKey) {
      res.json({
        microSteps: [
          `Open the exact app/tab for "${taskTitle}"`,
          "Spend just 60 seconds looking at the first screen",
          "Do one small 2-minute action and pause",
        ],
        easierFirstStep: `Touch your keyboard and open the relevant app for ${taskTitle}`,
      });
      return;
    }

    const prompt = `The user with ADHD is stuck on this task: "${taskTitle}".
Current first step: "${currentFirstStep || ''}".
The task still feels too intimidating or huge.
Break it down into 3-4 ridiculously tiny, friction-free micro-steps that require almost zero willpower to start.
Also provide an even easier physical first step.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            easierFirstStep: { type: Type.STRING },
            microSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['easierFirstStep', 'microSteps'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/breakdown-task:', err);
    res.json({
      microSteps: [
        `Open the tool or tab for ${req.body.taskTitle || 'this task'}`,
        "Set a 3-minute timer on your phone just to glance at it",
        "Type or do one tiny sentence/click",
      ],
      easierFirstStep: "Just sit down and open the screen, nothing more required",
    });
  }
});

// 3. Unstick Me (Emergency Decision Helper)
app.post('/api/unstick-me', async (req, res) => {
  try {
    const { tasks, currentMood } = req.body;
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      res.status(400).json({ error: 'No tasks provided' });
      return;
    }

    if (!apiKey) {
      const easiest = tasks[0];
      res.json({
        chosenTaskId: easiest.id,
        reasoning: "This has the lowest barrier to entry. Just doing 2 minutes of it will kickstart your dopamine loop.",
        sparkChallenge: `Do "${easiest.title}" for literally 2 minutes. If you still hate it after 2 minutes, you have permission to stop.`,
      });
      return;
    }

    const prompt = `A user with ADHD is experiencing executive paralysis / overwhelm.
They cannot decide what to work on.
Here are their uncompleted tasks:
${JSON.stringify(tasks.map((t) => ({ id: t.id, title: t.title, time: t.estimatedMinutes, energy: t.energyLevel })))}

User's reported state: "${currentMood || 'feeling stuck / low energy'}".

Pick the SINGLE best task for them right now. Bias heavily toward:
1. Low energy requirement OR shortest duration (a quick 3-5 min win).
2. High immediate dopamine/relief.
Provide warm, compassionate ADHD-friendly reasoning and a 2-minute "Spark Challenge".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chosenTaskId: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            sparkChallenge: { type: Type.STRING },
          },
          required: ['chosenTaskId', 'reasoning', 'sparkChallenge'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/unstick-me:', err);
    const first = req.body.tasks?.[0] || { id: 'fallback', title: 'Start simplest item' };
    res.json({
      chosenTaskId: first.id,
      reasoning: "Let's build quick momentum with the lowest friction step.",
      sparkChallenge: `Just do 2 minutes of "${first.title}". Zero pressure to finish.`,
    });
  }
});

// Helper for offline / fallback untangling
function generateFallbackUntangle(raw: string): DeconstructedTask[] {
  const lines = raw
    .split(/\n|,|\.|\band\b/i)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  if (lines.length === 0) {
    return [
      {
        id: `task_${Date.now()}_1`,
        title: 'Clear desk of empty cups',
        firstPhysicalStep: 'Grab the nearest mug and carry it to the sink',
        estimatedMinutes: 3,
        energyLevel: 'low',
        category: 'Home',
        whyItMatters: 'Clears visual noise so your brain feels lighter',
        substeps: ['Collect dishes', 'Take to kitchen', 'Drink a glass of water'],
      },
      {
        id: `task_${Date.now()}_2`,
        title: 'Review unread message from team',
        firstPhysicalStep: 'Unlock phone and tap the chat icon',
        estimatedMinutes: 5,
        energyLevel: 'low',
        category: 'Work',
        whyItMatters: 'Removes the background dread of people waiting',
        substeps: ['Open message', 'Send a quick 1-line acknowledgment'],
      },
    ];
  }

  return lines.slice(0, 6).map((line, idx) => ({
    id: `task_${Date.now()}_${idx}`,
    title: line.charAt(0).toUpperCase() + line.slice(1),
    firstPhysicalStep: `Open or step toward the first item needed for "${line.slice(0, 20)}..."`,
    estimatedMinutes: idx % 2 === 0 ? 5 : 15,
    energyLevel: idx === 0 ? 'low' : idx % 2 === 0 ? 'medium' : 'high',
    category: idx % 2 === 0 ? 'Quick Win' : 'Focus Project',
    whyItMatters: 'Completing this frees up mental RAM in your working memory',
    substeps: [`Step 1: Start 2-min timer`, `Step 2: Do the first tiny piece`],
  }));
}

// Dev & Production serving
async function main() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tangle server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
});
