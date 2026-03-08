import { ChevronLeft, ChevronRight, BookOpen, FlaskConical, Beaker, FileText, ListOrdered, ShieldAlert, Cpu, Maximize2, Minimize2, Minus, X } from 'lucide-react';

const TheoryPanel = ({ isOpen, toggle, experiment, isMaximized, onMaximize, className = '', width = 320, onResizeStart }) => {
    if (!experiment) return null;

    const apparatus = Array.isArray(experiment.apparatus) ? experiment.apparatus : [];
    const chemicals = Array.isArray(experiment.chemicals) ? experiment.chemicals : [];
    const procedure = Array.isArray(experiment.procedure) ? experiment.procedure : [];
    const safety = Array.isArray(experiment.safety) ? experiment.safety : ['Wear gloves and goggles.', 'Handle acids and bases carefully.'];

    return (
        <div
            className={`h-full bg-slate-900/40 backdrop-blur-xl border-r border-white/5 transition-all duration-500 ease-in-out flex flex-col overflow-hidden relative ${isMaximized ? 'w-full flex-1' : isOpen ? '' : 'w-10'} ${className}`}
            style={!isMaximized && isOpen ? { width: `${width}px` } : undefined}
        >
            <div className="p-4 border-b border-white/5 flex items-center justify-between min-h-[64px] bg-slate-900/20">
                {isOpen ? (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-cyan-500 tracking-widest">Documentation</span>
                            <span className="font-bold truncate text-slate-100 text-xs">GUIDE & THEORY</span>
                        </div>
                    </div>
                ) : (
                    <button onClick={toggle} className="w-full h-full flex items-center justify-center hover:bg-white/5 transition-colors" title="Expand Details">
                        <ChevronRight className="w-4 h-4 text-cyan-400" />
                    </button>
                )}

                {isOpen && (
                    <div className="flex items-center gap-1">
                        <button onClick={onMaximize} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-all">{isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}</button>
                        <button onClick={toggle} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-all"><X className="w-3.5 h-3.5" /></button>
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                             <div className="w-1 h-4 bg-cyan-500 rounded-full shadow-[0_0_10px_2px_rgba(6,182,212,0.4)]" />
                             <h3 className="font-black uppercase text-[10px] text-slate-500 tracking-[0.2em] mb-1">Experiment Overview</h3>
                        </div>
                        <h2 className="text-xl font-bold text-white leading-tight">{experiment.title}</h2>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm leading-relaxed text-slate-300 italic">
                            "{experiment.aim}"
                        </div>
                    </section>

                    <section className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                            <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-2">Apparatus</h4>
                            <div className="flex flex-col gap-1.5">
                                {apparatus.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="text-[11px] text-slate-400 flex items-center gap-2">
                                        <div className="w-1 h-1 bg-cyan-500/50 rounded-full" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                            <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">Chemicals</h4>
                            <div className="flex flex-col gap-1.5">
                                {chemicals.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="text-[11px] text-slate-400 flex items-center gap-2">
                                        <div className="w-1 h-1 bg-amber-500/50 rounded-full" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <ListOrdered className="w-4 h-4 text-emerald-400" />
                            </div>
                            <h3 className="font-black uppercase text-[10px] text-emerald-500 tracking-widest">Protocol Steps</h3>
                        </div>
                        <div className="space-y-4">
                            {procedure.map((step, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] font-black text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
                                        {idx + 1}
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">{step}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="p-5 rounded-3xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/10">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldAlert className="w-4 h-4 text-red-400" />
                            <h3 className="font-black uppercase text-[10px] text-red-500 tracking-widest">Safety Module</h3>
                        </div>
                        <ul className="space-y-2">
                            {safety.map((item, idx) => (
                                <li key={idx} className="text-xs text-slate-400 flex gap-2"><span className="mt-1.5 w-1 h-1 bg-red-500 rounded-full shrink-0" />{item}</li>
                            ))}
                        </ul>
                    </section>
                </div>
            )}

            {isOpen && typeof onResizeStart === 'function' && !isMaximized && (
                <button
                    onMouseDown={(event) => onResizeStart(event, 'theory')}
                    className="absolute top-0 right-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-cyan-500/30 transition-colors"
                />
            )}
        </div>
    );
};

export default TheoryPanel;
