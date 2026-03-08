const globalStore = global.__CLAB_MEM_USERS__ || {
  users: new Map()
};

global.__CLAB_MEM_USERS__ = globalStore;

const makeDefaultUser = ({ email, name = '' }) => ({
  name,
  email,
  level: 1,
  xp: 0,
  badges: [],
  currentLabState: {
    selectedChemicals: [],
    volumes: {},
    resultColor: '',
    experimentType: 'custom'
  },
  aiHistory: [],
  settings: {
    darkMode: true,
    theme: 'dark',
    soundEnabled: true,
    soundVolume: 0.5,
    immersiveMode: false,
    aiMode: 'mini_assistant',
    animationIntensity: 'normal',
    voiceEnabled: false,
    speechRate: 1,
    speechPitch: 1,
    selectedVoice: '',
    voiceGender: 'auto'
  },
  experiments: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

const clone = (value) => JSON.parse(JSON.stringify(value));

export function getMemUser(email) {
  const user = globalStore.users.get(email);
  return user ? clone(user) : null;
}

export function createMemUser({ email, name = '' }) {
  const existing = globalStore.users.get(email);
  if (existing) return clone(existing);
  const user = makeDefaultUser({ email, name });
  globalStore.users.set(email, user);
  return clone(user);
}

export function updateMemUser(email, updater) {
  const existing = globalStore.users.get(email);
  if (!existing) return null;
  const next = updater(clone(existing));
  next.updatedAt = new Date();
  globalStore.users.set(email, next);
  return clone(next);
}
