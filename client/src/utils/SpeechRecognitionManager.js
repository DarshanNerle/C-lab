class SpeechRecognitionManager {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.lastStartAt = 0;
    }

    getCtor() {
        if (typeof window === 'undefined') return null;
        return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    }

    isSupported() {
        return !!this.getCtor();
    }

    start({ onResult, onError, onStart, onEnd, lang = 'en-US' } = {}) {
        const Ctor = this.getCtor();
        if (!Ctor) {
            onError?.('Speech recognition is not supported in this browser.');
            return false;
        }

        // Debounce rapid re-activation.
        const now = Date.now();
        if (now - this.lastStartAt < 500) return false;
        this.lastStartAt = now;

        this.stop();
        const recognition = new Ctor();
        this.recognition = recognition;
        recognition.lang = lang;
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            this.isListening = true;
            onStart?.();
        };

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                transcript += event.results[i][0].transcript;
            }
            const last = event.results[event.results.length - 1];
            const isFinal = !!last?.isFinal;
            onResult?.(transcript.trim(), isFinal);
        };

        recognition.onerror = (event) => {
            const code = event?.error || 'unknown_error';
            const message = code === 'not-allowed'
                ? 'Microphone permission denied.'
                : code === 'no-speech'
                    ? 'No speech detected.'
                    : 'Speech recognition failed.';
            onError?.(message);
        };

        recognition.onend = () => {
            this.isListening = false;
            onEnd?.();
        };

        recognition.start();
        return true;
    }

    stop() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch {
                // no-op
            }
            this.recognition = null;
        }
        this.isListening = false;
    }
}

export const speechRecognitionManager = new SpeechRecognitionManager();
export default speechRecognitionManager;
