import { Howl, Howler } from 'howler';

/**
 * SoundManager v4
 * - Global unlock for autoplay restrictions
 * - Category volume controls (lab/ui/voice)
 * - Loop overlap prevention with fade in/out
 * - Voice/lab coexistence through ducking
 */
class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.immersiveMode = false;
        this.categoryVolumes = {
            lab: 1,
            ui: 1,
            voice: 1
        };
        this.voiceActive = false;
        this.sounds = {};
        this.activeLoops = new Map();
        this.pendingQueue = [];
        this.isInitialized = false;
        this.isUnlocked = false;
        this.unlockBound = false;
        this.debug = false;

        this.soundLib = {
            pour: { src: '/sounds/pour.mp3', loop: true, category: 'lab' },
            flame: { src: '/sounds/burner.mp3', loop: true, category: 'lab' },
            bubbles: { src: '/sounds/bubbles.mp3', loop: true, category: 'lab' },
            stirring: { src: '/sounds/stirring.mp3', loop: true, volume: 0.35, category: 'lab' },
            gas_release: { src: '/sounds/gas-release.mp3', category: 'lab' },
            clink: { src: '/sounds/glass-clink.mp3', category: 'ui' },
            drop: { src: '/sounds/droplet.mp3', category: 'ui' },
            success: { src: '/sounds/success.mp3', category: 'ui' },
            warning: { src: '/sounds/warning.mp3', category: 'ui' },
            ambient: { src: '/sounds/lab-ambient.mp3', loop: true, volume: 0.2, category: 'lab' }
        };
    }

    getTargetVolume(key) {
        const config = this.soundLib[key];
        const base = (config?.volume ?? 1) * this.volume;
        const category = this.categoryVolumes[config?.category || 'lab'] ?? 1;
        const duck = this.voiceActive && config?.category === 'lab' ? 0.35 : 1;
        return Math.max(0, Math.min(1, base * category * duck));
    }

    setDebug(enabled) {
        this.debug = !!enabled;
    }

    log(...args) {
        if (this.debug) {
            // eslint-disable-next-line no-console
            console.info('[SoundManager]', ...args);
        }
    }

    bindUnlock() {
        if (this.unlockBound || typeof window === 'undefined') return;
        this.unlockBound = true;
        const unlock = () => {
            this.unlockAudio();
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('pointerdown', unlock, { passive: true, once: true });
        window.addEventListener('touchstart', unlock, { passive: true, once: true });
        window.addEventListener('keydown', unlock, { passive: true, once: true });
    }

    unlockAudio() {
        if (this.isUnlocked) return;
        this.isUnlocked = true;
        try {
            Howler.autoUnlock = true;
            Howler.ctx?.resume?.();
        } catch {
            // no-op
        }
        this.log('Audio unlocked');
        this.flushQueue();
    }

    flushQueue() {
        if (!this.isUnlocked || !this.pendingQueue.length) return;
        const queue = [...this.pendingQueue];
        this.pendingQueue = [];
        queue.forEach(({ key, options }) => this.play(key, options));
    }

    init(settings = {}) {
        if (this.isInitialized) {
            this.updateSettings(settings);
            return;
        }

        this.debug = !!settings.debugMode || (typeof window !== 'undefined' && window.location.search.includes('soundDebug=1'));
        this.enabled = settings.soundEnabled ?? true;
        this.volume = settings.soundVolume ?? 0.5;
        this.immersiveMode = settings.immersiveMode ?? false;
        this.bindUnlock();

        Object.entries(this.soundLib).forEach(([key, config]) => {
            if (this.sounds[key]) this.sounds[key].unload();

            this.sounds[key] = new Howl({
                src: [config.src],
                loop: !!config.loop,
                volume: this.getTargetVolume(key),
                preload: true,
                html5: false,
                onload: () => this.log(`Loaded: ${key}`),
                onloaderror: (_, err) => {
                    this.log(`Failed to load: ${key}`, err);
                },
                onplayerror: (_, err) => {
                    this.log(`Failed to play: ${key}`, err);
                }
            });
        });

        this.isInitialized = true;

        if (this.enabled && this.immersiveMode) {
            this.play('ambient', { fadeInMs: 350 });
        }
    }

    setVoiceActive(active) {
        this.voiceActive = !!active;
        Object.keys(this.sounds).forEach((key) => {
            const sound = this.sounds[key];
            if (!sound) return;
            sound.volume(this.getTargetVolume(key));
        });
    }

    updateSettings(settings = {}) {
        if (settings.soundEnabled !== undefined) {
            const wasEnabled = this.enabled;
            this.enabled = !!settings.soundEnabled;
            if (!this.enabled) this.stopAll({ fadeOutMs: 120 });
            if (!wasEnabled && this.enabled && this.immersiveMode) this.play('ambient', { fadeInMs: 250 });
        }

        if (settings.soundVolume !== undefined) {
            this.volume = Math.min(1, Math.max(0, Number(settings.soundVolume) || 0));
        }

        if (settings.immersiveMode !== undefined) {
            const oldImmersive = this.immersiveMode;
            this.immersiveMode = !!settings.immersiveMode;
            if (this.enabled) {
                if (this.immersiveMode && !oldImmersive) this.play('ambient', { fadeInMs: 250 });
                if (!this.immersiveMode && oldImmersive) this.stop('ambient', { fadeOutMs: 250 });
            }
        }

        Object.keys(this.sounds).forEach((key) => {
            const sound = this.sounds[key];
            if (!sound) return;
            sound.volume(this.getTargetVolume(key));
        });
    }

    setMasterVolume(volume) {
        this.updateSettings({ soundVolume: volume });
    }

    setCategoryVolume(category, volume) {
        if (!Object.prototype.hasOwnProperty.call(this.categoryVolumes, category)) return;
        this.categoryVolumes[category] = Math.min(1, Math.max(0, Number(volume) || 0));
        Object.keys(this.sounds).forEach((key) => {
            const sound = this.sounds[key];
            if (sound) sound.volume(this.getTargetVolume(key));
        });
    }

    play(key, options = {}) {
        if (!this.enabled) return null;
        if (!this.isUnlocked) {
            this.pendingQueue.push({ key, options });
            return null;
        }

        const sound = this.sounds[key];
        if (!sound || !this.soundLib[key]) {
            this.log(`Unknown sound key: ${key}`);
            return null;
        }

        const config = this.soundLib[key];
        if (config.loop && this.activeLoops.has(key)) {
            return this.activeLoops.get(key);
        }

        if (sound.state() !== 'loaded') {
            this.log(`Sound not loaded yet: ${key}`);
            return null;
        }

        const id = sound.play();
        const targetVolume = this.getTargetVolume(key);
        const fadeInMs = options.fadeInMs ?? (config.loop ? 180 : 0);
        if (fadeInMs > 0) {
            sound.volume(0, id);
            sound.fade(0, targetVolume, fadeInMs, id);
        } else {
            sound.volume(targetVolume, id);
        }

        if (config.loop) this.activeLoops.set(key, id);
        this.log(`Play: ${key}`);
        return id;
    }

    stop(key, options = {}) {
        const sound = this.sounds[key];
        if (!sound) return;

        const id = this.activeLoops.get(key);
        const fadeOutMs = options.fadeOutMs ?? (this.soundLib[key]?.loop ? 180 : 0);
        if (fadeOutMs > 0 && id) {
            const current = sound.volume(id);
            sound.fade(current, 0, fadeOutMs, id);
            setTimeout(() => {
                sound.stop(id);
            }, fadeOutMs + 20);
        } else if (id) {
            sound.stop(id);
        } else {
            sound.stop();
        }

        this.activeLoops.delete(key);
        this.log(`Stop: ${key}`);
    }

    stopAll(options = {}) {
        Object.keys(this.sounds).forEach((key) => this.stop(key, options));
        this.activeLoops.clear();
    }

    dispose() {
        this.stopAll();
        Object.values(this.sounds).forEach((sound) => sound.unload());
        this.sounds = {};
        this.pendingQueue = [];
        this.isInitialized = false;
    }
}

export const soundManager = new SoundManager();
export const playSound = (key, options) => soundManager.play(key, options);
export const stopSound = (key, options) => soundManager.stop(key, options);
export const stopAllSounds = (options) => soundManager.stopAll(options);
export default soundManager;
