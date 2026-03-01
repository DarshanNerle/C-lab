import React, { createContext, useContext, useEffect, useMemo } from 'react';
import useThemeStore from '../store/useThemeStore';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const { themeMode, setThemeMode } = useThemeStore();
    const normalizedTheme = themeMode === 'light' ? 'light' : 'dark';

    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('theme-transition');
        root.classList.toggle('dark', normalizedTheme === 'dark');
        root.classList.toggle('light', normalizedTheme === 'light');
        root.dataset.theme = normalizedTheme;

        const id = setTimeout(() => {
            root.classList.remove('theme-transition');
        }, 250);

        return () => clearTimeout(id);
    }, [normalizedTheme]);

    const value = useMemo(() => ({
        theme: normalizedTheme,
        setTheme: (next) => setThemeMode(next === 'light' ? 'light' : 'dark')
    }), [normalizedTheme, setThemeMode]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within ThemeProvider');
    }
    return context;
}
