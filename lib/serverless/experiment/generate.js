import OpenAI from 'openai';
import { allowMethods } from '../../api-utils.js';

const defaultExperimentFromPrompt = (prompt = '') => {
  const subject = String(prompt || '').trim() || 'Chemistry Experiment';
  return {
    title: subject[0]?.toUpperCase() + subject.slice(1),
    aim: `To perform and understand ${subject}.`,
    theory: `${subject} is carried out to study reaction behavior, measurement workflow, and analytical interpretation under controlled lab conditions.`,
    apparatus: ['Beaker', 'Flask', 'Pipette', 'Burette'],
    chemicals: ['Distilled Water', 'Standard Solution', 'Indicator'],
    procedure: [
      'Prepare glassware and verify calibration.',
      'Measure sample and reagents as specified.',
      'Perform the experiment while recording each reading.',
      'Use the formula to compute final result and compare with expected value.'
    ],
    formula: 'N1V1 = N2V2',
    observationTable: [{ x: 1, y: 0, note: 'Initial reading' }],
    resultMethod: 'Calculate values using observation data and compare against standard.',
    graphType: 'x_vs_y',
    difficultyLevel: 'Intermediate',
    estimatedTime: '30-45 min',
    aiHints: ['Record meniscus at eye level.', 'Stir before taking each reading.'],
    badges: ['AI Creator'],
    equipment: ['beaker', 'flask', 'pipette', 'burette']
  };
};

const createClient = () => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_AI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: apiKey.startsWith('sk-or-') ? 'https://openrouter.ai/api/v1' : undefined
  });
};

const cleanStringList = (value, max = 50, len = 240) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || '').trim().slice(0, len)).filter(Boolean).slice(0, max);
};

const normalizeExperiment = (raw = {}, fallbackPrompt = '') => {
  const base = defaultExperimentFromPrompt(fallbackPrompt);
  const merged = { ...base, ...(raw || {}) };
  return {
    ...merged,
    title: String(merged.title || base.title).slice(0, 180),
    aim: String(merged.aim || base.aim).slice(0, 1000),
    theory: String(merged.theory || base.theory).slice(0, 6000),
    apparatus: cleanStringList(merged.apparatus),
    chemicals: cleanStringList(merged.chemicals),
    procedure: cleanStringList(merged.procedure, 150, 600),
    formula: String(merged.formula || base.formula).slice(0, 400),
    observationTable: Array.isArray(merged.observationTable) ? merged.observationTable.slice(0, 200).map((row, i) => ({
      x: Number.isFinite(Number(row?.x)) ? Number(row.x) : i + 1,
      y: Number.isFinite(Number(row?.y)) ? Number(row.y) : 0,
      note: String(row?.note || '').slice(0, 140)
    })) : [],
    resultMethod: String(merged.resultMethod || base.resultMethod).slice(0, 1000),
    graphType: String(merged.graphType || base.graphType).slice(0, 80),
    difficultyLevel: String(merged.difficultyLevel || base.difficultyLevel).slice(0, 40),
    estimatedTime: String(merged.estimatedTime || base.estimatedTime).slice(0, 40),
    aiHints: cleanStringList(merged.aiHints, 10, 240),
    badges: cleanStringList(merged.badges, 10, 80),
    equipment: cleanStringList(merged.equipment, 20, 80)
  };
};

async function generateWithAI(prompt) {
  const client = createClient();
  if (!client) return null;
  const completion = await client.chat.completions.create({
    model: (process.env.OPENAI_API_KEY || process.env.VITE_AI_API_KEY || '').startsWith('sk-or-') ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
    temperature: 0.5,
    max_tokens: 1400,
    messages: [
      {
        role: 'system',
        content: 'Generate a chemistry experiment as strict JSON only. Keys: title, aim, theory, apparatus, chemicals, procedure, formula, observationTable, resultMethod, graphType, difficultyLevel, estimatedTime, aiHints, badges, equipment.'
      },
      { role: 'user', content: `Create experiment for: ${prompt}` }
    ]
  });

  const content = String(completion?.choices?.[0]?.message?.content || '').trim();
  const jsonStart = content.indexOf('{');
  const jsonEnd = content.lastIndexOf('}');
  if (jsonStart < 0 || jsonEnd < jsonStart) return null;
  return JSON.parse(content.slice(jsonStart, jsonEnd + 1));
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

  try {
    let generated = null;
    try {
      generated = await generateWithAI(prompt);
    } catch {
      generated = null;
    }
    const experiment = normalizeExperiment(generated, prompt);
    return res.status(200).json({ experiment });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate experiment.', details: error?.message || 'Unknown error' });
  }
}
