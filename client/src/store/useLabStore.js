import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CHEMISTRY_DATABASE } from '../constants/chemistryData';
import { mixUniversal, processUniversalReaction } from '../engine/UniversalEngine';
import { checkSafety } from '../modules/simulation/safetyEngine';
import useNotebookStore from './useNotebookStore';
import useMissionStore from './useMissionStore';
import useGameStore from './useGameStore';
import useAuthStore from './useAuthStore';
import { storageService } from '../lib/storageService';
import { soundManager } from '../utils/soundManager';
import { safeLocalStorage } from '../utils/safeStorage';

const makeInitialContainers = () => ({
  beaker1: { id: 'beaker1', type: 'beaker', maxCapacity: 500, volume: 0, temp: 25, color: 'rgba(255,255,255,0)', components: [] },
  flask1: { id: 'flask1', type: 'flask', maxCapacity: 250, volume: 0, temp: 25, color: 'rgba(255,255,255,0)', components: [] },
  burette1: { id: 'burette1', type: 'burette', maxCapacity: 50, volume: 50, temp: 25, color: 'rgba(255,255,255,0.1)', components: [{ id: 'sodium_hydroxide', volume: 50 }], isOpen: false },
  burette2: { id: 'burette2', type: 'burette', maxCapacity: 50, volume: 0, temp: 25, color: 'rgba(255,255,255,0)', components: [], isOpen: false },
  testTube1: { id: 'testTube1', type: 'testTube', maxCapacity: 50, volume: 0, temp: 25, color: 'rgba(255,255,255,0)', components: [] },
  testTube2: { id: 'testTube2', type: 'testTube', maxCapacity: 50, volume: 0, temp: 25, color: 'rgba(255,255,255,0)', components: [] }
});

let labStateSyncTimer = null;
const scheduleLabStateSync = (getState) => {
  if (labStateSyncTimer) clearTimeout(labStateSyncTimer);
  labStateSyncTimer = setTimeout(() => {
    const email = useAuthStore.getState().user?.email;
    if (!email) return;
    const state = getState();
    const labState = {
      activeMode: state.activeMode,
      containers: state.containers,
      equipment: state.equipment,
      knowledgeLevel: state.knowledgeLevel,
      currentLesson: state.currentLesson,
      currentStepId: state.currentStepId
    };

    storageService.saveLabState({ email, labState }).catch(() => {
      // best-effort persistence, never block simulation
    });
  }, 700);
};

const useLabStore = create(
  persist(
    (set, get) => ({
      activeMode: '2D',
      containers: makeInitialContainers(),
      equipment: {
        burner: { isOn: false, intensity: 1.0 },
        stirrer: { isActive: false, rpm: 0 }
      },
      activeReaction: null,
      safetyWarning: null,
      knowledgeLevel: 'basic',
      currentLesson: null,
      currentStepId: 0,
      actionTimeline: [],
      historyStack: [],

      setMode: (mode) => set({ activeMode: mode }),
      setKnowledgeLevel: (level) => set({ knowledgeLevel: level }),
      hydrateLabState: (labState) => {
        if (!labState || typeof labState !== 'object') return;
        set((state) => ({
          ...state,
          activeMode: labState.activeMode || state.activeMode,
          containers: labState.containers && typeof labState.containers === 'object' ? labState.containers : state.containers,
          equipment: labState.equipment && typeof labState.equipment === 'object' ? labState.equipment : state.equipment,
          knowledgeLevel: labState.knowledgeLevel || state.knowledgeLevel,
          currentLesson: labState.currentLesson || state.currentLesson,
          currentStepId: Number.isFinite(labState.currentStepId) ? labState.currentStepId : state.currentStepId
        }));
      },

      setLesson: (lesson) => {
        soundManager.play('clink');
        set({ currentLesson: lesson, currentStepId: 0 });
        scheduleLabStateSync(get);
      },

      nextStep: () => {
        soundManager.play('clink');
        set((state) => ({ currentStepId: state.currentStepId + 1 }));
      },

      stopLesson: () => {
        set({ currentLesson: null, currentStepId: 0 });
        scheduleLabStateSync(get);
      },
      clearSafetyWarning: () => set({ safetyWarning: null }),

      toggleEquipment: (key) => {
        set((state) => {
          const newState = !state.equipment[key].isOn;
          if (key === 'burner') {
            newState ? soundManager.play('flame') : soundManager.stop('flame');
          } else {
            soundManager.play('clink');
          }

          return {
            equipment: {
              ...state.equipment,
              [key]: { ...state.equipment[key], isOn: newState }
            }
          };
        });
        scheduleLabStateSync(get);
      },

      addChemical: (containerId, chemId, amount) => {
        set((state) => {
          const previousContainers = JSON.parse(JSON.stringify(state.containers));
          const container = state.containers[containerId];
          if (!container) return state;

          chemId === 'water' || amount > 10 ? soundManager.play('pour') : soundManager.play('drop');
          setTimeout(() => soundManager.stop('pour'), 1000);

          const currentComponentIds = container.components.map((c) => c.id);
          const hazard = checkSafety(currentComponentIds, chemId);
          if (hazard) soundManager.play('warning');

          const chemical = CHEMISTRY_DATABASE[chemId];
          if (chemical) {
            useNotebookStore.getState().addLog(`Added ${amount}mL of ${chemical.name} (${chemical.formula}) to ${containerId}`);
          }

          const newMix = mixUniversal(container, chemId, amount);
          const { mixture: reactedMix, reaction } = processUniversalReaction(newMix);

          if (reaction) {
            if (reaction.isBubbling) soundManager.play('bubbles');
            useNotebookStore.getState().addLog(`REACTION: ${reaction.name} detected. Equation: ${reaction.equation}`);
            useMissionStore.getState().updateProgress('reaction', 1);
            useGameStore.getState().addBadge?.('First Perfect Reaction');
          }

          return {
            containers: {
              ...state.containers,
              [containerId]: reactedMix
            },
            activeReaction: reaction,
            safetyWarning: hazard || state.safetyWarning,
            historyStack: [...state.historyStack.slice(-19), previousContainers],
            actionTimeline: [...state.actionTimeline.slice(-39), {
              ts: Date.now(),
              type: 'add_chemical',
              containerId,
              chemId,
              amount,
              reaction: reaction?.name || null
            }]
          };
        });
        scheduleLabStateSync(get);
      },

      pour: (sourceId, targetId, amount) => {
        set((state) => {
          const previousContainers = JSON.parse(JSON.stringify(state.containers));
          const source = state.containers[sourceId];
          const target = state.containers[targetId];
          if (!source || !target || source.volume <= 0) return state;

          soundManager.play('pour');
          setTimeout(() => soundManager.stop('pour'), 800);

          const actualAmount = Math.min(amount, source.volume);
          useNotebookStore.getState().addLog(`Poured ${actualAmount.toFixed(1)}mL from ${sourceId} to ${targetId}`);
          useMissionStore.getState().updateProgress('pour', 1);

          const dominantChemId = source.components[0]?.id || 'water';
          const targetMix = mixUniversal(target, dominantChemId, actualAmount, source.temp);
          const { mixture: targetReacted, reaction } = processUniversalReaction(targetMix);

          if (reaction) {
            if (reaction.isBubbling) soundManager.play('bubbles');
            useNotebookStore.getState().addLog(`REACTION in ${targetId}: ${reaction.name}. Resulting Temp: ${targetReacted.temp.toFixed(1)} C`);
            useMissionStore.getState().updateProgress('reaction', 1);
            useGameStore.getState().addBadge?.('Fast Chemist');
          }

          const sourceRemRatio = (source.volume - actualAmount) / source.volume;
          const sourceComponents = source.components
            .map((c) => ({ ...c, volume: c.volume * sourceRemRatio }))
            .filter((c) => c.volume > 0.01);

          const sourceState = {
            ...source,
            volume: source.volume - actualAmount,
            components: sourceComponents,
            color: source.volume - actualAmount <= 0 ? 'rgba(255,255,255,0)' : source.color
          };

          return {
            containers: {
              ...state.containers,
              [sourceId]: sourceState,
              [targetId]: targetReacted
            },
            activeReaction: reaction,
            historyStack: [...state.historyStack.slice(-19), previousContainers],
            actionTimeline: [...state.actionTimeline.slice(-39), {
              ts: Date.now(),
              type: 'pour',
              sourceId,
              targetId,
              amount: actualAmount
            }]
          };
        });
        scheduleLabStateSync(get);
      },

      undoLastStep: () => {
        set((state) => {
          if (!state.historyStack.length) return state;
          const previous = state.historyStack[state.historyStack.length - 1];
          return {
            containers: previous,
            activeReaction: null,
            historyStack: state.historyStack.slice(0, -1),
            actionTimeline: [...state.actionTimeline.slice(-39), { ts: Date.now(), type: 'undo' }]
          };
        });
        scheduleLabStateSync(get);
      },

      resetLab: () => {
        soundManager.stopAll();
        soundManager.play('clink');
        set({
          containers: makeInitialContainers(),
          activeReaction: null,
          historyStack: [],
          actionTimeline: []
        });
        scheduleLabStateSync(get);
      }
    }),
    {
      name: 'clab-universal-lab-v6-storage',
      storage: safeLocalStorage
    }
  )
);

export default useLabStore;
