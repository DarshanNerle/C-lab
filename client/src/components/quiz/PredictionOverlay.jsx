import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, HelpCircle, CheckCircle, XCircle, Zap } from 'lucide-react';
import useGameStore from '../../store/useGameStore';

/**
 * PredictionOverlay
 * Gamified reaction prediction system.
 */
export default function PredictionOverlay({ reactants, onPredict, onCancel }) {
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const { addXP } = useGameStore();

    const options = [
        { id: 'neutralization', label: 'Neutralization', icon: '💧' },
        { id: 'precipitation', label: 'Precipitation', icon: '❄️' },
        { id: 'gas_evolution', label: 'Gas Evolution', icon: '💨' },
        { id: 'no_reaction', label: 'No Visible Reaction', icon: '✨' }
    ];

    const handleSubmit = () => {
        if (!selectedPrediction) return;
        // In a real scenario, we'd compare this with the engine's predicted outcome
        // For now, we award XP for participation and proceed.
        addXP(10);
        onPredict(selectedPrediction);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="w-full max-w-md bg-[#0f172a]/90 backdrop-blur-2xl border border-blue-500/30 rounded-[32px] p-8 shadow-2xl pointer-events-auto"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Hypothesis Phase</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Predict the interaction outcome</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-8">
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedPrediction(opt.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                    selectedPrediction === opt.id
                                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-xl">{opt.icon}</span>
                                    <span className="text-sm font-bold">{opt.label}</span>
                                </div>
                                {selectedPrediction === opt.id && <CheckCircle size={16} className="text-blue-400" />}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Skip
                        </button>
                        <button
                            disabled={!selectedPrediction}
                            onClick={handleSubmit}
                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                        >
                            <Zap size={14} /> Commit Hypothesis
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
