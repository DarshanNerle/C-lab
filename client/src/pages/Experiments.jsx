import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import { BookOpen } from 'lucide-react';

export default function Experiments() {
    return (
        <div className="w-full max-w-6xl space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                <div className="flex items-center gap-3">
                    <BookOpen className="h-7 w-7 text-neon-blue" />
                    <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Experiment Logs</h1>
                </div>
                <p className="mt-2 text-sm text-slate-400">Track completed reactions and review previous simulations.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <GlassCard className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-neon-green mb-3">Neutralization Reaction</h3>
                    <p className="mb-5 text-sm text-gray-300">Reacted HCl with NaOH to form salt water.</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-gray-600 bg-lab-dark px-3 py-1 text-xs font-mono">HCl</span>
                        <span className="text-gray-500">+</span>
                        <span className="rounded-md border border-gray-600 bg-lab-dark px-3 py-1 text-xs font-mono">NaOH</span>
                        <span className="text-gray-500">→</span>
                        <span className="rounded-md border border-neon-green bg-lab-dark px-3 py-1 text-xs font-mono text-neon-green drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">NaCl + H2O</span>
                    </div>
                    <div className="mt-5 flex items-center justify-between text-xs">
                        <span className="text-gray-500">Completed 2 days ago</span>
                        <span className="font-bold text-orange-400">+100 XP</span>
                    </div>
                </GlassCard>

                <GlassCard className="rounded-3xl border border-dashed border-white/20 bg-slate-900/40 p-6 opacity-80">
                    <div className="flex h-full min-h-48 items-center justify-center text-sm font-bold uppercase tracking-widest text-gray-500">
                        Unknown Reaction
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
