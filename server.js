import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Log every request
app.use((req, res, next) => {
    const log = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${JSON.stringify(req.body)}\n`;
    fs.appendFileSync(path.join(__dirname, 'server_access.log'), log);
    next();
});

// Initialize OpenAI/OpenRouter
const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_AI_API_KEY;

const openai = new OpenAI({
    apiKey: apiKey,
    // Support for OpenRouter if the key starts with sk-or-
    baseURL: apiKey?.startsWith('sk-or-') ? "https://openrouter.ai/api/v1" : undefined,
});

const MASTER_SYSTEM_PROMPT = `
You are an expert Chemistry Professor with 25+ years of teaching experience.

Role:
- Teach chemistry clearly and step-by-step
- Adjust explanation depth based on student level
- Solve numerical problems with full working
- Explain reaction mechanisms logically
- Provide examples and practice questions
- Encourage understanding

Teaching Rules:
1. Start with a simple definition.
2. Then explain the core concept.
3. Explain WHY it happens.
4. Provide formulas clearly formatted.
5. Give at least one example.
6. Offer a short practice question.

If solving numerical:
- Write Given
- Write Required
- Write Formula
- Substitute values
- Show calculations
- Give final answer with units

Safety Rule:
Do NOT provide dangerous chemical synthesis instructions.
Only provide educational explanations.
`;

const MINI_ASSISTANT_INSTRUCTION = "Keep responses concise (max 8 lines). Give clear direct explanation. Offer option for deeper explanation. If conversation becomes long, suggest switching to Full Learning Mode.";
const FULL_LEARNING_INSTRUCTION = "Give structured teaching format: TITLE, Definition, Core Explanation, Why It Happens, Formula, Example, Practice Question. Be detailed but clear. Encourage follow-up questions.";

app.get("/api/health", (req, res) => {
    res.json({ status: "alive", timestamp: new Date().toISOString() });
});

app.post("/api/chemistry-ai", async (req, res) => {
    try {
        const { message, mode, level, topic, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        const modeInstruction = mode === "mini_assistant" ? MINI_ASSISTANT_INSTRUCTION : FULL_LEARNING_INSTRUCTION;

        // Ensure we handle history safely
        const formattedHistory = (Array.isArray(history) ? history : []).map(h => ({
            role: h.role === 'assistant' ? 'assistant' : 'user',
            content: String(h.content || '')
        }));

        const completion = await openai.chat.completions.create({
            model: apiKey?.startsWith('sk-or-') ? "openai/gpt-4o-mini" : "gpt-4o-mini",
            messages: [
                { role: "system", content: MASTER_SYSTEM_PROMPT },
                { role: "system", content: `Mode Instructions: ${modeInstruction}` },
                { role: "system", content: `Student Level: ${level || 'High School'}` },
                { role: "system", content: `Current Topic: ${topic || 'General Chemistry'}` },
                ...formattedHistory,
                { role: "user", content: String(message) },
            ],
            temperature: 0.7,
        });

        res.json({
            reply: completion.choices[0].message.content,
        });
    } catch (error) {
        console.error("AI Server Error:", error.message);

        const logEntry = `[${new Date().toISOString()}] AI Error: ${error.message}\n` +
            `Stack: ${error.stack}\n\n`;

        try {
            fs.appendFileSync(path.join(__dirname, 'server_debug.log'), logEntry);
        } catch (logErr) {
            console.error("Critical: Logging to file failed:", logErr.message);
        }

        res.status(500).json({
            error: "Neural interface synchronization failed.",
            details: error.message
        });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`C-Lab AI Backend active on http://localhost:${PORT}`);
});
