import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useGameStore from './useGameStore';
import { safeLocalStorage } from '../utils/safeStorage';

/**
 * useMissionStore - C-Lab 5.0 Engagement System
 */
const useMissionStore = create(
    persist(
        (set, get) => ({
            missions: [
                { id: 'm1', title: 'The Purity Test', description: 'Perform 5 chemical pours.', target: 5, current: 0, rewardXP: 100, completed: false, type: 'pour' },
                { id: 'm2', title: 'Stoichiometry Master', description: 'Complete 3 Quizzes with a streak.', target: 3, current: 0, rewardXP: 250, completed: false, type: 'quiz' },
                { id: 'm3', title: 'Discovery Channel', description: 'Discover 2 new chemical reactions.', target: 2, current: 0, rewardXP: 200, completed: false, type: 'reaction' }
            ],

            // Actions
            updateProgress: (type, amount = 1) => set(state => {
                const updatedMissions = state.missions.map(mission => {
                    if (mission.type === type && !mission.completed) {
                        const newCurrent = mission.current + amount;
                        const isNowCompleted = newCurrent >= mission.target;

                        if (isNowCompleted) {
                            // Award XP immediately
                            useGameStore.getState().addXP(mission.rewardXP);
                            // In a real app we'd trigger a notification here
                        }

                        return { ...mission, current: newCurrent, completed: isNowCompleted };
                    }
                    return mission;
                });
                return { missions: updatedMissions };
            }),

            resetDailyMissions: () => {
                // Logic to reshuffle or reset missions
            }
        }),
        {
            name: 'clab-mission-storage',
            storage: safeLocalStorage
        }
    )
);

export default useMissionStore;
