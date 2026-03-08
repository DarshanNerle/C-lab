export const SUPPORTED_UPLOAD_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const EQUIPMENT_LIBRARY = [
  { id: 'beaker', label: 'Beaker' },
  { id: 'burette', label: 'Burette' },
  { id: 'flask', label: 'Flask' },
  { id: 'ph_meter', label: 'pH Meter' },
  { id: 'conductivity_meter', label: 'Conductivity Meter' },
  { id: 'pipette', label: 'Pipette' },
  { id: 'magnetic_stirrer', label: 'Magnetic Stirrer' },
  { id: 'indicator_bottle', label: 'Indicator Bottle' },
  { id: 'viscometer', label: 'Viscometer' }
];

const MIME_TO_EXTENSION = {
  'text/plain': 'txt',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
};

export const ensureExperimentShape = (raw = {}) => ({
  title: String(raw.title || '').trim(),
  aim: String(raw.aim || '').trim(),
  theory: String(raw.theory || '').trim(),
  apparatus: Array.isArray(raw.apparatus) ? raw.apparatus.map((item) => String(item).trim()).filter(Boolean) : [],
  chemicals: Array.isArray(raw.chemicals) ? raw.chemicals.map((item) => String(item).trim()).filter(Boolean) : [],
  procedure: Array.isArray(raw.procedure) ? raw.procedure.map((item) => String(item).trim()).filter(Boolean) : [],
  formula: String(raw.formula || '').trim(),
  observationTable: Array.isArray(raw.observationTable)
    ? raw.observationTable.map((row, index) => ({
      x: Number.isFinite(Number(row?.x)) ? Number(row.x) : index + 1,
      y: Number.isFinite(Number(row?.y)) ? Number(row.y) : 0,
      note: String(row?.note || '').trim()
    }))
    : [],
  resultMethod: String(raw.resultMethod || '').trim(),
  graphType: String(raw.graphType || 'x_vs_y').trim(),
  difficultyLevel: String(raw.difficultyLevel || 'Intermediate').trim(),
  estimatedTime: String(raw.estimatedTime || '30-45 min').trim(),
  aiHints: Array.isArray(raw.aiHints) ? raw.aiHints.map((item) => String(item).trim()).filter(Boolean) : [],
  badges: Array.isArray(raw.badges) ? raw.badges.map((item) => String(item).trim()).filter(Boolean) : [],
  equipment: Array.isArray(raw.equipment) ? raw.equipment.map((item) => String(item).trim()).filter(Boolean) : []
});

export const makeExperimentId = (existing = []) => {
  const maxId = (Array.isArray(existing) ? existing : []).reduce((max, exp) => {
    const match = String(exp?.id || '').match(/^exp_(\d+)$/);
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);
  return `exp_${String(maxId + 1).padStart(3, '0')}`;
};

export const normalizeUploadFileName = (file) => {
  if (!file?.name) return 'uploaded_experiment.txt';
  return file.name.trim();
};

export const validateUploadFile = (file) => {
  if (!file) return 'Please select a file.';
  const type = String(file.type || '').trim();
  const extension = String(file.name || '').split('.').pop()?.toLowerCase();
  const derivedType = Object.entries(MIME_TO_EXTENSION).find(([, ext]) => ext === extension)?.[0];
  const safeType = type || derivedType || '';
  if (!SUPPORTED_UPLOAD_TYPES.includes(safeType)) {
    return 'Unsupported file format. Use PDF, DOC, DOCX, or TXT.';
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return 'File size exceeds 10MB limit.';
  }
  return '';
};

const extractPdfText = async (arrayBuffer) => {
  const decoded = new TextDecoder('latin1').decode(arrayBuffer);
  const textChunks = [];
  const stringMatches = decoded.match(/\((?:\\.|[^\\)])*\)/g) || [];
  stringMatches.forEach((chunk) => {
    const cleaned = chunk
      .slice(1, -1)
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\/g, '');
    if (/[A-Za-z]{3,}/.test(cleaned)) textChunks.push(cleaned);
  });
  return textChunks.join('\n');
};

const extractDocLikeText = async (arrayBuffer) => {
  const decoded = new TextDecoder('latin1').decode(arrayBuffer);
  const xmlText = decoded
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return xmlText;
};

export const readUploadedExperimentText = async (file) => {
  const extension = String(file?.name || '').split('.').pop()?.toLowerCase();
  if (extension === 'txt' || file.type === 'text/plain') {
    return file.text();
  }
  const buffer = await file.arrayBuffer();
  if (extension === 'pdf' || file.type === 'application/pdf') {
    return extractPdfText(buffer);
  }
  return extractDocLikeText(buffer);
};

export const calculateFormulaResult = ({ formula, observations }) => {
  const normalizedFormula = String(formula || '').replace(/\s+/g, '').toUpperCase();
  if (normalizedFormula.includes('N1V1=N2V2') && Array.isArray(observations) && observations.length >= 2) {
    const n1 = Number(observations[0]?.x);
    const v1 = Number(observations[0]?.y);
    const n2 = Number(observations[1]?.x);
    if (Number.isFinite(n1) && Number.isFinite(v1) && Number.isFinite(n2) && n2 !== 0) {
      const v2 = (n1 * v1) / n2;
      return {
        finalResult: `Calculated V2 = ${v2.toFixed(3)}`,
        expectedResult: 'The calculated V2 should match endpoint conditions.',
        userResult: `${v2.toFixed(3)}`,
        errorPercent: 0
      };
    }
  }
  return {
    finalResult: 'Formula detected but auto-calculation is not available for this equation.',
    expectedResult: 'Use the provided method to compute expected value.',
    userResult: '',
    errorPercent: 0
  };
};

export const autoInferGraphType = (title = '', procedure = []) => {
  const corpus = `${title} ${(Array.isArray(procedure) ? procedure.join(' ') : '')}`.toLowerCase();
  if (corpus.includes('conductivity')) return 'conductivity_vs_volume';
  if (corpus.includes('ph')) return 'ph_vs_volume';
  if (corpus.includes('time') || corpus.includes('flow')) return 'time_vs_flow';
  return 'x_vs_y';
};

export const buildReportHtml = ({ experiment, observations, calc, graphSvg = '' }) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${experiment.title || 'Lab Report'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
    h1, h2 { margin: 0 0 8px; }
    .section { margin-top: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; }
  </style>
</head>
<body>
  <h1>${experiment.title || 'Untitled Experiment'}</h1>
  <div><strong>Aim:</strong> ${experiment.aim || 'N/A'}</div>
  <div class="section"><h2>Theory</h2><p>${experiment.theory || 'N/A'}</p></div>
  <div class="section"><h2>Procedure</h2><ol>${(experiment.procedure || []).map((step) => `<li>${step}</li>`).join('')}</ol></div>
  <div class="section"><h2>Observations</h2>
    <table><thead><tr><th>X</th><th>Y</th><th>Note</th></tr></thead>
    <tbody>${(observations || []).map((row) => `<tr><td>${row.x}</td><td>${row.y}</td><td>${row.note || ''}</td></tr>`).join('')}</tbody></table>
  </div>
  <div class="section"><h2>Result</h2>
    <div><strong>Final:</strong> ${calc.finalResult}</div>
    <div><strong>Expected:</strong> ${calc.expectedResult}</div>
    <div><strong>User:</strong> ${calc.userResult || 'N/A'}</div>
    <div><strong>Error %:</strong> ${calc.errorPercent ?? 0}</div>
  </div>
  <div class="section"><h2>Graph</h2>${graphSvg || '<p>No graph available.</p>'}</div>
  <div class="section"><h2>Conclusion</h2><p>${experiment.resultMethod || 'N/A'}</p></div>
</body>
</html>
`;
