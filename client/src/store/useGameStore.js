import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeLocalStorage } from '../utils/safeStorage'
import useAuthStore from './useAuthStore'
import { storageService } from '../lib/storageService'

let xpSyncTimer = null;
let pendingXp = 0;

const scheduleXpSync = (amount) => {
    const safeAmount = Number(amount);
    if (!Number.isFinite(safeAmount) || safeAmount <= 0) return;

    pendingXp += safeAmount;
    if (xpSyncTimer) clearTimeout(xpSyncTimer);

    xpSyncTimer = setTimeout(() => {
        const email = useAuthStore.getState().user?.email;
        const flushAmount = pendingXp;
        pendingXp = 0;
        xpSyncTimer = null;
        if (!email || flushAmount <= 0) return;
        storageService.addXP({ email, amount: flushAmount }).catch(() => {
            // no-op, local game state remains source of truth for active session
        });
    }, 700);
};

const useGameStore = create(
    persist(
        (set, get) => ({
            xp: 0,
            level: 1,
            rank: 'Novice Alchemist',
            skillPoints: 0,
            equippedLabCoat: '#ffffff',
            badges: [],
            discoveredReactions: [],
            inventory: [],

            addXP: (amount, multiplier = 1) => {
                const finalAmount = amount * multiplier;
                set((state) => {
                    const newTotalXP = state.xp + finalAmount;
                    const newLevel = Math.floor(newTotalXP / 500) + 1;

                    // Determine Rank based on Level
                    let newRank = 'Novice Alchemist';
                    if (newLevel >= 5) newRank = 'Adept Mixer';
                    if (newLevel >= 10) newRank = 'Senior Chemist';
                    if (newLevel >= 25) newRank = 'Master Scientist';
                    if (newLevel >= 50) newRank = 'Nobel Laureate';

                    // Check for Level Up
                    const leveledUp = newLevel > state.level;
                    const skillPointsGained = leveledUp ? (newLevel - state.level) * 5 : 0;

                    return {
                        xp: newTotalXP,
                        level: newLevel,
                        rank: newRank,
                        skillPoints: state.skillPoints + skillPointsGained
                    };
                });
                scheduleXpSync(finalAmount);
            },

            addSkillPoints: (amount) => set((state) => ({
                skillPoints: state.skillPoints + amount
            })),

            addBadge: (badge) => set((state) => ({
                badges: state.badges.includes(badge) ? state.badges : [...state.badges, badge]
            })),

            discoverReaction: (reactionId) => set((state) => ({
                discoveredReactions: state.discoveredReactions.includes(reactionId)
                    ? state.discoveredReactions
                    : [...state.discoveredReactions, reactionId]
            })),

            setEquippedLabCoat: (colorCode) => set({ equippedLabCoat: colorCode }),

            resetGameStats: () => set({
                xp: 0, level: 1, rank: 'Novice Alchemist',
                badges: [], discoveredReactions: [], inventory: []
            }),

            syncGameStats: (userData) => {
                const xp = userData.xp || 0;
                const level = userData.level || 1;
                
                let rank = 'Novice Alchemist';
                if (level >= 5) rank = 'Adept Mixer';
                if (level >= 10) rank = 'Senior Chemist';
                if (level >= 25) rank = 'Master Scientist';
                if (level >= 50) rank = 'Nobel Laureate';

                set({
                    xp,
                    level,
                    rank,
                    badges: userData.badges || []
                });
            }
        }),
        {
            name: 'c-lab-game-storage',
            storage: safeLocalStorage
        }
    )
)

export default useGameStore
