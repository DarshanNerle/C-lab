import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lightbulb, CheckCircle2, ChevronRight, Target, Zap,
    BookOpen, Atom, FlaskConical, X, Droplets
} from 'lucide-react';
import useLabStore from '../../store/useLabStore';
import { CHEMISTRY_DATABASE } from '../../constants/chemistryData';

const LEVEL_META = {
    basic: { icon: BookOpen, label: 'Basic', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', accent: '#10b981' },
    intermediate: { icon: FlaskConical, label: 'Intermediate', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', accent: '#3b82f6' },
    expert: { icon: Atom, label: 'Expert', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', accent: '#a855f7' },
};

const phColor = (ph) => {
    if (ph < 3) return '#ef4444';
    if (ph < 7) return '#f97316';
    if (ph <= 7.1) return '#22d3ee';
    if (ph < 11) return '#a855f7';
    return '#3b82f6';
};

/**
 * GuidedExperimentHUD
 * Shows lesson progress, current step goal, level-tailored hints,
 * a live pH readout, and a Stop Lesson dismiss button.
 */
export default function GuidedExperimentHUD({ onExperimentComplete }) {
    const {
        currentLesson,
        currentStepId,
        knowledgeLevel,
        containers,
        nextStep,
        stopLesson,
    } = useLabStore();

    const [hintVisible, setHintVisible] = useState(false);
    const [stepComplete, setStepComplete] = useState(false);
    const [showStopConfirm, setShowStopConfirm] = useState(false);

    // Guided lessons always target flask1
    const container = containers['flask1'];
    const steps = currentLesson?.steps || [];
    const currentStep = steps[currentStepId];
    const isLastStep = currentStepId >= steps.length - 1;
    const level = knowledgeLevel || 'basic';
    const meta = LEVEL_META[level];
    const LevelIcon = meta.icon;
    const livePH = container?.ph ?? 7.0;

    // ── Progress detection ────────────────────────────────────────────────────
    useEffect(() => {
        if (!currentStep || !container) return;
        const target = currentStep.target;
        let done = false;

        if (target.goal === 'ph_range') {
            const [min, max] = target.range;
            done = container.ph >= min && container.ph <= max;
        } else if (target.chem && target.vol) {
            done = (container.components || []).some(
                c => c.id === target.chem && c.volume >= target.vol
            );
        } else if (target.chem) {
            done = (container.components || []).some(c => c.id === target.chem);
        }

        setStepComplete(done);
    }, [container, currentStep]);

    const handleNextStep = () => {
        setStepComplete(false);
        setHintVisible(false);
        if (isLastStep) {
            onExperimentComplete?.();
        } else {
            nextStep();
        }
    };

    const handleStop = () => {
        stopLesson();
        setShowStopConfirm(false);
        setStepComplete(false);
        setHintVisible(false);
    };

    if (!currentLesson) return null;

    const progressPercent = steps.length > 0 ? (currentStepId / steps.length) * 100 : 0;
    const completedFill = steps.length > 0 ? ((currentStepId + (stepComplete ? 1 : 0)) / steps.length) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-col gap-3"
        >
            {/* ── Header row ─────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">Active Lesson</div>
                    <div className="text-sm font-black text-white mt-0.5 leading-tight truncate">{currentLesson.title}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {/* Level badge */}
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${meta.bg} ${meta.border}`}>
                        <LevelIcon className={`w-3 h-3 ${meta.color}`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${meta.color}`}>{meta.label}</span>
                    </div>
                    {/* Dismiss button */}
                    <button
                        onClick={() => setShowStopConfirm(true)}
                        className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                        title="Stop lesson"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* ── Stop confirmation ──────────────────────────────────────────── */}
            <AnimatePresence>
                {showStopConfirm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-xl p-3 bg-red-500/10 border border-red-500/30"
                    >
                        <p className="text-[10px] text-red-300 font-bold mb-2">Stop this lesson? Your progress will be lost.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowStopConfirm(false)}
                                className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                Keep Going
                            </button>
                            <button onClick={handleStop}
                                className="flex-1 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-all">
                                Stop
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Progress bar + step count ──────────────────────────────────── */}
            <div>
                <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        animate={{ width: `${completedFill}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    />
                    {/* Step tick marks */}
                    {steps.map((_, i) => (
                        <div key={i}
                            className="absolute top-0 h-full w-px bg-black/40"
                            style={{ left: `${((i + 1) / steps.length) * 100}%` }}
                        />
                    ))}
                </div>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] text-white/20 font-mono">
                        {Array.from({ length: steps.length }, (_, i) => (
                            <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 ${i < currentStepId ? 'bg-emerald-500'
                                    : i === currentStepId && stepComplete ? 'bg-emerald-400 animate-pulse'
                                        : i === currentStepId ? 'bg-cyan-500'
                                            : 'bg-white/10'
                                }`} />
                        ))}
                    </span>
                    <span className="text-[9px] text-white/30 font-mono">{currentStepId + 1} / {steps.length}</span>
                </div>
            </div>

            {/* ── Live pH mini-display ──────────────────────────────────────── */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2">
                    <Droplets className="w-3 h-3" style={{ color: phColor(livePH) }} />
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-black">Flask pH</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Mini spectrum */}
                    <div className="hidden sm:block relative w-20 h-1.5 rounded-full overflow-visible"
                        style={{ background: 'linear-gradient(to right,#ef4444,#f97316,#eab308,#22c55e,#22d3ee,#a855f7,#3b82f6)' }}>
                        <motion.div
                            animate={{ left: `${(Math.min(14, Math.max(0, livePH)) / 14) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                            className="absolute -top-0.5 -translate-x-1/2 w-2 h-2.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)] border border-white"
                        />
                    </div>
                    <span className="text-sm font-black font-mono" style={{ color: phColor(livePH) }}>
                        {livePH.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* ── Current Step card ─────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStepId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className={`relative rounded-2xl p-4 border transition-all ${stepComplete
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-white/[0.03] border-white/10'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${stepComplete ? 'bg-emerald-500/30' : 'bg-cyan-500/20'
                            }`}>
                            {stepComplete
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                : <Target className="w-4 h-4 text-cyan-400" />
                            }
                        </div>
                        <div className="flex-1">
                            <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${stepComplete ? 'text-emerald-400' : 'text-cyan-400'
                                }`}>
                                {stepComplete ? '✓ Step Complete!' : 'Current Task'}
                            </div>
                            <div className="text-xs font-bold text-white leading-relaxed">
                                {currentStep?.task}
                            </div>

                            {/* Chemical target pill */}
                            {currentStep?.target?.chem && !stepComplete && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                    <div className="w-2.5 h-2.5 rounded-full border border-white/20"
                                        style={{ backgroundColor: CHEMISTRY_DATABASE[currentStep.target.chem]?.color || '#888' }} />
                                    <span className="text-[10px] text-white/50 font-mono">
                                        {CHEMISTRY_DATABASE[currentStep.target.chem]?.formula || currentStep.target.chem}
                                        {currentStep.target.vol ? ` · ${currentStep.target.vol} mL` : ''}
                                    </span>
                                </div>
                            )}

                            {/* pH range target pill */}
                            {currentStep?.target?.goal === 'ph_range' && !stepComplete && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                                    <Droplets className="w-3 h-3 text-cyan-400" />
                                    <span className="text-[10px] text-cyan-300 font-mono font-bold">
                                        Target pH: {currentStep.target.range[0]} – {currentStep.target.range[1]}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ── Hint System ───────────────────────────────────────────────── */}
            {currentStep?.hints && (
                <div>
                    <button
                        onClick={() => setHintVisible(v => !v)}
                        className="flex items-center gap-2 w-full py-2.5 px-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/15 transition-all"
                    >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest flex-1 text-left">
                            {hintVisible ? 'Hide Hint' : 'Show Hint'}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase ${{ basic: 'bg-emerald-500/20 text-emerald-300', intermediate: 'bg-blue-500/20 text-blue-300', expert: 'bg-purple-500/20 text-purple-300' }[level]
                            }`}>{level}</span>
                        <ChevronRight className={`w-3 h-3 transition-transform ${hintVisible ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {hintVisible && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                                    <p className="text-[11px] text-yellow-200/80 leading-relaxed">
                                        {currentStep.hints[level] || currentStep.hints.basic}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* ── Next / Finish CTA ─────────────────────────────────────────── */}
            <AnimatePresence>
                {stepComplete && (
                    <motion.button
                        initial={{ scale: 0.9, opacity: 0, y: 6 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 6 }}
                        onClick={handleNextStep}
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-black text-[10px] tracking-[0.3em] uppercase shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:opacity-90 active:scale-95 transition-all"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        {isLastStep ? 'FINISH & TAKE QUIZ' : 'NEXT STEP'}
                        <ChevronRight className="w-3.5 h-3.5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
