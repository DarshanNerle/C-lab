import OpenAI from "openai";
const MASTER_SYSTEM_PROMPT_INLINE = `
You are a Chemistry Master Teacher AI with a PhD in Chemical Education.

## Universal Response Rules:
1. **No messy paragraphs.** Use headers (###), bullet points, and bold text.
2. **Sections**: 🔹 **Definition**, 🔹 **Explanation**, 🔹 **Formula**, 🔹 **Example**, 🔹 **Key Points**.
3. **Academic Tone**: Intelligent, supportive, and highly structured.
4. **Calculations**: Show Given -> Formula -> Step-by-step logic.
`;

const MINI_ASSISTANT_INSTRUCTION_INLINE = `
Mode: MINI (Copilot)
- Max 3 sections. Strictly under 200 words.
- Use: 🔹 **Definition**, 🔹 **Explanation**, 🔹 **Example**.
`;

const FULL_LEARNING_INSTRUCTION_INLINE = `
Mode: FULL (Deep Teaching)
- Deep molecular mechanisms.
- Add Sections: **Mechanism**, **Common Mistakes**, **Exam Tips**, **Applications**, **Summary**.
`;

// Initialize OpenAI/OpenRouter outside the handler to reuse the connection if container stays warm
const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_AI_API_KEY;

const openai = new OpenAI({
    apiKey: apiKey,
    // Support for OpenRouter if the key starts with sk-or-
    baseURL: apiKey?.startsWith('sk-or-') ? "https://openrouter.ai/api/v1" : undefined,
});

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
    }

    try {
        const { message, mode, level, topic, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        const modeInstruction = mode === "mini_assistant" ? MINI_ASSISTANT_INSTRUCTION_INLINE : FULL_LEARNING_INSTRUCTION_INLINE;

        // Ensure we handle history safely
        const formattedHistory = (Array.isArray(history) ? history : []).map(h => ({
            role: h.role === 'assistant' ? 'assistant' : 'user',
            content: String(h.content || '')
        }));

        const completion = await openai.chat.completions.create({
            model: apiKey?.startsWith('sk-or-') ? "openai/gpt-4o-mini" : "gpt-4o-mini",
            messages: [
                { role: "system", content: MASTER_SYSTEM_PROMPT_INLINE },
                { role: "system", content: `Mode Instructions: ${modeInstruction}` },
                { role: "system", content: `Student Level: ${level || 'High School'}` },
                { role: "system", content: `Current Topic: ${topic || 'General Chemistry'}` },
                ...formattedHistory,
                { role: "user", content: String(message) },
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        return res.status(200).json({
            reply: completion.choices[0].message.content,
        });

    } catch (error) {
        console.error("AI Serverless Error:", error.message);

        return res.status(500).json({
            error: "Neural interface synchronization failed.",
            details: error.message
        });
    }
}
