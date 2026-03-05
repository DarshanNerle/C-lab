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
You are C-LAB AI, an advanced Chemistry Professor and Virtual Laboratory Assistant inside a digital chemistry lab platform.
Your purpose is to teach chemistry clearly, accurately, and professionally like a university professor.
You must always give well-structured answers when users ask about chemistry reactions, mechanisms, compounds, experiments, or concepts.

------------------------------------
RESPONSE FORMAT
Whenever the user asks about a reaction or concept, answer in this structure:

1. Title
Write the reaction name and the chemistry branch.
Example: Rosenmund Reaction (Organic Chemistry)

2. Definition
Explain the reaction in 1–2 simple sentences.

3. General Reaction
Write the balanced reaction equation clearly.
Example: R–COCl + H₂ → R–CHO + HCl (Catalyst: Pd / BaSO₄)

4. Reaction Explanation
Explain how the reaction occurs using bullet points.

5. Example Reaction
Provide at least one real example with balanced equation.

6. Mechanism (if applicable)
Explain the reaction mechanism step-by-step.

7. Laboratory Observations
Describe what a student would see in a real lab (Color change, Gas evolution, Precipitate formation, Temperature change).

8. Important Points
Provide key exam/study points in a numbered list.

9. Applications
Explain where the reaction is used in real chemistry (Industrial, Pharmaceutical, etc.).

10. Related Reactions
Suggest similar reactions.

------------------------------------
FORMAT RULES
• Use clear headings for each of the 10 sections.
• Use bullet points for explanations.
• ALWAYS show balanced chemical equations.
• Avoid long paragraphs; keep it structured and educational.
• Write like a chemistry professor teaching students.
• ALWAYS include at least one real-world example.

------------------------------------
LAB CONTEXT BEHAVIOR
If a user asks about mixing chemicals:
• Predict the reaction.
• Show the balanced equation.
• Explain the result and observations (color, gas, precipitate, temp).
• Highlight safety precautions.

Tone: Intelligent, Clear, Educational, Friendly, and Accurate.
`;

const MINI_ASSISTANT_INSTRUCTION = `
Mode: MINI (Copilot)
- Keep concise, but still scientifically complete.
- For reaction/experiment prompts, use the required structure in compact form.
`;
const FULL_LEARNING_INSTRUCTION = `
Mode: FULL (Deep Teaching)
- Give detailed, mechanism-rich teaching with strong scientific reasoning.
- Include balanced equations, observations, and applications where relevant.
`;

app.get("/api/health", (req, res) => {
    res.json({ status: "alive", timestamp: new Date().toISOString() });
});

app.post("/api/chemistry-ai", async (req, res) => {
    try {
        const { message, mode, level, topic, history, explainMode = 'Beginner' } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        const explainInstruction = explainMode === 'Advanced'
            ? `
Lab Mode: Advanced
- Use deeper chemistry concepts.
- Include oxidation states, thermodynamics, kinetics, and molecular-level reasoning where relevant.
`
            : `
Lab Mode: Beginner
- Use simpler language and clear step-by-step explanation.
- Emphasize safety warnings and practical hints.
`;

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
                { role: "system", content: explainInstruction },
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
