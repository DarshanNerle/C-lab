import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeLocalStorage } from '../utils/safeStorage';

const useVoiceStore = create(
    persist(
        (set) => ({
            voiceEnabled: false,
            speechRate: 0.95,
            speechPitch: 0.9,
            selectedVoice: '',
            voiceGender: 'auto',
            isSpeaking: false,

            setVoiceEnabled: (value) => set({ voiceEnabled: !!value }),
            toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),
            setSpeechRate: (value) => set({ speechRate: Math.min(2, Math.max(0.5, Number(value) || 0.95)) }),
            setSpeechPitch: (value) => set({ speechPitch: Math.min(2, Math.max(0, Number(value) || 0.9)) }),
            setSelectedVoice: (value) => set({ selectedVoice: String(value || '') }),
            setVoiceGender: (value) => set({ voiceGender: value === 'male' || value === 'female' ? value : 'auto' }),
            setIsSpeaking: (value) => set({ isSpeaking: !!value }),

            syncSettings: (settings = {}) => set({
                voiceEnabled: !!settings.voiceEnabled,
                speechRate: Math.min(2, Math.max(0.5, Number(settings.speechRate) || 0.95)),
                speechPitch: Math.min(2, Math.max(0, Number(settings.speechPitch) || 0.9)),
                selectedVoice: String(settings.selectedVoice || ''),
                voiceGender: settings.voiceGender === 'male' || settings.voiceGender === 'female' ? settings.voiceGender : 'auto'
            })
        }),
        {
            name: 'c-lab-voice-settings',
            storage: safeLocalStorage,
            partialize: (state) => ({
                voiceEnabled: state.voiceEnabled,
                speechRate: state.speechRate,
                speechPitch: state.speechPitch,
                selectedVoice: state.selectedVoice,
                voiceGender: state.voiceGender
            })
        }
    )
);

export default useVoiceStore;
