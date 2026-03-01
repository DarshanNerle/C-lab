import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useGameStore from './useGameStore';
import { safeLocalStorage } from '../utils/safeStorage';

/**
 * useSkillStore - C-Lab 5.0 Skill Tree System
 */
const useSkillStore = create(
    persist(
        (set, get) => ({
            skills: {
                precision_1: { id: 'precision_1', name: 'Precision I', description: 'Increases pouring accuracy.', cost: 5, unlocked: false, dependencies: [] },
                precision_2: { id: 'precision_2', name: 'Precision II', description: 'Reduces waste during titrations.', cost: 10, unlocked: false, dependencies: ['precision_1'] },
                thermo_1: { id: 'thermo_1', name: 'Thermo-Sense I', description: 'Visual temperature cues for reactions.', cost: 5, unlocked: false, dependencies: [] },
                speed_1: { id: 'speed_1', name: 'Rapid Pour', description: 'Enables faster pouring speeds.', cost: 5, unlocked: false, dependencies: [] },
                advanced_chem_1: { id: 'advanced_chem_1', name: 'Expert Reagents', description: 'Unlocks advanced chemical reagents.', cost: 15, unlocked: false, dependencies: ['precision_1', 'thermo_1'] }
            },

            // Actions
            unlockSkill: (skillId) => {
                const skill = get().skills[skillId];
                if (!skill || skill.unlocked) return;

                // Check dependencies
                const depsMet = skill.dependencies.every(depId => get().skills[depId].unlocked);
                if (!depsMet) {
                    alert('Unlock prerequisite skills first!');
                    return;
                }

                // Check Skill Points (from useGameStore)
                const { skillPoints } = useGameStore.getState();
                if (skillPoints < skill.cost) {
                    alert('Not enough skill points!');
                    return;
                }

                // Spend Skill Points
                useGameStore.getState().addSkillPoints(-skill.cost);

                // Unlock
                set(state => ({
                    skills: {
                        ...state.skills,
                        [skillId]: { ...skill, unlocked: true }
                    }
                }));
            },

            isSkillUnlocked: (skillId) => get().skills[skillId]?.unlocked || false
        }),
        {
            name: 'clab-skill-storage',
            storage: safeLocalStorage
        }
    )
);

export default useSkillStore;
