import { soundManager } from './soundManager';

class VoiceManager {
    constructor() {
        this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
        this.currentUtterance = null;
        this.voiceName = '';
        this.voiceGender = 'auto';
        this.rate = 1;
        this.pitch = 1;
        this.stateListeners = new Set();
        this.voicesLoaded = false;
        this.voiceResolverAttached = false;
    }

    isSupported() {
        return !!this.synth && typeof window !== 'undefined' && !!window.SpeechSynthesisUtterance;
    }

    ensureVoiceLoading() {
        if (!this.isSupported() || this.voiceResolverAttached) return;
        this.voiceResolverAttached = true;
        const markLoaded = () => {
            const list = this.synth.getVoices() || [];
            if (list.length > 0) this.voicesLoaded = true;
        };
        markLoaded();
        this.synth.onvoiceschanged = () => markLoaded();
    }

    onStateChange(listener) {
        this.stateListeners.add(listener);
        return () => this.stateListeners.delete(listener);
    }

    emitState(isSpeaking) {
        this.stateListeners.forEach((listener) => {
            try {
                listener(isSpeaking);
            } catch {
                // no-op
            }
        });
    }

    getVoices() {
        if (!this.isSupported()) return [];
        this.ensureVoiceLoading();
        return this.synth.getVoices() || [];
    }

    setVoice(voiceName) {
        this.voiceName = String(voiceName || '');
    }

    setVoiceByGender(gender) {
        this.voiceGender = gender === 'male' || gender === 'female' ? gender : 'auto';

        // Re-apply voice target immediately for next utterance.
        const voices = this.getVoices();
        if (!voices.length || this.voiceGender === 'auto') return;

        const maleHints = ['male', 'david', 'google uk english male', 'microsoft mark', 'guy'];
        const femaleHints = ['female', 'samantha', 'google us english', 'zira', 'aria', 'jenny'];
        const hints = this.voiceGender === 'male' ? maleHints : femaleHints;
        const match = voices.find((voice) => {
            const n = `${voice.name} ${voice.lang}`.toLowerCase();
            return hints.some((hint) => n.includes(hint));
        });

        if (match) {
            this.voiceName = match.name;
        } else {
            this.voiceName = '';
        }
    }

    setRate(rate) {
        this.rate = Math.min(2, Math.max(0.5, Number(rate) || 1));
    }

    setPitch(pitch) {
        this.pitch = Math.min(2, Math.max(0, Number(pitch) || 1));
    }

    duckLabAudio(isActive) {
        soundManager.setVoiceActive(isActive);
    }

    sanitizeForSpeech(text) {
        return String(text || '')
            .replace(/```[\s\S]*?```/g, ' code block omitted ')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
            .replace(/[#>*_~|]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    stop() {
        if (!this.isSupported()) return;
        this.synth.cancel();
        this.currentUtterance = null;
        this.emitState(false);
        this.duckLabAudio(false);
    }

    pause() {
        if (!this.isSupported()) return;
        if (this.synth.speaking) this.synth.pause();
    }

    resume() {
        if (!this.isSupported()) return;
        if (this.synth.paused) this.synth.resume();
    }

    resolveVoice() {
        const voices = this.getVoices();
        if (!voices.length) return null;

        // Highest priority: explicitly selected voice.
        if (this.voiceName) {
            const direct = voices.find((item) => item.name === this.voiceName);
            if (direct) return direct;
        }

        if (this.voiceGender && this.voiceGender !== 'auto') {
            this.setVoiceByGender(this.voiceGender);
            if (this.voiceName) {
                const genderMatch = voices.find((item) => item.name === this.voiceName);
                if (genderMatch) return genderMatch;
            }
        }

        const preferredDefaults = ['samantha', 'jenny', 'aria', 'zira', 'google us english', 'en-us'];
        const softDefault = voices.find((voice) => {
            const name = `${voice.name} ${voice.lang}`.toLowerCase();
            return preferredDefaults.some((hint) => name.includes(hint));
        });
        return softDefault || voices[0] || null;
    }

    speak(text) {
        if (!this.isSupported()) return false;
        const value = this.sanitizeForSpeech(text);
        if (!value) return false;

        // Prevent overlap by stopping previous speech first.
        this.stop();

        const utterance = new window.SpeechSynthesisUtterance(value);
        const voice = this.resolveVoice();
        if (voice) utterance.voice = voice;
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;
        utterance.volume = 0.92;

        utterance.onstart = () => {
            this.emitState(true);
            this.duckLabAudio(true);
        };
        utterance.onend = () => {
            this.currentUtterance = null;
            this.emitState(false);
            this.duckLabAudio(false);
        };
        utterance.onerror = () => {
            this.currentUtterance = null;
            this.emitState(false);
            this.duckLabAudio(false);
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
        return true;
    }
}

export const voiceManager = new VoiceManager();
export default voiceManager;
