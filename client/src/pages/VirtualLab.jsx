import React, { Suspense, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, Layers, Shield, FlaskConical, Zap, Box, Book } from 'lucide-react'
import useNotebookStore from '../store/useNotebookStore'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import useLabStore from '../store/useLabStore'
import useQuizStore from '../store/useQuizStore'
import LabScene from '../components/lab3D/LabScene'
import GuidedExperimentHUD from '../components/teaching/GuidedExperimentHUD'
import SafetyWarningModal from '../components/ui/SafetyWarningModal'
import PredictionOverlay from '../components/quiz/PredictionOverlay'
import { CHEMISTRY_DATABASE } from '../constants/chemistryData'

export default function VirtualLab() {
    const { level, rank, xp, addXP, discoverReaction } = useGameStore()
    const { profile } = useAuthStore()
    const { containers, activeReaction, safetyWarning, clearSafetyWarning, addChemical, resetLab, currentLesson } = useLabStore()
    
    const [pendingChem, setPendingChem] = useState(null);

    // We target beaker1 for the 3D chamber visualization
    const chamber = containers.beaker1;
    const availableChemicals = Object.values(CHEMISTRY_DATABASE);

    const handleAddChemical = (chem) => {
        if (chamber.volume >= 500) {
            alert('Beaker full!')
            return
        }

        // Trigger Prediction Mode if adding a second chemical
        if (chamber.components.length > 0 && !pendingChem) {
            setPendingChem(chem);
            return;
        }

        addChemical('beaker1', chem.id, 20);
    }

    const confirmPrediction = (prediction) => {
        if (pendingChem) {
            addChemical('beaker1', pendingChem.id, 20);
            setPendingChem(null);
        }
    };

    useEffect(() => {
        if (activeReaction && activeReaction.xp) {
            addXP(activeReaction.xp);
            if (activeReaction.id) discoverReaction(activeReaction.id);
        }
    }, [activeReaction, addXP, discoverReaction]);

    return (
        <div className="w-full h-screen flex flex-col bg-lab-dark overflow-hidden">
            {/* Guided HUD Overlay */}
            <div className="absolute top-24 left-6 z-40 w-80 pointer-events-auto">
                <GuidedExperimentHUD />
            </div>

            {/* Safety Warning Modal */}
            <SafetyWarningModal 
                warning={safetyWarning} 
                onDismiss={clearSafetyWarning} 
            />

            {/* Prediction Interface */}
            {pendingChem && (
                <PredictionOverlay 
                    reactants={[...chamber.components, pendingChem]} 
                    onPredict={confirmPrediction}
                    onCancel={() => { addChemical('beaker1', pendingChem.id, 20); setPendingChem(null); }}
                />
            )}

            {/* Header UI */}
            <header className="absolute top-0 left-0 w-full p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center z-50 pointer-events-none gap-4">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <Link to="/dashboard" className="advanced-glass p-3 rounded-2xl text-gray-400 hover:text-neon-cyan transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>

                    <div className="advanced-glass px-4 py-2 rounded-xl border border-white/5 hidden sm:flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-black uppercase">Scientist</span>
                            <span className="text-sm font-bold text-white">{profile?.name || 'Guest'}</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-neon-purple font-black">LVL {level}</span>
                            <div className="w-20 h-1 bg-white/10 rounded-full mt-1">
                                <div className="h-full bg-neon-purple rounded-full" style={{ width: `${(xp % 1000) / 10}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 pointer-events-auto">
                    <div className="flex gap-2">
                        <Link to="/lab2d" className="px-4 py-2 advanced-glass rounded-xl text-[10px] font-black text-white hover:text-neon-cyan transition-all flex items-center gap-2">
                            <Box className="w-4 h-4" /> SWITCH TO 2D
                        </Link>
                        <button onClick={resetLab} className="p-2 advanced-glass rounded-xl text-red-500 hover:bg-red-500/10 transition-all">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* 3D Main View */}
            <main className="flex-1 w-full relative">
                <Suspense fallback={<div className="flex items-center justify-center h-full"><Zap className="animate-spin text-neon-cyan" /></div>}>
                    <LabScene />
                </Suspense>

                {/* Floating Status HUD */}
                <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-4 pointer-events-none">
                    <div className="advanced-glass p-6 rounded-[30px] border-neon-cyan/20 min-w-[240px] pointer-events-auto">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Vessel</span>
                            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                        </div>
                        <div className="text-2xl font-black text-white mb-1 uppercase italic tracking-tighter">Reactor A-1</div>
                        <div className="flex justify-between items-end">
                            <div className="text-4xl font-mono font-black text-white">{chamber.volume.toFixed(0)}<span className="text-sm text-neon-cyan">mL</span></div>
                            <div className="text-[10px] text-gray-500 font-bold mb-1">CAP: 500</div>
                        </div>
                        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-neon-cyan shadow-[0_0_10px_#00ffff]" style={{ width: `${(chamber.volume / 500) * 100}%` }} />
                        </div>
                    </div>

                    {activeReaction && (
                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="advanced-glass p-6 rounded-[30px] border-neon-green/30 bg-neon-green/5 pointer-events-auto">
                            <div className="text-[8px] font-black text-neon-green uppercase tracking-[0.3em] mb-2 font-mono">Synthesis Recognized</div>
                            <div className="text-xl font-black text-white uppercase italic leading-tight mb-2">{activeReaction.name}</div>
                            <div className="text-neon-green text-[10px] font-mono font-bold py-1 px-2 bg-neon-green/10 rounded">{activeReaction.equation}</div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Bottom Chemical Rack - Responsive Grid */}
            <footer className="h-auto md:h-44 w-full bg-black/40 backdrop-blur-2xl border-t border-white/10 z-50 p-6 flex flex-col md:flex-row items-center gap-6 shrink-0">
                <div className="flex flex-col md:flex-row items-center gap-6 w-full max-w-7xl mx-auto overflow-hidden">
                    <div className="flex items-center gap-4 shrink-0 border-r border-white/5 pr-6 hidden md:flex">
                        <div className="p-3 bg-neon-cyan/10 rounded-2xl">
                            <FlaskConical className="w-6 h-6 text-neon-cyan" />
                        </div>
                        <div>
                            <div className="text-xs font-black text-white uppercase italic">Lab Inventory</div>
                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Quantum Reagents</div>
                        </div>
                    </div>

                    <div className="flex-1 flex gap-4 overflow-x-auto pb-2 scrollbar-hide w-full">
                        {availableChemicals.map((chem) => (
                            <button
                                key={chem.id}
                                onClick={() => handleAddChemical(chem)}
                                className="advanced-glass min-w-[120px] md:min-w-[150px] p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-white/20 hover:-translate-y-2 transition-all group shrink-0"
                            >
                                <div className="w-8 h-8 rounded-full border-2 border-white/10" style={{ backgroundColor: chem.color }} />
                                <div className="text-center">
                                    <div className="text-[10px] font-bold text-white uppercase">{chem.formula}</div>
                                    <div className="text-[8px] text-gray-500 font-black uppercase tracking-tighter truncate w-24">{chem.name}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}
