import OpenAI from "openai";

const MASTER_SYSTEM_PROMPT_INLINE = `
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

const MINI_ASSISTANT_INSTRUCTION_INLINE = `
Mode: MINI (Copilot)
- Keep concise, but still scientifically complete.
- For reaction/experiment prompts, use the required structure in compact form.
`;

const FULL_LEARNING_INSTRUCTION_INLINE = `
Mode: FULL (Deep Teaching)
- Give detailed, mechanism-rich teaching with strong scientific reasoning.
- Include balanced equations, observations, and applications where relevant.
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
                { role: "system", content: explainInstruction },
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
