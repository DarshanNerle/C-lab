import { create } from 'zustand';
import { CHEMICAL_DATA_2D, mixLiquids } from '../components/lab2D/engine/LiquidPhysics';
import { processReaction2D } from '../components/lab2D/engine/ReactionEngine2D';

/**
 * useLab2DStore
 * Manages the state of the 2D Chemistry Laboratory.
 */
const useLab2DStore = create((set, get) => ({
    // Shared Lab State
    containers: {
        beaker1: { id: 'beaker1', type: 'beaker', maxCapacity: 500, volume: 0, temp: 25, color: 'rgba(255,255,255,0)', components: [] },
        flask1: { id: 'flask1', type: 'flask', maxCapacity: 250, volume: 0, temp: 25, color: 'rgba(255,255,255,0)', components: [] },
        burette1: { id: 'burette1', type: 'burette', maxCapacity: 50, volume: 50, temp: 25, color: CHEMICAL_DATA_2D.naoh.color, components: [{ id: 'naoh', volume: 50 }], isOpen: false },
        testTube1: { id: 'testTube1', type: 'testTube', maxCapacity: 50, volume: 0, temp: 25, color: 'rgba(255,255,255,0)', components: [] },
    },

    burner: { isOn: false, intensity: 1.0 },
    selectedSource: null, // Component ID being dragged
    activeReaction: null, // { message, type, xp, equation }

    // Actions
    toggleBurner: () => set(state => ({ burner: { ...state.burner, isOn: !state.burner.isOn } })),

    setBurnerIntensity: (intensity) => set(state => ({ burner: { ...state.burner, intensity } })),

    toggleBurette: (id) => set(state => {
        const newContainers = { ...state.containers };
        if (newContainers[id]) {
            newContainers[id].isOpen = !newContainers[id].isOpen;
        }
        return { containers: newContainers };
    }),

    /**
     * Pour liquid from one container to another
     */
    pour: (sourceId, targetId, amount) => set(state => {
        const source = state.containers[sourceId];
        const target = state.containers[targetId];

        if (!source || !target || source.volume <= 0) return state;

        const actualAmount = Math.min(amount, source.volume);
        const sourceRemRatio = (source.volume - actualAmount) / source.volume;

        // 1. Update Target (Mix)
        // For simplicity, we assume the first component of the source defines the 'added chemical' 
        // In a true multi-mix, we'd iterate, but let's grab the dominate source chemical for the physics call
        const dominateChemId = source.components[0]?.id || 'water';
        const chemData = CHEMICAL_DATA_2D[dominateChemId];

        const newTargetState = mixLiquids(target, chemData, actualAmount, source.temp);

        // Check for Reaction in target
        const reaction = processReaction2D(newTargetState);
        if (reaction && reaction.success) {
            // Apply reaction effects to state (temp bump, etc.)
            if (reaction.temperatureChange) {
                const delta = parseInt(reaction.temperatureChange);
                newTargetState.temp += delta;
            }
            if (reaction.colorChange) {
                newTargetState.color = reaction.colorChange;
            }
            if (reaction.indicatorOverride) {
                newTargetState.color = reaction.indicatorOverride.colorChange;
            }
        }

        // 2. Update Source (Subtract)
        const newSourceComponents = source.components.map(c => ({
            ...c,
            volume: c.volume * sourceRemRatio
        })).filter(c => c.volume > 0.01);

        const newSourceState = {
            ...source,
            volume: source.volume - actualAmount,
            components: newSourceComponents,
            color: source.volume - actualAmount <= 0 ? 'rgba(255,255,255,0)' : source.color
        };

        return {
            containers: {
                ...state.containers,
                [sourceId]: newSourceState,
                [targetId]: { ...target, ...newTargetState }
            },
            activeReaction: reaction
        };
    }),

    resetLab: () => set({
        containers: {
            beaker1: { id: 'beaker1', type: 'beaker', maxCapacity: 500, volume: 0, temp: 25, color: 'rgba(255,255,255,0)', components: [] },
            flask1: { id: 'flask1', type: 'flask', maxCapacity: 250, volume: 0, temp: 25, color: 'rgba(255,255,255,0)', components: [] },
            burette1: { id: 'burette1', type: 'burette', maxCapacity: 50, volume: 50, temp: 25, color: CHEMICAL_DATA_2D.naoh.color, components: [{ id: 'naoh', volume: 50 }], isOpen: false },
            testTube1: { id: 'testTube1', type: 'testTube', maxCapacity: 50, volume: 0, temp: 25, color: 'rgba(255,255,255,0)', components: [] },
        },
        burner: { isOn: false, intensity: 1.0 },
        activeReaction: null
    }),

    addChemicalToContainer: (chemId, containerId, amount) => set(state => {
        const container = state.containers[containerId];
        if (!container) return state;

        const chemData = CHEMICAL_DATA_2D[chemId];
        const newMix = mixLiquids(container, chemData, amount, 25);

        // Always check reaction after adding
        const reaction = processReaction2D(newMix);

        return {
            containers: {
                ...state.containers,
                [containerId]: { ...container, ...newMix }
            },
            activeReaction: reaction
        };
    })
}));

export default useLab2DStore;
