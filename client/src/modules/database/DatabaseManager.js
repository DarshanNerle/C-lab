import { safeLocalStorage } from '../../utils/safeStorage';

/**
 * DatabaseManager
 * Logic for Firestore interactions and Schema mapping.
 */
export class DatabaseManager {
    static COLLECTIONS = {
        USERS: 'users',
        EXPERIMENTS: 'experiments',
        REACTIONS: 'reactions',
        QUIZZES: 'quizzes',
        NOTEBOOKS: 'notebooks',
        LEADERBOARDS: 'leaderboards',
        MISSIONS: 'missions'
    };

    /**
     * Map client state to Firestore document structure
     */
    static mapNotebookForUpload(notebookStore) {
        return {
            notes: notebookStore.entries.filter(e => e.type === 'manual'),
            autoLogs: notebookStore.entries.filter(e => e.type === 'auto-log'),
            images: notebookStore.screenshots || [],
            lastUpdated: new Date()
        };
    }
}

/**
 * OfflineCache
 * Logic for LocalStorage redundancy and sync markers.
 */
export class OfflineCache {
    static STORAGE_KEY = 'c_lab_local_cache';

    static save(key, data) {
        const payload = {
            data,
            timestamp: Date.now(),
            synced: false
        };
        safeLocalStorage.setItem(`${this.STORAGE_KEY}_${key}`, JSON.stringify(payload));
    }

    static getUnsynced(key) {
        const item = safeLocalStorage.getItem(`${this.STORAGE_KEY}_${key}`);
        if (!item) return null;
        const parsed = JSON.parse(item);
        return parsed.synced ? null : parsed.data;
    }
}
