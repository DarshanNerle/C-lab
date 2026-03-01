import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, AlertCircle, CheckCircle2, ChevronRight, Lightbulb, FlaskConical } from 'lucide-react';

/**
 * PHCalculatorPanel
 * Shows live pH with a visual gauge, color zone indicator, and calculated H+/OH- concentrations.
 */
export default function PHCalculatorPanel({ ph = 7.0, isVisible }) {
    const clampedPh = Math.max(0, Math.min(14, ph));

    // Calculate H+ and OH- concentrations
    const hConc = Math.pow(10, -clampedPh);
    const ohConc = Math.pow(10, -(14 - clampedPh));

    const formatSci = (val) => {
        if (val === 0) return '0';
        const exp = Math.floor(Math.log10(Math.abs(val)));
        const coeff = (val / Math.pow(10, exp)).toFixed(2);
        return `${coeff} × 10^${exp}`;
    };

    const phInfo = useMemo(() => {
        if (clampedPh < 3) return { label: 'Strongly Acidic', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', emoji: '🔴' };
        if (clampedPh < 7) return { label: 'Acidic', color: '#f97316', bg: 'rgba(249,115,22,0.15)', emoji: '🟠' };
        if (clampedPh === 7) return { label: 'Neutral', color: '#22d3ee', bg: 'rgba(34,211,238,0.15)', emoji: '🔵' };
        if (clampedPh < 11) return { label: 'Basic', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', emoji: '🟣' };
        return { label: 'Strongly Basic', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', emoji: '💜' };
    }, [clampedPh]);

    // For the gradient needle position (0–100%)
    const needlePos = (clampedPh / 14) * 100;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 60, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 60, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className="flex flex-col gap-4"
                >
                    {/* pH Value Display */}
                    <div
                        className="relative rounded-2xl p-5 border overflow-hidden"
                        style={{ background: phInfo.bg, borderColor: phInfo.color + '55' }}
                    >
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl"
                            style={{ background: phInfo.color }} />
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Droplets className="w-4 h-4" style={{ color: phInfo.color }} />
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">pH Level</span>
                            </div>
                            <span
                                className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest"
                                style={{ color: phInfo.color, borderColor: phInfo.color + '55', background: phInfo.color + '22' }}
                            >
                                {phInfo.label}
                            </span>
                        </div>

                        <div className="text-5xl font-black font-mono tracking-tighter" style={{ color: phInfo.color }}>
                            {clampedPh.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-white/30 font-mono mt-0.5">-log₁₀[H⁺]</div>
                    </div>

                    {/* pH Spectrum Bar */}
                    <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/5">
                        <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">pH Spectrum (0 – 14)</div>
                        <div className="relative h-4 rounded-full overflow-visible"
                            style={{
                                background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #22d3ee, #a855f7, #3b82f6)'
                            }}
                        >
                            {/* Needle */}
                            <motion.div
                                animate={{ left: `${needlePos}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                                className="absolute -top-1 -translate-x-1/2 w-2.5 h-6 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] border-2 border-white z-10"
                            />
                        </div>
                        <div className="flex justify-between mt-1.5">
                            <span className="text-[8px] text-red-400 font-bold">0</span>
                            <span className="text-[8px] text-cyan-400 font-bold">7</span>
                            <span className="text-[8px] text-blue-400 font-bold">14</span>
                        </div>
                    </div>

                    {/* Concentration Table */}
                    <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/5 space-y-3">
                        <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Ion Concentrations</div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-orange-300">[H⁺]</span>
                            <span className="text-xs font-mono font-bold text-white/70">{formatSci(hConc)} M</span>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-purple-300">[OH⁻]</span>
                            <span className="text-xs font-mono font-bold text-white/70">{formatSci(ohConc)} M</span>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-cyan-300">Kw</span>
                            <span className="text-xs font-mono font-bold text-white/50">1.0 × 10⁻¹⁴</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
