const createSafeStorage = (type = 'localStorage') => {
    let blocked = false;

    const getStore = () => {
        if (typeof window === 'undefined') return null;
        return type === 'sessionStorage' ? window.sessionStorage : window.localStorage;
    };

    return {
        getItem: (name) => {
            if (blocked) return null;
            try {
                return getStore()?.getItem(name) ?? null;
            } catch {
                blocked = true;
                return null;
            }
        },
        setItem: (name, value) => {
            if (blocked) return;
            try {
                getStore()?.setItem(name, value);
            } catch {
                blocked = true;
            }
        },
        removeItem: (name) => {
            if (blocked) return;
            try {
                getStore()?.removeItem(name);
            } catch {
                blocked = true;
            }
        },
        clear: () => {
            if (blocked) return;
            try {
                getStore()?.clear();
            } catch {
                blocked = true;
            }
        }
    };
};

export const safeLocalStorage = createSafeStorage('localStorage');
export const safeSessionStorage = createSafeStorage('sessionStorage');
