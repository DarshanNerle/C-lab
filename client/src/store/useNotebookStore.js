import { create } from 'zustand';
import { persist } from 'zustand/middleware'
import { safeLocalStorage } from '../utils/safeStorage';

/**
 * useNotebookStore - C-Lab 5.0 Virtual Lab Notebook
 * Stores Rich-Text notes, auto-logs, and timestamps.
 */
const useNotebookStore = create(
    persist(
        (set, get) => ({
            entries: [
                {
                    id: 'entry_1',
                    title: 'Initial Laboratory Session',
                    content: 'Starting my first experiment in C-Lab 5.0...',
                    timestamp: new Date().toISOString(),
                    logs: [],
                    tags: ['intro']
                }
            ],
            activeEntryId: 'entry_1',
            isOpen: false,
            lastSaved: null,
            isSaving: false,

            // Actions
            toggleNotebook: () => set(state => ({ isOpen: !state.isOpen })),

            setEntries: (entries) => set({ entries }),

            // Helper for stats
            getStats: () => {
                const active = get().entries.find(e => e.id === get().activeEntryId);
                const content = active?.content || '';
                return {
                    words: content.trim() ? content.trim().split(/\s+/).length : 0,
                    chars: content.length
                };
            },

            addEntry: (title) => {
                const newEntry = {
                    id: `entry_${Date.now()}`,
                    title: title || `Experiment ${get().entries.length + 1}`,
                    content: '',
                    timestamp: new Date().toISOString(),
                    logs: [],
                    tags: []
                };
                set(state => ({
                    entries: [newEntry, ...state.entries],
                    activeEntryId: newEntry.id
                }));
                get().syncWithFirebase();
            },

            updateActiveContent: (content) => {
                set({ isSaving: true });
                set(state => ({
                    entries: state.entries.map(e =>
                        e.id === state.activeEntryId ? { ...e, content } : e
                    ),
                    lastSaved: new Date().toISOString()
                }));

                // Debounced/Immediate sync simulation
                setTimeout(() => set({ isSaving: false }), 800);
                get().syncWithFirebase();
            },

            updateActiveTitle: (title) => {
                set(state => ({
                    entries: state.entries.map(e =>
                        e.id === state.activeEntryId ? { ...e, title } : e
                    ),
                    lastSaved: new Date().toISOString()
                }));
                get().syncWithFirebase();
            },

            syncWithFirebase: async () => {
                // Implementation placeholder for component-level sync
            },

            clearActiveEntry: () => {
                const { activeEntryId, entries } = get();
                set({
                    entries: entries.map(e =>
                        e.id === activeEntryId ? { ...e, content: '', logs: [] } : e
                    ),
                    lastSaved: new Date().toISOString()
                });
            },

            addLog: (text) => set(state => {
                const now = new Date().toLocaleTimeString();
                const logEntry = `[${now}] ${text}`;
                return {
                    entries: state.entries.map(e =>
                        e.id === state.activeEntryId ? { ...e, logs: [...e.logs, logEntry] } : e
                    )
                };
            }),

            deleteEntry: (id) => set(state => ({
                entries: state.entries.filter(e => e.id !== id),
                activeEntryId: state.activeEntryId === id ? (state.entries[1]?.id || null) : state.activeEntryId
            })),

            setActiveEntry: (id) => set({ activeEntryId: id })
        }),
        {
            name: 'clab-notebook-storage',
            storage: safeLocalStorage
        }
    )
);

export default useNotebookStore;
