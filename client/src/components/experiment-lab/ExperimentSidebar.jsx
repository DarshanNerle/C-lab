import React from 'react';
import { FlaskConical, Beaker, Timer, Star, CheckCircle2, Upload, Sparkles } from 'lucide-react';

const ExperimentSidebar = ({ selectedId, onSelect, experiments = [], onUploadClick, onAICreateClick }) => {
    return (
        <div className="w-72 h-full bg-slate-950/80 backdrop-blur-3xl border-r border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/5 bg-slate-900/40">
                <h2 className="text-xl font-black text-white tracking-widest uppercase">LAB CATALOG</h2>
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-cyan-400">{experiments.length}</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Modules</span>
                    </div>
                    <div className="w-px h-8 bg-white/5" />
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-emerald-400">{experiments.filter(e => e.completed).length}</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Done</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                {experiments.map((exp) => (
                    <button
                        key={exp.id}
                        onClick={() => onSelect(exp.id)}
                        className={`w-full group rounded-3xl p-4 transition-all duration-300 border text-left flex flex-col gap-3 relative overflow-hidden ${selectedId === exp.id
                            ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_8px_30px_rgba(6,182,212,0.1)]'
                            : 'bg-slate-900 border-white/5 hover:border-white/20 hover:bg-slate-800'
                            }`}
                    >
                        {/* Active Indicator */}
                        {selectedId === exp.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                        )}

                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-xl ${selectedId === exp.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                                {exp.graphType?.toLowerCase().includes('ph') || exp.graphType?.toLowerCase().includes('conduct') ? <Beaker className="w-4 h-4" /> : <FlaskConical className="w-4 h-4" />}
                            </div>
                            {exp.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>

                        <div className="space-y-1">
                            <h3 className={`text-sm font-bold tracking-tight transition-colors ${selectedId === exp.id ? 'text-white' : 'text-slate-300'}`}>
                                {exp.title}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{exp.sourceType || 'lab'} Chemistry</p>
                        </div>

                        <div className="flex items-center gap-4 mt-1 border-t border-white/5 pt-3">
                            <div className="flex items-center gap-1">
                                <Timer className="w-3 h-3 text-slate-600" />
                                <span className="text-[9px] text-slate-500 font-bold">{exp.estimatedTime || '30-45 min'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500/50" />
                                <span className="text-[9px] text-slate-500 font-bold">{exp.difficultyLevel || exp.difficulty || 'Intermediate'}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="p-6 border-t border-white/5">
                <div className="space-y-2">
                    <button
                        onClick={onUploadClick}
                        className="w-full px-4 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Experiment
                    </button>
                    <button
                        onClick={onAICreateClick}
                        className="w-full px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors"
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Experiment Creator
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExperimentSidebar;
