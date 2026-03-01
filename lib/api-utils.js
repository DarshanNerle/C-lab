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
