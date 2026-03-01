import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, Unlock, Zap, Target, Thermometer, FlaskConical, ChevronRight } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import useSkillStore from '../store/useSkillStore';

/**
 * C-Lab 5.0 Futuristic Skill Tree
 * A premium interface for character progression.
 */
export default function SkillTree() {
    const { skillPoints } = useGameStore();
    const { skills, unlockSkill } = useSkillStore();
    const [selectedSkill, setSelectedSkill] = useState(null);

    const skillNodes = skills ? Object.values(skills) : [];

    const renderConnector = (fromId, toId) => {
        // Simple visual connector logic (SVG)
        // In a real production app we'd calculate coordinates based on DOM refs
        return null;
    };

    return (
        <div className="w-full min-h-screen bg-slate-950 text-white p-8 font-sans overflow-hidden relative">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-slate-950 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start mb-16">
                <div className="flex items-center gap-6">
                    <Link to="/dashboard" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                        <ArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Knowledge Matrix
                        </h1>
                        <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em]">Neural Skill Adaptation System</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl flex items-center gap-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Available Points</span>
                        <span className="text-3xl font-black font-mono text-white">{skillPoints} <span className="text-sm text-blue-500">SP</span></span>
                    </div>
                    <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-500/30">
                        <Star className="text-blue-400 fill-blue-400 w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Main Tree Layout */}
            <div className="relative z-10 max-w-6xl mx-auto flex gap-12">
                {/* The Grid of Skills */}
                <div className="flex-1 grid grid-cols-3 gap-8 p-8 bg-white/5 border border-white/5 rounded-[40px] backdrop-blur-sm min-h-[500px]">
                    {skillNodes.map((skill) => {
                        const isUnlocked = skill.unlocked;
                        const canUnlock = skillPoints >= skill.cost && skill.dependencies.every(d => skills[d].unlocked);

                        return (
                            <motion.button
                                key={skill.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedSkill(skill)}
                                className={`relative p-8 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-4 group ${isUnlocked
                                    ? 'bg-blue-600/20 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                                    : canUnlock
                                        ? 'bg-white/5 border-white/20 hover:border-blue-400/50'
                                        : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className={`p-4 rounded-2xl ${isUnlocked ? 'bg-blue-400 text-slate-900' : 'bg-white/10 text-gray-500'}`}>
                                    {skill.id.includes('precision') && <Target size={28} />}
                                    {skill.id.includes('thermo') && <Thermometer size={28} />}
                                    {skill.id.includes('speed') && <Zap size={28} />}
                                    {skill.id.includes('advanced') && <FlaskConical size={28} />}
                                </div>
                                <div className="text-center font-bold text-sm uppercase tracking-wider">{skill.name}</div>
                                {isUnlocked ? (
                                    <div className="absolute top-4 right-4 text-blue-400"><Unlock size={14} /></div>
                                ) : (
                                    <div className="absolute top-4 right-4 text-gray-600"><Lock size={14} /></div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Right Panel: Detail View */}
                <div className="w-96 flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                        {selectedSkill ? (
                            <motion.div
                                key={selectedSkill.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-slate-900 border border-white/10 p-8 rounded-[40px] flex flex-col gap-6 shadow-2xl h-full"
                            >
                                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center">
                                    <div className="scale-150 text-blue-400">
                                        {selectedSkill.id.includes('precision') && <Target size={32} />}
                                        {selectedSkill.id.includes('thermo') && <Thermometer size={32} />}
                                        {selectedSkill.id.includes('speed') && <Zap size={32} />}
                                        {selectedSkill.id.includes('advanced') && <FlaskConical size={32} />}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-black uppercase text-white mb-2">{selectedSkill.name}</h2>
                                    <p className="text-gray-400 text-sm leading-relaxed">{selectedSkill.description}</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Adaptation Cost</span>
                                        <span className="text-xl font-black font-mono text-blue-400">{selectedSkill.cost} SP</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Dependencies</span>
                                        <span className="text-xs font-mono text-gray-300">
                                            {selectedSkill.dependencies.length > 0 ? selectedSkill.dependencies.join(', ') : 'None'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    {selectedSkill.unlocked ? (
                                        <div className="w-full py-5 bg-green-500/20 border border-green-500/50 text-green-400 rounded-2xl font-black uppercase tracking-widest text-center">
                                            Adaptation Complete
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => unlockSkill(selectedSkill.id)}
                                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-3"
                                        >
                                            Initiate Unlock <ArrowRight size={20} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-slate-900 border border-white/10 p-12 rounded-[40px] flex flex-col items-center justify-center text-center h-full opacity-50 grayscale transition-all">
                                <Star className="w-16 h-16 text-blue-500 mb-6 animate-pulse" />
                                <h3 className="text-xl font-bold text-white mb-2 uppercase">Neural Link Idle</h3>
                                <p className="text-gray-500 text-sm italic">Select a knowledge node to initiate neural adaptation.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Floaties */}
            <div className="absolute top-1/4 -left-12 w-64 h-64 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-12 w-96 h-96 bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
        </div>
    );
}

function Star({ className, size = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}
