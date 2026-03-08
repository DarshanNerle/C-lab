const createSafeStorage = (type = 'localStorage') => {
    let blocked = false;
    const memoryFallback = new Map();

    const getStore = () => {
        if (typeof window === 'undefined') return null;
        if (type === 'sessionStorage') return window.sessionStorage;
        return window.localStorage;
    };

    const getFallbackStore = () => {
        if (typeof window === 'undefined') return null;
        return window.sessionStorage;
    };

    return {
        getItem: (name) => {
            if (blocked) return memoryFallback.get(name) ?? null;
            try {
                return getStore()?.getItem(name) ?? null;
            } catch {
                try {
                    const fallbackValue = getFallbackStore()?.getItem(name);
                    if (fallbackValue !== undefined) return fallbackValue ?? null;
                } catch {
                    // Ignore fallback storage errors
                }
                blocked = true;
                return memoryFallback.get(name) ?? null;
            }
        },
        setItem: (name, value) => {
            if (blocked) {
                memoryFallback.set(name, String(value));
                return;
            }
            try {
                getStore()?.setItem(name, value);
            } catch {
                try {
                    getFallbackStore()?.setItem(name, value);
                    return;
                } catch {
                    blocked = true;
                    memoryFallback.set(name, String(value));
                }
            }
        },
        removeItem: (name) => {
            if (blocked) {
                memoryFallback.delete(name);
                return;
            }
            try {
                getStore()?.removeItem(name);
            } catch {
                try {
                    getFallbackStore()?.removeItem(name);
                    return;
                } catch {
                    blocked = true;
                    memoryFallback.delete(name);
                }
            }
        },
        clear: () => {
            if (blocked) {
                memoryFallback.clear();
                return;
            }
            try {
                getStore()?.clear();
            } catch {
                try {
                    getFallbackStore()?.clear();
                    return;
                } catch {
                    blocked = true;
                    memoryFallback.clear();
                }
            }
        }
    };
};

export const safeLocalStorage = createSafeStorage('localStorage');
export const safeSessionStorage = createSafeStorage('sessionStorage');
