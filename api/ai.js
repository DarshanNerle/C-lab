import OpenAI from 'openai';

const MASTER_SYSTEM_PROMPT = `
You are a Chemistry Master Teacher AI with a PhD in Chemical Education.
Universal Response Rules:
1. No messy paragraphs. Use headers (###), bullet points, and bold text.
2. Sections: Definition, Explanation, Formula, Example, Key Points.
3. Academic Tone: Intelligent, supportive, and highly structured.
4. Calculations: Show Given -> Formula -> Step-by-step logic.
`;

const EXPLAIN_MODES = {
  Beginner: 'Tone: Simplistic. Use analogies. Avoid overly complex jargon. Explain concepts like you are talking to a 10th grader.',
  Exam: 'Tone: Focused. Highlight key definitions and common exam questions. Use bullet points for Must-Know facts.',
  Advanced: 'Tone: Rigorous. Use molecular orbital theory, thermodynamics, and high-level kinetics where applicable.',
  Research: 'Tone: Professional/Academic. Discuss current applications, literature-style mechanisms, and experimental challenges.'
};

const MINI_INSTRUCTION = 'Mode: MINI (Copilot). Max 3 sections. Strictly under 200 words. Use: Definition, Explanation, Example.';
const FULL_INSTRUCTION = 'Mode: FULL (Deep Teaching). Deep molecular mechanisms. Add Sections: Mechanism, Common Mistakes, Exam Tips, Applications, Summary.';

function createClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  const isOpenRouter = apiKey?.startsWith('sk-or-');

  return new OpenAI({
    apiKey,
    baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[AI] Missing OPENAI_API_KEY');
    return res.status(500).json({ error: 'AI service is not configured.' });
  }

  try {
    const { message, mode, level, topic, history, explainMode = 'Beginner' } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const isOpenRouter = apiKey.startsWith('sk-or-');
    const ai = createClient();
    const normalizedMode = mode === 'full_learning' ? 'full_learning' : 'mini_assistant';
    const isMini = normalizedMode === 'mini_assistant';

    const levelInstruction = EXPLAIN_MODES[explainMode] || EXPLAIN_MODES.Beginner;
    const modeInstruction = isMini ? MINI_INSTRUCTION : FULL_INSTRUCTION;

    const formattedHistory = (Array.isArray(history) ? history : [])
      .map((item) => ({
        role: item?.role === 'assistant' ? 'assistant' : 'user',
        content: String(item?.content || '').trim()
      }))
      .filter((item) => item.content)
      .slice(-8);

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 45000);

    const completion = await ai.chat.completions.create(
      {
        model: isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: MASTER_SYSTEM_PROMPT },
          { role: 'system', content: `Explain Mode: ${levelInstruction}` },
          { role: 'system', content: `Instructions: ${modeInstruction}` },
          {
            role: 'system',
            content: `Context: Student is at ${level || 'High School'} level, studying ${topic || 'General Chemistry'}.`
          },
          ...formattedHistory,
          { role: 'user', content: message.trim() }
        ],
        temperature: 0.6,
        max_tokens: isMini ? 300 : 1000,
        stream: false
      },
      {
        signal: timeoutController.signal
      }
    );

    clearTimeout(timeoutId);

    const reply = String(completion?.choices?.[0]?.message?.content || '').trim();
    if (!reply) {
      return res.status(502).json({ error: 'AI returned an empty response.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[AI] API error', {
      name: error?.name,
      status: error?.status,
      message: error?.message
    });

    if (error?.name === 'AbortError') {
      return res.status(504).json({ error: 'AI request timed out. Please try again with a shorter query.' });
    }

    if (error?.status === 401) {
      return res.status(401).json({ error: 'Invalid API Key' });
    }

    return res.status(500).json({ error: 'AI failed to respond. Please try again.' });
  }
}
