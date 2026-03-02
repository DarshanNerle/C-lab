import { safeLocalStorage } from '../utils/safeStorage';

const LOCAL_KEYS = {
    user: 'app_user',
    settings: 'app_settings',
    labState: 'app_labState',
    aiHistory: 'app_aiHistory'
};

const REQUEST_TIMEOUT_MS = 7000;
const STORAGE_MODES = {
    MONGO: 'mongo',
    LOCAL: 'local'
};

const MODE_SWITCH_MESSAGE = 'MongoDB unavailable, switching to local mode';

const inFlightWrites = new Map();

class StorageService {
    constructor() {
        this.storageMode = STORAGE_MODES.MONGO;
        this.modeListeners = new Set();
        this.hasLoggedMongoFallback = false;
    }

    subscribe(listener) {
        if (typeof listener !== 'function') return () => {};
        this.modeListeners.add(listener);
        return () => this.modeListeners.delete(listener);
    }

    notifyModeChange() {
        this.modeListeners.forEach((listener) => {
            try {
                listener(this.storageMode);
            } catch {
                // ignore listener failures
            }
        });
    }

    getStorageMode() {
        return this.storageMode;
    }

    setStorageMode(mode) {
        const normalized = mode === STORAGE_MODES.LOCAL ? STORAGE_MODES.LOCAL : STORAGE_MODES.MONGO;
        if (this.storageMode === normalized) return;
        this.storageMode = normalized;
        if (normalized === STORAGE_MODES.LOCAL && !this.hasLoggedMongoFallback) {
            // eslint-disable-next-line no-console
            console.warn(MODE_SWITCH_MESSAGE);
            this.hasLoggedMongoFallback = true;
        }
        this.notifyModeChange();
    }

    shouldFallback(error) {
        if (!error) return false;
        if (error.kind === 'timeout' || error.kind === 'network' || error.kind === 'no_response') return true;
        if (error.kind === 'http' && Number(error.status) >= 500) return true;
        return false;
    }

    dedupeWrite(key, task) {
        const existing = inFlightWrites.get(key);
        if (existing) return existing;

        const promise = (async () => {
            try {
                return await task();
            } finally {
                inFlightWrites.delete(key);
            }
        })();

        inFlightWrites.set(key, promise);
        return promise;
    }

    safeParse(raw, fallback) {
        if (!raw) return fallback;
        try {
            const parsed = JSON.parse(raw);
            return parsed ?? fallback;
        } catch {
            return fallback;
        }
    }

    readMap(key) {
        const value = this.safeParse(safeLocalStorage.getItem(key), {});
        if (!value || typeof value !== 'object') return { byEmail: {} };
        const byEmail = value.byEmail && typeof value.byEmail === 'object' ? value.byEmail : {};
        return { byEmail };
    }

    writeMap(key, mapValue) {
        const payload = { byEmail: mapValue?.byEmail && typeof mapValue.byEmail === 'object' ? mapValue.byEmail : {} };
        safeLocalStorage.setItem(key, JSON.stringify(payload));
    }

    mergeLocalUser(email) {
        const userMap = this.readMap(LOCAL_KEYS.user);
        const settingsMap = this.readMap(LOCAL_KEYS.settings);
        const labMap = this.readMap(LOCAL_KEYS.labState);
        const historyMap = this.readMap(LOCAL_KEYS.aiHistory);

        const base = userMap.byEmail[email];
        if (!base) return null;

        const merged = {
            ...base,
            email,
            settings: {
                ...(base.settings || {}),
                ...(settingsMap.byEmail[email] || {})
            },
            currentLabState: labMap.byEmail[email] || base.currentLabState || null,
            aiHistory: Array.isArray(historyMap.byEmail[email]) ? historyMap.byEmail[email] : (Array.isArray(base.aiHistory) ? base.aiHistory : [])
        };

        return merged;
    }

    saveLocalUserRecord(email, partial = {}) {
        const userMap = this.readMap(LOCAL_KEYS.user);
        const current = userMap.byEmail[email] || {
            email,
            name: '',
            level: 1,
            xp: 0,
            badges: [],
            currentLabState: null,
            aiHistory: [],
            settings: {}
        };

        userMap.byEmail[email] = {
            ...current,
            ...partial,
            email,
            badges: Array.isArray(partial.badges) ? partial.badges : (Array.isArray(current.badges) ? current.badges : [])
        };
        this.writeMap(LOCAL_KEYS.user, userMap);
        return userMap.byEmail[email];
    }

    saveLocalSettings(email, settings = {}) {
        const settingsMap = this.readMap(LOCAL_KEYS.settings);
        const merged = {
            ...(settingsMap.byEmail[email] || {}),
            ...(settings || {})
        };
        settingsMap.byEmail[email] = merged;
        this.writeMap(LOCAL_KEYS.settings, settingsMap);

        this.saveLocalUserRecord(email, { settings: merged });
        return merged;
    }

    saveLocalLabState(email, labState) {
        const labMap = this.readMap(LOCAL_KEYS.labState);
        labMap.byEmail[email] = labState || null;
        this.writeMap(LOCAL_KEYS.labState, labMap);
        this.saveLocalUserRecord(email, { currentLabState: labState || null });
        return labMap.byEmail[email];
    }

    saveLocalAIHistory(email, entry) {
        const historyMap = this.readMap(LOCAL_KEYS.aiHistory);
        const current = Array.isArray(historyMap.byEmail[email]) ? historyMap.byEmail[email] : [];
        const next = [entry, ...current].slice(0, 50);
        historyMap.byEmail[email] = next;
        this.writeMap(LOCAL_KEYS.aiHistory, historyMap);
        this.saveLocalUserRecord(email, { aiHistory: next });
        return next;
    }

    createTimeoutController(timeoutMs = REQUEST_TIMEOUT_MS) {
        const controller = new AbortController();
        const timerId = setTimeout(() => controller.abort(), timeoutMs);
        return { controller, timerId };
    }

    async request(path, options = {}) {
        const { method = 'GET', body, timeoutMs = REQUEST_TIMEOUT_MS } = options;
        const { controller, timerId } = this.createTimeoutController(timeoutMs);

        try {
            const response = await fetch(path, {
                method,
                headers: body ? { 'Content-Type': 'application/json' } : undefined,
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal
            });

            if (!response) {
                throw { kind: 'no_response' };
            }

            let payload = {};
            try {
                payload = await response.json();
            } catch {
                payload = {};
            }

            if (!response.ok) {
                throw {
                    kind: 'http',
                    status: response.status,
                    message: payload?.error || 'Request failed'
                };
            }

            return payload;
        } catch (error) {
            if (error?.name === 'AbortError') {
                throw { kind: 'timeout', message: 'Request timed out' };
            }
            if (error?.kind) throw error;
            throw { kind: 'network', message: error?.message || 'Network error' };
        } finally {
            clearTimeout(timerId);
        }
    }

    async getUser(email) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!normalizedEmail) return { user: null, source: 'local', storageMode: this.storageMode };

        if (this.storageMode !== STORAGE_MODES.LOCAL) {
            try {
                const data = await this.request(`/api/user/get?email=${encodeURIComponent(normalizedEmail)}`);
                if (data?.user) {
                    this.setStorageMode(STORAGE_MODES.MONGO);
                    this.saveLocalUserRecord(normalizedEmail, data.user);
                    if (data.user.settings) this.saveLocalSettings(normalizedEmail, data.user.settings);
                    if (data.user.currentLabState) this.saveLocalLabState(normalizedEmail, data.user.currentLabState);
                    if (Array.isArray(data.user.aiHistory)) {
                        const historyMap = this.readMap(LOCAL_KEYS.aiHistory);
                        historyMap.byEmail[normalizedEmail] = data.user.aiHistory.slice(0, 50);
                        this.writeMap(LOCAL_KEYS.aiHistory, historyMap);
                    }
                    return { user: data.user, source: data.source || 'mongodb', storageMode: STORAGE_MODES.MONGO };
                }
                return { user: null, source: data?.source || 'mongodb', storageMode: STORAGE_MODES.MONGO };
            } catch (error) {
                if (!this.shouldFallback(error)) throw new Error(error?.message || 'Failed to load user');
                this.setStorageMode(STORAGE_MODES.LOCAL);
            }
        }

        const localUser = this.mergeLocalUser(normalizedEmail);
        return { user: localUser, source: 'local', storageMode: STORAGE_MODES.LOCAL };
    }

    async saveUser({ email, name = '' }) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const safeName = String(name || '').trim();
        if (!normalizedEmail) throw new Error('Valid email is required.');

        const writeKey = `saveUser:${normalizedEmail}:${safeName}`;
        return this.dedupeWrite(writeKey, async () => {
            if (this.storageMode !== STORAGE_MODES.LOCAL) {
                try {
                    const data = await this.request('/api/user/create', {
                        method: 'POST',
                        body: { email: normalizedEmail, name: safeName }
                    });
                    if (data?.user) {
                        this.setStorageMode(STORAGE_MODES.MONGO);
                        this.saveLocalUserRecord(normalizedEmail, data.user);
                    }
                    return { user: data?.user || null, source: data?.source || 'mongodb', storageMode: STORAGE_MODES.MONGO };
                } catch (error) {
                    if (!this.shouldFallback(error)) throw new Error(error?.message || 'Failed to save user');
                    this.setStorageMode(STORAGE_MODES.LOCAL);
                }
            }

            const user = this.saveLocalUserRecord(normalizedEmail, { name: safeName });
            return { user: this.mergeLocalUser(normalizedEmail) || user, source: 'local', storageMode: STORAGE_MODES.LOCAL };
        });
    }

    async updateUserProfile({ email, name, settings }) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!normalizedEmail) return { ok: false, source: 'local', storageMode: this.storageMode };

        const payload = {
            email: normalizedEmail,
            name: typeof name === 'string' ? name.trim() : undefined,
            settings: settings && typeof settings === 'object' ? settings : undefined
        };

        const writeKey = `updateUser:${normalizedEmail}:${JSON.stringify(payload)}`;
        return this.dedupeWrite(writeKey, async () => {
            if (this.storageMode !== STORAGE_MODES.LOCAL) {
                try {
                    const data = await this.request('/api/user/update', {
                        method: 'POST',
                        body: payload
                    });
                    this.setStorageMode(STORAGE_MODES.MONGO);
                    if (payload.name || payload.settings) {
                        this.saveLocalUserRecord(normalizedEmail, {
                            name: payload.name,
                            settings: payload.settings
                        });
                        if (payload.settings) this.saveLocalSettings(normalizedEmail, payload.settings);
                    }
                    return { ok: true, user: data?.user || null, source: data?.source || 'mongodb', storageMode: STORAGE_MODES.MONGO };
                } catch (error) {
                    if (!this.shouldFallback(error)) {
                        return { ok: false, error: error?.message || 'Failed to update user', source: 'mongo', storageMode: STORAGE_MODES.MONGO };
                    }
                    this.setStorageMode(STORAGE_MODES.LOCAL);
                }
            }

            if (payload.name || payload.settings) {
                this.saveLocalUserRecord(normalizedEmail, {
                    name: payload.name,
                    settings: payload.settings
                });
                if (payload.settings) this.saveLocalSettings(normalizedEmail, payload.settings);
            }
            return { ok: true, user: this.mergeLocalUser(normalizedEmail), source: 'local', storageMode: STORAGE_MODES.LOCAL };
        });
    }

    async updateSettings({ email, settings }) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!normalizedEmail) return { ok: false, source: 'local', storageMode: this.storageMode };

        const payload = settings && typeof settings === 'object' ? settings : {};
        const writeKey = `updateSettings:${normalizedEmail}:${JSON.stringify(payload)}`;
        return this.dedupeWrite(writeKey, async () => {
            if (this.storageMode !== STORAGE_MODES.LOCAL) {
                try {
                    const data = await this.request('/api/user/update-settings', {
                        method: 'PATCH',
                        body: { email: normalizedEmail, settings: payload }
                    });
                    this.setStorageMode(STORAGE_MODES.MONGO);
                    this.saveLocalSettings(normalizedEmail, payload);
                    return { ok: true, source: data?.source || 'mongodb', storageMode: STORAGE_MODES.MONGO };
                } catch (error) {
                    if (!this.shouldFallback(error)) return { ok: false, error: error?.message || 'Failed to update settings', source: 'mongo', storageMode: STORAGE_MODES.MONGO };
                    this.setStorageMode(STORAGE_MODES.LOCAL);
                }
            }

            this.saveLocalSettings(normalizedEmail, payload);
            return { ok: true, source: 'local', storageMode: STORAGE_MODES.LOCAL };
        });
    }

    async saveLabState({ email, labState }) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!normalizedEmail) return { ok: false, source: 'local', storageMode: this.storageMode };

        const writeKey = `saveLab:${normalizedEmail}:${JSON.stringify(labState || {})}`;
        return this.dedupeWrite(writeKey, async () => {
            if (this.storageMode !== STORAGE_MODES.LOCAL) {
                try {
                    const data = await this.request('/api/user/save-lab', {
                        method: 'POST',
                        body: { email: normalizedEmail, labState }
                    });
                    this.setStorageMode(STORAGE_MODES.MONGO);
                    this.saveLocalLabState(normalizedEmail, labState);
                    return { ok: true, source: data?.source || 'mongodb', storageMode: STORAGE_MODES.MONGO };
                } catch (error) {
                    if (!this.shouldFallback(error)) return { ok: false, error: error?.message || 'Failed to save lab state', source: 'mongo', storageMode: STORAGE_MODES.MONGO };
                    this.setStorageMode(STORAGE_MODES.LOCAL);
                }
            }

            this.saveLocalLabState(normalizedEmail, labState);
            return { ok: true, source: 'local', storageMode: STORAGE_MODES.LOCAL };
        });
    }

    async saveAIHistory({ email, question, answer }) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const safeQuestion = String(question || '').trim();
        const safeAnswer = String(answer || '').trim();
        if (!normalizedEmail || !safeQuestion || !safeAnswer) return { ok: false, source: 'local', storageMode: this.storageMode };

        const entry = {
            question: safeQuestion,
            answer: safeAnswer,
            createdAt: new Date().toISOString()
        };

        const writeKey = `saveAIHistory:${normalizedEmail}:${safeQuestion}:${safeAnswer.slice(0, 120)}`;
        return this.dedupeWrite(writeKey, async () => {
            if (this.storageMode !== STORAGE_MODES.LOCAL) {
                try {
                    const data = await this.request('/api/user/save-ai-history', {
                        method: 'POST',
                        body: { email: normalizedEmail, question: safeQuestion, answer: safeAnswer }
                    });
                    this.setStorageMode(STORAGE_MODES.MONGO);
                    this.saveLocalAIHistory(normalizedEmail, entry);
                    return { ok: true, source: data?.source || 'mongodb', storageMode: STORAGE_MODES.MONGO };
                } catch (error) {
                    if (!this.shouldFallback(error)) return { ok: false, error: error?.message || 'Failed to save AI history', source: 'mongo', storageMode: STORAGE_MODES.MONGO };
                    this.setStorageMode(STORAGE_MODES.LOCAL);
                }
            }

            this.saveLocalAIHistory(normalizedEmail, entry);
            return { ok: true, source: 'local', storageMode: STORAGE_MODES.LOCAL };
        });
    }

    async addXP({ email, amount }) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const safeAmount = Number(amount);
        if (!normalizedEmail || !Number.isFinite(safeAmount) || safeAmount <= 0) {
            return { ok: false, source: 'local', storageMode: this.storageMode };
        }

        const writeKey = `addXP:${normalizedEmail}:${safeAmount}`;
        return this.dedupeWrite(writeKey, async () => {
            if (this.storageMode !== STORAGE_MODES.LOCAL) {
                try {
                    const data = await this.request('/api/user/add-xp', {
                        method: 'POST',
                        body: { email: normalizedEmail, amount: safeAmount }
                    });
                    this.setStorageMode(STORAGE_MODES.MONGO);
                    const localUser = this.saveLocalUserRecord(normalizedEmail, {
                        xp: Number(data?.xp) || 0,
                        level: Number(data?.level) || 1
                    });
                    return { ok: true, source: data?.source || 'mongodb', storageMode: STORAGE_MODES.MONGO, user: localUser };
                } catch (error) {
                    if (!this.shouldFallback(error)) return { ok: false, error: error?.message || 'Failed to add XP', source: 'mongo', storageMode: STORAGE_MODES.MONGO };
                    this.setStorageMode(STORAGE_MODES.LOCAL);
                }
            }

            const localUser = this.mergeLocalUser(normalizedEmail) || this.saveLocalUserRecord(normalizedEmail, {});
            const nextXP = (Number(localUser.xp) || 0) + safeAmount;
            const nextLevel = Math.floor(nextXP / 100) + 1;
            this.saveLocalUserRecord(normalizedEmail, { xp: nextXP, level: nextLevel });
            return { ok: true, source: 'local', storageMode: STORAGE_MODES.LOCAL, user: this.mergeLocalUser(normalizedEmail) };
        });
    }

    clearUser(email) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!normalizedEmail) {
            Object.values(LOCAL_KEYS).forEach((key) => safeLocalStorage.removeItem(key));
            this.setStorageMode(STORAGE_MODES.MONGO);
            return;
        }

        [LOCAL_KEYS.user, LOCAL_KEYS.settings, LOCAL_KEYS.labState, LOCAL_KEYS.aiHistory].forEach((key) => {
            const map = this.readMap(key);
            if (map.byEmail[normalizedEmail]) {
                delete map.byEmail[normalizedEmail];
                this.writeMap(key, map);
            }
        });
    }
}

export const storageService = new StorageService();
export default storageService;
