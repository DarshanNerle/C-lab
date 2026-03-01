import useGameStore from '../store/useGameStore';
import useThemeStore from '../store/useThemeStore';
import useLabStore from '../store/useLabStore';
import { safeLocalStorage } from './safeStorage';

// Helper for generic local storage
export const saveToLocal = (key, data) => {
    safeLocalStorage.setItem(key, JSON.stringify(data));
};

export const loadFromLocal = (key) => {
    try {
        const data = safeLocalStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

// Queueing offline experiments
export const queueOfflineExperiment = (experimentData) => {
    const currentQueue = loadFromLocal('offline_experiment_data') || [];
    currentQueue.push({ ...experimentData, timestamp: Date.now() });
    saveToLocal('offline_experiment_data', currentQueue);
};

export const getOfflineQueue = () => {
    return loadFromLocal('offline_experiment_data') || [];
};

export const clearOfflineQueue = () => {
    safeLocalStorage.removeItem('offline_experiment_data');
};
