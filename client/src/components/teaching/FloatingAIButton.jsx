import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAIStore from '../../store/useAIStore';
import useAuthStore from '../../store/useAuthStore';
import useVoiceStore from '../../store/useVoiceStore';
import { AIController } from '../../modules/teaching/AIController';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { voiceManager } from '../../utils/VoiceManager';

/**
 * FloatingAIButton - MODE 1: Floating AI Assistant (Mini Copilot)
 * Appears as a small circular button in the bottom-right corner.
 */
const FloatingAIButton = () => {
    // ... logic remains unchanged

    // Render logic update down below...
    const {
        isMiniOpen,
        toggleMiniAssistant,
        miniChatHistory,
        addChatMessage,
        currentPage,
        setCurrentPage,
        userLevel,
        setMode
    } = useAIStore();

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [micError, setMicError] = useState('');
    const chatEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { voiceEnabled, speechRate, speechPitch, selectedVoice, voiceGender, isSpeaking, setIsSpeaking, toggleVoice } = useVoiceStore();

    // Sync current page with store
    useEffect(() => {
        const path = location.pathname;
        let pageName = 'Home';
        if (path.includes('lab2d')) pageName = '2D Lab';
        else if (path.includes('lab')) pageName = '3D Lab';
        else if (path.includes('experiments')) pageName = 'Experiments';
        else if (path.includes('quiz')) pageName = 'Quiz Page';

        setCurrentPage(pageName);
    }, [location.pathname, setCurrentPage]);

    // Proactive help suggestion
    useEffect(() => {
        if (miniChatHistory.length > 2) return; // Only suggest for new sessions

        const timer = setTimeout(() => {
            if (!isMiniOpen) {
                addChatMessage({
                    role: 'assistant',
                    content: `Hey! I noticed you are exploring the ${currentPage} section. Need help understanding any concepts here?`
                }, 'mini_assistant');
            }
        }, 15000); // 15 seconds of exploration

        return () => clearTimeout(timer);
    }, [currentPage, isMiniOpen, miniChatHistory.length, addChatMessage]);

    // Scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [miniChatHistory, isMiniOpen]);

    useEffect(() => {
        voiceManager.setRate(speechRate);
        voiceManager.setPitch(speechPitch);
        voiceManager.setVoice(selectedVoice);
        voiceManager.setVoiceByGender(voiceGender);
        const unsubscribe = voiceManager.onStateChange((value) => setIsSpeaking(value));
        return () => {
            unsubscribe();
        };
    }, [speechRate, speechPitch, selectedVoice, voiceGender, setIsSpeaking]);

    const speakResponse = async (text) => {
        if (!voiceEnabled) return;
        const plain = String(text || '').replace(/[#>*_`]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!plain) return;
        voiceManager.setRate(speechRate);
        voiceManager.setPitch(speechPitch);
        voiceManager.setVoice(selectedVoice);
        voiceManager.setVoiceByGender(voiceGender);
        voiceManager.speak(plain);
    };

    const stopSpeaking = () => {
        voiceManager.stop();
        setIsSpeaking(false);
    };

    const toggleMic = async () => {
        setMicError('');
        const { speechRecognitionManager } = await import('../../utils/SpeechRecognitionManager');
        if (isListening) {
            speechRecognitionManager.stop();
            setIsListening(false);
            return;
        }

        speechRecognitionManager.start({
            onStart: () => setIsListening(true),
            onResult: (text) => setInput(text),
            onEnd: () => setIsListening(false),
            onError: (message) => {
                setMicError(message);
                setIsListening(false);
            }
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;
        setErrorText('');

        const userMsg = { role: 'user', content: input };
        addChatMessage(userMsg, 'mini_assistant');
        const currentInput = input;
        setInput('');
        setIsTyping(true);

        const userEmail = useAuthStore.getState().user?.email || null;

        try {
            const response = await AIController.sendMessage({
                message: currentInput,
                context: currentPage,
                level: userLevel,
                mode: 'mini_assistant',
                userEmail
            });

            addChatMessage({ role: 'assistant', content: response }, 'mini_assistant');
            await speakResponse(response);
        } catch (error) {
            const safeMessage = error?.message || 'AI is currently unavailable.';
            setErrorText(safeMessage);
            addChatMessage({ role: 'assistant', content: `**AI Error:** ${safeMessage}` }, 'mini_assistant');
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-4 z-[9999] flex flex-col items-end md:bottom-5 md:right-5">
            {/* Chat Popup */}
            <AnimatePresence>
                {isMiniOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="mb-4 h-[450px] w-80 glass-sheen rounded-2xl border border-cyan-400/30 bg-slate-900/92 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white flex justify-between items-center shadow-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🧪</span>
                                <div>
                                    <h3 className="text-sm font-bold">Chemistry Master</h3>
                                    <p className="text-[10px] opacity-80">Mini Assistant • {currentPage}</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleMiniAssistant}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/50">
                            {miniChatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-cyan-600 text-white rounded-br-none'
                                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none shadow-inner'
                                        }`}>
                                        <div className="prose prose-invert prose-sm max-w-none break-words">
                                            <ReactMarkdown>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                            {!!errorText && (
                                <div className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                                    {errorText}
                                </div>
                            )}
                            {!!micError && (
                                <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                                    {micError}
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Footer Controls */}
                        <div className="p-3 border-t border-slate-800 flex flex-col gap-2 bg-slate-900/50">
                            {miniChatHistory.length > 5 && (
                                <motion.button
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    onClick={() => {
                                        setMode('full_learning');
                                        toggleMiniAssistant();
                                        navigate('/ai-chemistry-master');
                                    }}
                                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all"
                                >
                                    ✨ Deep Discussion? Open Full AI
                                </motion.button>
                            )}

                            <button
                                onClick={() => {
                                    setMode('full_learning');
                                    toggleMiniAssistant();
                                    navigate('/ai-chemistry-master');
                                }}
                                className="text-[10px] py-1 px-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full hover:bg-cyan-500/20 transition-all text-center uppercase tracking-wider font-bold"
                            >
                                🚀 Expand to Full AI Learning Mode
                            </button>

                            <div className="flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={toggleVoice}
                                    className={`text-[10px] px-2 py-1 rounded-lg border ${voiceEnabled ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10' : 'text-slate-400 border-slate-700 bg-slate-800/60'}`}
                                >
                                    <Volume2 className="w-3.5 h-3.5 inline mr-1" />
                                    Voice {voiceEnabled ? 'On' : 'Off'}
                                </button>
                                <button
                                    type="button"
                                    onClick={stopSpeaking}
                                    className="text-[10px] px-2 py-1 rounded-lg border border-rose-500/40 text-rose-300 bg-rose-500/10"
                                >
                                    <Square className="w-3.5 h-3.5 inline mr-1" />
                                    Stop
                                </button>
                            </div>

                            {isSpeaking && (
                                <div className="flex items-end gap-1 h-4 px-2">
                                    <span className="w-1 h-2 bg-emerald-400 rounded animate-pulse" />
                                    <span className="w-1 h-4 bg-emerald-300 rounded animate-pulse [animation-delay:80ms]" />
                                    <span className="w-1 h-3 bg-emerald-400 rounded animate-pulse [animation-delay:160ms]" />
                                    <span className="text-[10px] text-emerald-300 ml-1">Speaking...</span>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything..."
                                    disabled={isTyping}
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={toggleMic}
                                    className={`p-2 rounded-xl text-white transition-colors ${isListening ? 'bg-rose-600 hover:bg-rose-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                                >
                                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isTyping || !input.trim()}
                                    className="bg-cyan-600 hover:bg-cyan-500 p-2 rounded-xl text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19 l9 2 -9 -18 -9 18 9 -2 z m0 0 v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMiniAssistant}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all ${isMiniOpen
                    ? 'bg-slate-800 border-2 border-cyan-500 text-cyan-500 rotate-90'
                    : 'bg-gradient-to-br from-blue-500 via-violet-500 to-rose-500 text-white shadow-[0_16px_28px_rgba(59,130,246,0.4)]'
                    }`}
            >
                {isMiniOpen ? '✕' : '⚗️'}
                {!isMiniOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
};

export default FloatingAIButton;
