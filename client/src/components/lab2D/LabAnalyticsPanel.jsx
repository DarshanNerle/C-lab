import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, FlaskConical, Timer, Download,
    Star, BarChart2, ChevronDown, ChevronUp, Beaker, X
} from 'lucide-react';
import useLabStore from '../../store/useLabStore';
import { CHEMISTRY_DATABASE } from '../../constants/chemistryData';
import { safeLocalStorage } from '../../utils/safeStorage';

/**
 * LabAnalyticsPanel - Advanced Lab Observation, Scoring & Report Generation
 * Features:
 * - Live experiment timer
 * - Observation log (auto + manual)
 * - Conclusion panel (user editable)
 * - Lab scoring system
 * - One-click PDF lab report download
 * - Experiment history
 */
export default function LabAnalyticsPanel({ activeTab, titrationSession }) {
    const { containers, activeReaction } = useLabStore();

    // Timer
    const [timerRunning, setTimerRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef(null);

    // Panels
    const [observations, setObservations] = useState([]);
    const [manualObs, setManualObs] = useState('');
    const [conclusion, setConclusion] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    // Scoring
    const [score, setScore] = useState(0);
    const [scoreBreakdown, setScoreBreakdown] = useState([]);

    // History
    const [history, setHistory] = useState(() => {
        try { return JSON.parse(safeLocalStorage.getItem('clab-exp-history') || '[]'); } catch { return []; }
    });

    // ── Timer Logic ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (timerRunning) {
            timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [timerRunning]);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    // ── Auto-Observation on Reaction ─────────────────────────────────────────
    useEffect(() => {
        if (activeReaction) {
            const obs = {
                time: formatTime(elapsed),
                text: `⚗️ ${activeReaction.name || 'Reaction'} observed in ${activeReaction.id || 'vessel'}. ${activeReaction.equation ? `Eq: ${activeReaction.equation}` : ''}`,
                type: 'reaction',
                timestamp: Date.now()
            };
            setObservations(prev => [...prev.slice(-19), obs]);
            setScore(prev => Math.min(100, prev + 15));
            setScoreBreakdown(prev => [...prev, { label: 'Reaction Observed', pts: 15 }]);
        }
    }, [activeReaction?.id]);

    // Auto-observe titration endpoint
    useEffect(() => {
        if (titrationSession?.isCompleted && activeTab === 'titration') {
            const obs = {
                time: formatTime(elapsed),
                text: `🔬 Titration endpoint detected. ΔV = ${titrationSession.titrantUsed?.toFixed(2)} mL. Permanent color change in indicator.`,
                type: 'titration',
                timestamp: Date.now()
            };
            setObservations(prev => [...prev.slice(-19), obs]);
            setScore(prev => Math.min(100, prev + 25));
            setScoreBreakdown(prev => [...prev, { label: 'Titration Complete', pts: 25 }]);
        }
    }, [titrationSession?.isCompleted]);

    // ── Lab Report Download ──────────────────────────────────────────────────
    const downloadReport = useCallback(() => {
        const now = new Date().toLocaleString();
        
        // Safety check for containers
        const containerSummary = (containers ? Object.values(containers) : []).map(c => {
            const main = c.components[0];
            return `• ${c.id.toUpperCase()} (${c.type}): ${main ? `${CHEMISTRY_DATABASE[main.id]?.name || main.id} — ${c.volume.toFixed(1)} mL, pH ${c.ph?.toFixed(2) || 'N/A'}, Temp ${c.temp?.toFixed(1) || 25}°C` : 'Empty'}`;
        }).join('\n');

        const obsText = observations.map(o => `[${o.time}] ${o.text}`).join('\n') || 'No observations recorded';

        const report = `
╔══════════════════════════════════════════════════════╗
║            C-LAB OFFICIAL LAB REPORT                ║
╚══════════════════════════════════════════════════════╝

Date & Time    : ${now}
Experiment Mode: ${activeTab === 'titration' ? 'Acid-Base Titration' : 'Chemical Reaction Lab'}
Duration       : ${formatTime(elapsed)}
Lab Score      : ${score}/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. VESSEL STATUS
${containerSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. OBSERVATIONS
${obsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. CONCLUSION
${conclusion || '[No conclusion entered. Use the Conclusion panel to write your interpretation.]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${activeTab === 'titration' && titrationSession?.isCompleted ? `4. TITRATION DATA
   Initial burette reading : ${titrationSession.initialVol?.toFixed(2)} mL
   Final burette reading   : ${titrationSession.finalVol?.toFixed(2)} mL
   Titrant consumed (ΔV)   : ${titrationSession.titrantUsed?.toFixed(2)} mL
   
   Note: Use n₁V₁ = n₂V₂ to calculate unknown concentration.` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. SCORING BREAKDOWN
${scoreBreakdown.map(s => `   • ${s.label}: +${s.pts} pts`).join('\n') || '   No scored actions recorded.'}
   TOTAL: ${score}/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by C-Lab 5.0 | Advanced Chemistry Simulation Platform
        `.trim();

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CLabReport_${now.replace(/[/:, ]/g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        // Save to history
        const entry = {
            date: now,
            mode: activeTab,
            score,
            obsCount: observations.length,
            conclusion: conclusion.slice(0, 120)
        };
        const updated = [entry, ...history.slice(0, 9)];
        setHistory(updated);
        try { safeLocalStorage.setItem('clab-exp-history', JSON.stringify(updated)); } catch { }

        setScore(prev => Math.min(100, prev + 10));
        setScoreBreakdown(prev => [...prev, { label: 'Report Generated', pts: 10 }]);
    }, [containers, observations, conclusion, score, scoreBreakdown, elapsed, activeTab, titrationSession, history]);

    const addManualObservation = () => {
        if (!manualObs.trim()) return;
        const obs = {
            time: formatTime(elapsed),
            text: `📝 ${manualObs}`,
            type: 'manual',
            timestamp: Date.now()
        };
        setObservations(prev => [...prev.slice(-19), obs]);
        setManualObs('');
        setScore(prev => Math.min(100, prev + 5));
        setScoreBreakdown(prev => [...prev, { label: 'Observation Logged', pts: 5 }]);
    };

    return (
        <div className="advanced-glass rounded-3xl border border-white/5 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(e => !e)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <BarChart2 className="w-4 h-4 text-neon-cyan" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Lab Analytics</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${score >= 80 ? 'bg-green-500/20 text-green-400' : score >= 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {score}/100
                    </span>
                </div>
                {isExpanded ? <ChevronUp className="w-3 h-3 text-white/40" /> : <ChevronDown className="w-3 h-3 text-white/40" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4">
                            {/* Timer */}
                            <div className="flex items-center justify-between bg-white/5 rounded-2xl p-3">
                                <div className="flex items-center gap-2">
                                    <Timer className="w-3.5 h-3.5 text-neon-cyan" />
                                    <span className="font-mono text-xl font-black text-white">{formatTime(elapsed)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTimerRunning(r => !r)}
                                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${timerRunning ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20'}`}
                                    >
                                        {timerRunning ? '⏸ Pause' : '▶ Start'}
                                    </button>
                                    <button
                                        onClick={() => { setTimerRunning(false); setElapsed(0); }}
                                        className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/5 text-white/40 border border-white/10 hover:text-white transition-all"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Score Bar */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Lab Score</span>
                                    <span className="text-[8px] font-mono text-neon-cyan font-black">{score} / 100</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: score >= 80 ? '#22d3ee' : score >= 40 ? '#f59e0b' : '#6b7280' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${score}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Observations */}
                            <div>
                                <div className="text-[8px] text-white/40 uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
                                    <ClipboardList className="w-3 h-3" /> Observations ({observations.length})
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto custom-scroll">
                                    {observations.length === 0 ? (
                                        <div className="text-[9px] text-white/20 italic text-center py-2">No observations yet. Reactions will be auto-logged.</div>
                                    ) : (
                                        [...observations].reverse().map((o, i) => (
                                            <div key={i} className={`text-[8px] p-2 rounded-xl leading-relaxed ${o.type === 'reaction' ? 'bg-neon-cyan/5 border border-neon-cyan/10 text-neon-cyan/80' : o.type === 'titration' ? 'bg-neon-purple/5 border border-neon-purple/10 text-neon-purple/80' : 'bg-white/5 border border-white/10 text-white/60'}`}>
                                                <span className="font-mono text-[7px] mr-1">[{o.time}]</span>{o.text}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        value={manualObs}
                                        onChange={e => setManualObs(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addManualObservation()}
                                        placeholder="Add manual observation..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[9px] text-white placeholder-white/20 focus:outline-none focus:border-neon-cyan/40"
                                    />
                                    <button onClick={addManualObservation} className="px-3 py-1.5 bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan rounded-xl text-[9px] font-black hover:bg-neon-cyan/20 transition-all">
                                        + Log
                                    </button>
                                </div>
                            </div>

                            {/* Conclusion */}
                            <div>
                                <div className="text-[8px] text-white/40 uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
                                    <FlaskConical className="w-3 h-3" /> Conclusion
                                </div>
                                <textarea
                                    value={conclusion}
                                    onChange={e => setConclusion(e.target.value)}
                                    placeholder="Write your scientific conclusion here. E.g., 'The experiment confirmed that HCl and NaOH react in a 1:1 molar ratio...'"
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white placeholder-white/20 focus:outline-none focus:border-neon-purple/40 resize-none leading-relaxed"
                                />
                            </div>

                            {/* Download Report */}
                            <button
                                onClick={downloadReport}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 text-white font-black text-[9px] tracking-widest uppercase hover:from-neon-cyan/30 hover:to-neon-purple/30 transition-all"
                            >
                                <Download className="w-3 h-3" />
                                Download Lab Report (.txt)
                            </button>

                            {/* Experiment History */}
                            {history.length > 0 && (
                                <div>
                                    <div className="text-[8px] text-white/30 uppercase tracking-widest font-bold mb-2">Previous Sessions</div>
                                    <div className="space-y-1 max-h-24 overflow-y-auto custom-scroll">
                                        {history.map((h, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white/5 rounded-xl px-3 py-1.5 text-[8px] text-white/40">
                                                <span className="font-mono truncate max-w-[90px]">{h.date}</span>
                                                <span className={`font-black ${h.score >= 80 ? 'text-green-400' : h.score >= 40 ? 'text-yellow-400' : 'text-slate-400'}`}>{h.score}/100</span>
                                                <span className="text-white/30">{h.mode}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
