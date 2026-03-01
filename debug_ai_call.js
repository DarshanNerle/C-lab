import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: apiKey?.startsWith('sk-or-') ? "https://openrouter.ai/api/v1" : undefined,
});

async function test() {
    console.log("Using API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");
    try {
        const completion = await openai.chat.completions.create({
            model: apiKey?.startsWith('sk-or-') ? "openai/gpt-4o-mini" : "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Hello" }
            ],
            temperature: 0.7,
        });
        console.log("AI Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("DEBUG ERROR:", error.message);
        if (error.stack) console.error(error.stack);
    }
}

test();
