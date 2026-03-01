import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Zap, RotateCcw, Star, ChevronRight, Atom } from 'lucide-react';
import useGameStore from '../../store/useGameStore';

/**
 * Quiz bank keyed by lesson id.
 * Each question has level-appropriate text and an explanation.
 */
const LESSON_QUIZ_BANK = {
    ph_mastery: [
        {
            id: 'ph1',
            levels: {
                basic: "What happens to the pH when you add an acid like HCl to water?",
                intermediate: "What is the relationship between [H⁺] concentration and pH?",
                expert: "If 20mL of 1M HCl is added to 100mL of water, what is the theoretical pH? (assume full dissociation)",
            },
            options: [
                { basic: "It goes down (more acidic)", intermediate: "pH decreases as [H⁺] increases", expert: "pH ≈ 1.78" },
                { basic: "It goes up (more basic)", intermediate: "pH increases as [H⁺] increases", expert: "pH ≈ 2.41" },
                { basic: "It stays the same", intermediate: "pH stays the same", expert: "pH = 7.0" },
                { basic: "It becomes 14", intermediate: "pH and [H⁺] are directly proportional", expert: "pH ≈ 0.5" },
            ],
            answerIndex: 0,
            explanation: {
                basic: "Adding an acid introduces more H+ ions into the solution, which lowers the pH making it more acidic.",
                intermediate: "pH = -log₁₀[H⁺]. As [H⁺] increases, the log value decreases, so pH goes down.",
                expert: "C_final = (20mL × 1M) / 120mL = 0.1667M. pH = -log(0.1667) ≈ 0.78. However since total volume is 120mL, pH ≈ 0.78.",
            },
            xp: 30
        },
        {
            id: 'ph2',
            levels: {
                basic: "What chemical do you add to neutralize an acid?",
                intermediate: "What is the equivalence point in an acid-base titration?",
                expert: "At the equivalence point for HCl + NaOH, what species are present in the highest concentration?",
            },
            options: [
                { basic: "A base (like NaOH)", intermediate: "The point where moles of acid = moles of base", expert: "Na⁺, Cl⁻, and H₂O" },
                { basic: "More acid", intermediate: "The point where pH = 7 always", expert: "H⁺ and OH⁻ only" },
                { basic: "Water", intermediate: "The point where indicator changes color", expert: "NaOH in excess" },
                { basic: "Salt", intermediate: "The midpoint of the buffer region", expert: "HCl and NaOH equally" },
            ],
            answerIndex: 0,
            explanation: {
                basic: "A base like NaOH provides OH- ions that react with the H+ from an acid in a neutralization reaction.",
                intermediate: "The equivalence point is when stoichiometrically equal moles of acid and base have reacted. pH=7 only for strong acid + strong base.",
                expert: "At equivalence, all HCl and NaOH are consumed, leaving Na⁺, Cl⁻ (spectator ions) and H₂O. pH = 7 for this strong-strong pair.",
            },
            xp: 35
        },
        {
            id: 'ph3',
            levels: {
                basic: "On the pH scale, what number represents a neutral solution?",
                intermediate: "What is the pOH if the pH of a solution is 9?",
                expert: "Calculate [OH⁻] for a solution with pH = 11.3.",
            },
            options: [
                { basic: "7", intermediate: "5", expert: "2.0 × 10⁻³ M" },
                { basic: "0", intermediate: "9", expert: "5.0 × 10⁻⁴ M" },
                { basic: "14", intermediate: "14", expert: "2.0 × 10⁻¹¹ M" },
                { basic: "1", intermediate: "4", expert: "1.0 × 10⁻³ M" },
            ],
            answerIndex: 0,
            explanation: {
                basic: "pH 7 is the midpoint and represents a neutral solution like pure water at 25°C.",
                intermediate: "pOH = 14 - pH = 14 - 9 = 5. The relationship is: pH + pOH = 14 at 25°C.",
                expert: "pOH = 14 - 11.3 = 2.7. [OH⁻] = 10^(-2.7) ≈ 2.0 × 10⁻³ M.",
            },
            xp: 40
        },
    ],
    acid_base_101: [
        {
            id: 'ab1',
            levels: {
                basic: "What color does Phenolphthalein turn in a basic solution?",
                intermediate: "What is the pH range at which Phenolphthalein changes color?",
                expert: "Why does Phenolphthalein become pink/magenta in basic solution?",
            },
            options: [
                { basic: "Pink/Magenta", intermediate: "pH 8.2 to 10.0", expert: "Deprotonation creates a new chromophore structure" },
                { basic: "Blue", intermediate: "pH 4.4 to 6.2", expert: "Protonation of the ring system" },
                { basic: "Yellow", intermediate: "pH 0 to 3", expert: "Precipitation of the indicator" },
                { basic: "Green", intermediate: "pH 11 to 14", expert: "UV absorption shift" },
            ],
            answerIndex: 0,
            explanation: {
                basic: "Phenolphthalein is colorless in acidic/neutral solution and turns pink or magenta in basic solution above pH ~8.2.",
                intermediate: "Phenolphthalein transitions from colorless to pink between pH 8.2 and 10.0. Below 8.2 it is colorless.",
                expert: "In basic conditions, phenolphthalein loses two protons (pKa₁ ≈ 9.7, pKin ≈ 9.7). This deprotonation opens the lactone ring, creating an extended π-conjugation system that absorbs visible light and appears pink.",
            },
            xp: 25
        },
        {
            id: 'ab2',
            levels: {
                basic: "HCl + NaOH produces which two products?",
                intermediate: "Write the net ionic equation for HCl and NaOH neutralization.",
                expert: "Calculate the ΔH for the neutralization of HCl(aq) + NaOH(aq), given that ΔHf of H₂O(l) = -285.8 kJ/mol.",
            },
            options: [
                { basic: "NaCl + Water", intermediate: "H⁺ + OH⁻ → H₂O", expert: "ΔH = -57.1 kJ/mol (approx)" },
                { basic: "NaOH + HCl₂", intermediate: "Na⁺ + Cl⁻ → NaCl", expert: "ΔH = +57.1 kJ/mol" },
                { basic: "H₂ + Cl₂", intermediate: "HCl + NaOH → H₂NaCl", expert: "ΔH = -285.8 kJ/mol" },
                { basic: "Na + H₂O", intermediate: "H₂O → H⁺ + OH⁻", expert: "ΔH = 0 kJ/mol (no change)" },
            ],
            answerIndex: 0,
            explanation: {
                basic: "HCl (acid) and NaOH (base) neutralize each other to form NaCl (salt) and H₂O (water).",
                intermediate: "Spectator ions (Na⁺, Cl⁻) cancel, leaving only the net: H⁺(aq) + OH⁻(aq) → H₂O(l).",
                expert: "The heat of neutralization for a strong acid + strong base is approximately -57.1 kJ/mol, representing the enthalpy of the net reaction H⁺ + OH⁻ → H₂O.",
            },
            xp: 35
        },
    ]
};

function getQuestions(lessonId, level) {
    const bank = LESSON_QUIZ_BANK[lessonId] || LESSON_QUIZ_BANK['ph_mastery'];
    return bank.map(q => ({
        id: q.id,
        text: q.levels[level] || q.levels['basic'],
        options: q.options.map(o => o[level] || o['basic']),
        answerIndex: q.answerIndex,
        explanation: q.explanation[level] || q.explanation['basic'],
        xp: q.xp,
    }));
}

export default function PostExperimentQuiz({ lessonId, knowledgeLevel = 'basic', onClose }) {
    const { addXP } = useGameStore();
    const questions = useMemo(() => getQuestions(lessonId, knowledgeLevel), [lessonId, knowledgeLevel]);

    const [qIndex, setQIndex] = useState(0);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [result, setResult] = useState(null);
    const [totalXP, setTotalXP] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [phase, setPhase] = useState('quiz'); // 'quiz' | 'summary'

    const q = questions[qIndex];

    const handleAnswer = (idx) => {
        if (result) return;
        setSelectedIdx(idx);
        const correct = idx === q.answerIndex;
        setResult({ correct, xp: correct ? q.xp : 0 });
        if (correct) {
            setTotalXP(prev => prev + q.xp);
            setCorrectCount(c => c + 1);
            addXP(q.xp);
        }
    };

    const handleNext = () => {
        if (qIndex + 1 >= questions.length) {
            setPhase('summary');
        } else {
            setQIndex(i => i + 1);
            setSelectedIdx(null);
            setResult(null);
        }
    };

    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    const levelColors = {
        basic: 'from-emerald-600 to-teal-600',
        intermediate: 'from-blue-600 to-indigo-600',
        expert: 'from-purple-600 to-fuchsia-600',
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 30 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className="w-full max-w-lg relative"
            >
                <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]">

                    {/* Header strip */}
                    <div className={`bg-gradient-to-r ${levelColors[knowledgeLevel]} p-5 flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                                <Atom className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-[9px] font-black text-white/70 uppercase tracking-[0.3em]">Post-Experiment Quiz</div>
                                <div className="text-sm font-black text-white tracking-tight">
                                    {knowledgeLevel.charAt(0).toUpperCase() + knowledgeLevel.slice(1)} Level
                                </div>
                            </div>
                        </div>
                        {phase === 'quiz' && (
                            <div className="flex flex-col items-end">
                                <div className="text-[9px] font-black text-white/60 uppercase tracking-widest">Question</div>
                                <div className="text-lg font-black text-white font-mono">{qIndex + 1}/{questions.length}</div>
                            </div>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {phase === 'quiz' ? (
                            <motion.div key={`q-${qIndex}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-7">

                                {/* Progress dots */}
                                <div className="flex gap-1.5 mb-6">
                                    {questions.map((_, i) => (
                                        <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-500 ${i < qIndex ? 'bg-green-500' : i === qIndex ? 'bg-white' : 'bg-white/10'
                                            }`} />
                                    ))}
                                </div>

                                {/* Question */}
                                <h3 className="text-base font-bold text-white mb-6 leading-relaxed">{q.text}</h3>

                                {/* Options */}
                                <div className="flex flex-col gap-2.5 mb-6">
                                    {q.options.map((opt, idx) => {
                                        const isCorrect = idx === q.answerIndex;
                                        const isSelected = idx === selectedIdx;
                                        let cls = 'bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/8 hover:border-white/20';
                                        if (result) {
                                            if (isCorrect) cls = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300';
                                            else if (isSelected) cls = 'bg-red-500/15 border-red-500/50 text-red-300';
                                        }
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswer(idx)}
                                                disabled={!!result}
                                                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all text-sm font-medium flex items-center justify-between ${cls}`}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-black shrink-0">
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    {opt}
                                                </span>
                                                {result && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                                                {result && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Explanation */}
                                <AnimatePresence>
                                    {result && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                            className={`overflow-hidden rounded-xl p-4 border mb-4 ${result.correct ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-red-500/8 border-red-500/20'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                {result.correct
                                                    ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Correct! +{result.xp} XP</span></>
                                                    : <><XCircle className="w-4 h-4 text-red-400" /><span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Incorrect</span></>
                                                }
                                            </div>
                                            <p className="text-[11px] text-white/60 leading-relaxed">{q.explanation}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Next button */}
                                {result && (
                                    <button
                                        onClick={handleNext}
                                        className="w-full py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white font-black text-[10px] tracking-[0.3em] uppercase hover:bg-white/15 transition-all flex items-center justify-center gap-2"
                                    >
                                        {qIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            // Summary screen
                            <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-7">
                                <div className="text-center mb-6">
                                    <div className={`inline-flex w-20 h-20 rounded-full items-center justify-center bg-gradient-to-br ${levelColors[knowledgeLevel]} shadow-[0_0_40px_rgba(168,85,247,0.3)] mb-4`}>
                                        <Trophy className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Experiment Complete!</h3>
                                    <p className="text-sm text-gray-400 mt-1">Here's how you did on your quiz</p>
                                </div>

                                {/* Stats grid */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 text-center">
                                        <div className="text-2xl font-black text-white font-mono">{accuracy}%</div>
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Accuracy</div>
                                    </div>
                                    <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/20 text-center">
                                        <div className="text-2xl font-black text-emerald-400 font-mono">{correctCount}</div>
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Correct</div>
                                    </div>
                                    <div className="rounded-2xl p-4 bg-yellow-500/10 border border-yellow-500/20 text-center">
                                        <div className="text-2xl font-black text-yellow-400 font-mono">+{totalXP}</div>
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">XP Earned</div>
                                    </div>
                                </div>

                                {/* Accuracy bar */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">
                                        <span>Performance</span>
                                        <span>{accuracy >= 70 ? '🎉 Great Job!' : accuracy >= 40 ? '📚 Keep Practicing' : '💡 Review the Theory'}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${accuracy}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className={`h-full rounded-full bg-gradient-to-r ${levelColors[knowledgeLevel]}`}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setQIndex(0); setSelectedIdx(null); setResult(null); setTotalXP(0); setCorrectCount(0); setPhase('quiz'); }}
                                        className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" /> Retry
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className={`flex-[2] py-3.5 rounded-2xl bg-gradient-to-r ${levelColors[knowledgeLevel]} text-white font-black text-[10px] tracking-widest uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(168,85,247,0.3)]`}
                                    >
                                        <Zap className="w-3.5 h-3.5" /> Back to Lab
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
