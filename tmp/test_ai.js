import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
console.log("API Key starts with:", apiKey?.substring(0, 10));

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: apiKey?.startsWith('sk-or-') ? "https://openrouter.ai/api/v1" : undefined,
});

async function test() {
    try {
        const completion = await openai.chat.completions.create({
            model: apiKey?.startsWith('sk-or-') ? "openai/gpt-4o-mini" : "gpt-4o-mini",
            messages: [{ role: "user", content: "Say hello" }],
        });
        console.log("Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("Test Error:", error.message);
        if (error.response) {
            console.error("Status:", error.status);
            console.error("Data:", error.data);
        }
    }
}

test();
