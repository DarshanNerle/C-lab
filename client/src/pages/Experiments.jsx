import React from 'react';
import Navbar from '../components/ui/Navbar';
import GlassCard from '../components/ui/GlassCard';
import { BookOpen } from 'lucide-react';

export default function Experiments() {
    return (
        <div className="w-full h-full flex flex-col">
            <Navbar />
            <div className="flex-1 p-8 overflow-y-auto w-full max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <BookOpen className="w-8 h-8 text-neon-blue" />
                    <h1 className="text-3xl font-bold font-outfit">Experiment Logs</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard>
                        <h3 className="text-xl font-bold text-neon-green mb-2">Neutralization Reaction</h3>
                        <p className="text-gray-300 text-sm mb-4">Reacted HCl with NaOH to form salt water.</p>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-lab-dark border border-gray-600 rounded text-xs font-mono">HCl</span>
                            <span className="text-gray-500">+</span>
                            <span className="px-3 py-1 bg-lab-dark border border-gray-600 rounded text-xs font-mono">NaOH</span>
                            <span className="text-gray-500">→</span>
                            <span className="px-3 py-1 bg-lab-dark border border-neon-green text-neon-green rounded text-xs font-mono drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">NaCl + H2O</span>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-xs">
                            <span className="text-gray-500">Completed 2 days ago</span>
                            <span className="font-bold text-orange-400">+100 XP</span>
                        </div>
                    </GlassCard>

                    <GlassCard className="opacity-50">
                        <div className="h-full flex items-center justify-center text-gray-500 font-bold tracking-widest uppercase">
                            Unknown Reaction
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
