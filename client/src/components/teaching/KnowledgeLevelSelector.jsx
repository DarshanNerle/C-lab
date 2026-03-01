import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FlaskConical, Atom } from 'lucide-react';
import useLabStore from '../../store/useLabStore';

const LEVELS = [
    {
        id: 'basic',
        label: 'Basic',
        icon: BookOpen,
        color: 'from-emerald-500 to-teal-600',
        border: 'border-emerald-500/40',
        glow: 'rgba(16,185,129,0.3)',
        desc: 'Simple step-by-step guidance with friendly tips. Perfect for learners.',
        skills: ['Simple explanations', 'Full step hints', 'No advanced math'],
    },
    {
        id: 'intermediate',
        label: 'Intermediate',
        icon: FlaskConical,
        color: 'from-blue-500 to-indigo-600',
        border: 'border-blue-500/40',
        glow: 'rgba(59,130,246,0.3)',
        desc: 'Balanced detail with scientific reasoning and formula references.',
        skills: ['Chemical formulas', 'Reaction mechanisms', 'Guided stoichiometry'],
    },
    {
        id: 'expert',
        label: 'Expert',
        icon: Atom,
        color: 'from-purple-500 to-fuchsia-600',
        border: 'border-purple-500/40',
        glow: 'rgba(168,85,247,0.3)',
        desc: 'Full scientific detail. Quantitative analysis, limiting reagents, and thermodynamics.',
        skills: ['Quantitative analysis', 'Limiting reagent calc', 'ΔH & Ksp values'],
    },
];

export default function KnowledgeLevelSelector({ onClose, onConfirm }) {
    const { setKnowledgeLevel, knowledgeLevel } = useLabStore();

    const handleSelect = (levelId) => {
        setKnowledgeLevel(levelId);
    };

    const handleConfirm = () => {
        onConfirm(knowledgeLevel || 'basic');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-2xl"
            >
                <div className="relative bg-gradient-to-br from-slate-950 to-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
                    {/* Ambient glow */}
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-64 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className="relative p-8 pb-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-purple-300 uppercase tracking-[0.3em] mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            Knowledge Calibration
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                            Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Level</span>
                        </h2>
                        <p className="text-sm text-gray-400 max-w-md mx-auto">
                            Your chosen level tailors the hints, explanations, and quiz difficulty for maximum learning impact.
                        </p>
                    </div>

                    {/* Level Cards */}
                    <div className="relative p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {LEVELS.map((level) => {
                            const Icon = level.icon;
                            const selected = (knowledgeLevel || 'basic') === level.id;
                            return (
                                <motion.button
                                    key={level.id}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelect(level.id)}
                                    style={selected ? { boxShadow: `0 0 30px ${level.glow}` } : {}}
                                    className={`relative flex flex-col items-start gap-3 p-5 rounded-2xl border transition-all text-left
                                        ${selected
                                            ? `${level.border} bg-white/10`
                                            : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                                        }`}
                                >
                                    {selected && (
                                        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br ${level.color} shadow-lg`} />
                                    )}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${level.color} shadow-lg`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white">{level.label}</div>
                                        <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{level.desc}</div>
                                    </div>
                                    <ul className="flex flex-col gap-1 mt-1">
                                        {level.skills.map(s => (
                                            <li key={s} className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                                <span className={`w-1 h-1 rounded-full bg-gradient-to-br ${level.color}`} />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-2 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[11px] tracking-widest uppercase hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleConfirm}
                            className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black text-[11px] tracking-widest uppercase hover:opacity-90 transition-all shadow-[0_10px_30px_rgba(168,85,247,0.4)]"
                        >
                            Begin Experiment →
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
