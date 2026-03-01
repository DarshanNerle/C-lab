import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, X, Info, Zap } from 'lucide-react';

/**
 * SafetyWarningModal
 * Educational modal for hazardous chemical combinations.
 */
export default function SafetyWarningModal({ warning, onDismiss }) {
    if (!warning) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-red-950/40 backdrop-blur-xl"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0a0f18] border border-red-500/30 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden"
                >
                    {/* Header: Hazard Level Banner */}
                    <div className={`px-8 py-4 flex items-center gap-3 ${
                        warning.severity === 'critical' ? 'bg-red-600' : 'bg-orange-600'
                    }`}>
                        <ShieldAlert className="w-6 h-6 text-white" />
                        <span className="text-sm font-black text-white uppercase tracking-widest">
                            Safety Breach: {warning.severity === 'critical' ? 'Critical Hazard' : 'Severe Risk'}
                        </span>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Title & Message */}
                        <div>
                            <h2 className="text-2xl font-black text-white leading-tight">{warning.title}</h2>
                            <p className="text-red-400 text-sm font-bold mt-2">{warning.message}</p>
                        </div>

                        {/* Reason / Mechanism */}
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <h4 className="text-[10px] font-black text-red-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Info size={12} /> Chemical Reasoning
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {warning.reason}
                            </p>
                        </div>

                        {/* Educational Safety Note */}
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                            <h4 className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Zap size={12} /> Protocol Corrective Action
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {warning.safetyNote}
                            </p>
                        </div>

                        {/* Footer Action */}
                        <div className="pt-4 flex gap-4">
                            <button
                                onClick={onDismiss}
                                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Acknowledge Danger
                            </button>
                            <button
                                onClick={onDismiss}
                                className="px-6 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/20"
                            >
                                Terminate
                            </button>
                        </div>
                    </div>

                    {/* Background Graphic */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none rounded-full" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
