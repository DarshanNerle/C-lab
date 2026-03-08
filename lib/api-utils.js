export function allowMethods(req, res, allowed) {
  if (allowed.includes(req.method)) {
    return true;
  }

  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ error: `Method not allowed. Use ${allowed.join(' or ')}.` });
  return false;
}

export function normalizeEmail(email) {
  if (typeof email !== 'string') {
    return null;
  }

  const value = email.trim().toLowerCase();
  if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return null;
  }
  return value;
}

export function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, n));
}

export function safeServerError(res, error, context) {
  const code = error?.name === 'ValidationError' ? 400 : 500;
  console.error(`[API:${context}]`, {
    name: error?.name,
    message: error?.message,
    status: error?.status
  });
  return res.status(code).json({
    error: code === 400 ? 'Invalid request payload.' : 'Internal server error.'
  });
}

export function sanitizeSettings(settings = {}) {
  if (!settings || typeof settings !== 'object') {
    return {};
  }

  const aiMode = settings.aiMode === 'full_learning' ? 'full_learning' : 'mini_assistant';
  const animationIntensity = settings.animationIntensity === 'reduced' ? 'reduced' : 'normal';
  const theme = settings.theme === 'light' || settings.darkMode === false ? 'light' : 'dark';

  return {
    darkMode: theme === 'dark',
    theme,
    soundEnabled: settings.soundEnabled !== false,
    soundVolume: clampNumber(settings.soundVolume, 0, 1, 0.5),
    immersiveMode: !!settings.immersiveMode,
    aiMode,
    animationIntensity,
    voiceEnabled: !!settings.voiceEnabled,
    speechRate: clampNumber(settings.speechRate, 0.5, 2, 1),
    speechPitch: clampNumber(settings.speechPitch, 0, 2, 1),
    selectedVoice: typeof settings.selectedVoice === 'string' ? settings.selectedVoice.slice(0, 120) : '',
    voiceGender: settings.voiceGender === 'male' || settings.voiceGender === 'female' ? settings.voiceGender : 'auto'
  };
}

export function sanitizeLabState(labState = {}) {
  if (!labState || typeof labState !== 'object') {
    return null;
  }

  const selectedChemicals = Array.isArray(labState.selectedChemicals)
    ? labState.selectedChemicals.slice(0, 50)
    : [];

  const volumes = typeof labState.volumes === 'object' && labState.volumes !== null
    ? labState.volumes
    : {};

  return {
    selectedChemicals,
    volumes,
    resultColor: typeof labState.resultColor === 'string' ? labState.resultColor : '',
    experimentType: typeof labState.experimentType === 'string' ? labState.experimentType : 'custom'
  };
}

const normalizeString = (value, max = 5000) => (
  typeof value === 'string' ? value.trim().slice(0, max) : ''
);

const normalizeStringList = (value, maxItems = 50, maxLen = 240) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeString(item, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
};

export function sanitizeObservationTable(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, 200).map((row) => {
    const x = Number(row?.x);
    const y = Number(row?.y);
    return {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
      note: normalizeString(row?.note, 240)
    };
  });
}

export function sanitizeExperiment(experiment = {}) {
  if (!experiment || typeof experiment !== 'object') return null;
  const id = normalizeString(experiment.id, 60);
  if (!id) return null;

  const observationTable = sanitizeObservationTable(experiment.observationTable);
  const progress = experiment.progress && typeof experiment.progress === 'object' ? experiment.progress : {};

  return {
    id,
    title: normalizeString(experiment.title, 180),
    sourceType: normalizeString(experiment.sourceType, 24) || 'upload',
    aim: normalizeString(experiment.aim),
    theory: normalizeString(experiment.theory),
    apparatus: normalizeStringList(experiment.apparatus),
    chemicals: normalizeStringList(experiment.chemicals),
    procedure: normalizeStringList(experiment.procedure, 150, 600),
    formula: normalizeString(experiment.formula, 500),
    observationTable,
    resultMethod: normalizeString(experiment.resultMethod),
    graphType: normalizeString(experiment.graphType, 120),
    difficultyLevel: normalizeString(experiment.difficultyLevel, 40) || 'Intermediate',
    estimatedTime: normalizeString(experiment.estimatedTime, 40) || '30-45 min',
    aiHints: normalizeStringList(experiment.aiHints, 10, 240),
    badges: normalizeStringList(experiment.badges, 10, 80),
    equipment: normalizeStringList(experiment.equipment, 20, 80),
    progress: {
      observations: sanitizeObservationTable(progress.observations),
      completionStatus: normalizeString(progress.completionStatus, 30) || 'not_started',
      userResult: normalizeString(progress.userResult, 500),
      expectedResult: normalizeString(progress.expectedResult, 500),
      errorPercent: Number.isFinite(Number(progress.errorPercent)) ? Number(progress.errorPercent) : 0
    }
  };
}
