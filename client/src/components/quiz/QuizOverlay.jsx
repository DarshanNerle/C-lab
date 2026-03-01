import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Zap, Star, Trophy, ArrowRight } from 'lucide-react';
import useQuizStore from '../../store/useQuizStore';
import useGameStore from '../../store/useGameStore';

/**
 * C-Lab 5.0 Quiz Overlay
 * A sleek, high-engagement challenge UI.
 */
export default function QuizOverlay() {
    const { activeQuiz, submitAnswer, streak, resetQuiz } = useQuizStore();
    const { addXP } = useGameStore();

    const [selectedOption, setSelectedOption] = useState(null);
    const [result, setResult] = useState(null); // { success: boolean, xp: number }

    if (!activeQuiz) return null;

    const handleAnswer = (option) => {
        if (result) return;
        setSelectedOption(option);

        const outcome = submitAnswer(option);
        setResult(outcome);

        if (outcome.success) {
            addXP(outcome.xp);
        }

        // Result is set, user will manually close via button
    };

    const handleClose = () => {
        setResult(null);
        setSelectedOption(null);
        resetQuiz();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
            >
                {/* Header: Streak & Progress */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                            <Zap className="text-yellow-300 w-5 h-5 fill-yellow-300" />
                        </div>
                        <div>
                            <div className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Active Streak</div>
                            <div className="text-lg font-bold text-white leading-tight">{streak} Correct</div>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-white/50 hover:text-white transition-colors">
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="mb-8">
                        <span className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">{activeQuiz.type} Challenge</span>
                        <h2 className="text-xl font-bold text-white leading-snug">
                            {activeQuiz.text}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {activeQuiz.options.map((option, idx) => {
                            const isCorrect = option === activeQuiz.correctAnswer;
                            const isSelected = option === selectedOption;

                            let style = "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300";
                            if (result) {
                                if (isCorrect) style = "bg-green-500/20 border-green-500/50 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                                else if (isSelected) style = "bg-red-500/20 border-red-500/50 text-red-300";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    disabled={!!result}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between font-medium ${style}`}
                                >
                                    <span>{option}</span>
                                    {result && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                    {result && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Feedback */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className={`p-8 border-t flex flex-col gap-6 ${result.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    {result.success ? (
                                        <div className="bg-green-500 p-3 rounded-2xl shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                                            <Trophy className="text-white w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="bg-red-500 p-3 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                                            <Star className="text-white w-5 h-5" />
                                        </div>
                                    )}
                                    <div>
                                        <div className={`font-black uppercase tracking-tighter text-lg ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                                            {result.success ? 'Breakthrough!' : 'System Fault'}
                                        </div>
                                        <div className={`${result.success ? 'text-green-500/70' : 'text-red-500/70'} text-[10px] font-black tracking-widest uppercase`}>
                                            {result.success ? `+${result.xp} Neural Adapters` : 'Calibration Reset'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-mono text-white/20 font-black uppercase tracking-widest">Scientific Analysis</div>
                            </div>

                            <div className={`p-5 rounded-2xl border ${result.success ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                <p className={`text-xs leading-relaxed font-medium ${result.success ? 'text-green-100/80' : 'text-red-100/80'}`}>
                                    {activeQuiz.explanation || "No telemetry data available for this query."}
                                </p>
                            </div>

                            <button
                                onClick={handleClose}
                                className={`w-full py-4 rounded-2xl font-black text-xs tracking-[0.3em] transition-all uppercase flex items-center justify-center gap-3 ${result.success
                                    ? 'bg-green-500 hover:bg-green-400 text-white shadow-[0_10px_20px_rgba(34,197,94,0.3)]'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                    }`}
                            >
                                {result.success ? 'Sync & Continue' : 'Retry Protocol'} <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
