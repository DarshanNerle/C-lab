import React from 'react';
import Navbar from '../components/ui/Navbar';
import GlassCard from '../components/ui/GlassCard';
import { User, Award } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import LevelBadge from '../components/gamification/LevelBadge';

export default function Profile() {
    const store = useGameStore();

    return (
        <div className="w-full h-full flex flex-col">
            <Navbar />
            <div className="flex-1 p-8 overflow-y-auto w-full max-w-3xl mx-auto">
                <GlassCard className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-lab-dark border-4 border-neon-blue flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                        <User className="w-12 h-12 text-neon-blue" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold font-outfit mb-2">Guest Scientist</h1>
                        <p className="text-gray-400">Total XP: <span className="font-mono text-neon-green font-bold">{store.xp}</span></p>
                    </div>
                    <LevelBadge className="scale-125" />
                </GlassCard>

                <h2 className="text-xl font-bold font-outfit mb-4 flex items-center gap-2">
                    <Award className="text-yellow-500" /> Badges Unlocked
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {store.badges.length > 0 ? store.badges.map((b, i) => (
                        <GlassCard key={i} className="text-center p-4 border border-yellow-500/50">
                            <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/20 mb-2 flex items-center justify-center border border-yellow-500">
                                <Award className="text-yellow-400" />
                            </div>
                            <span className="text-xs font-bold text-gray-200">{b}</span>
                        </GlassCard>
                    )) : (
                        <p className="text-gray-500 text-sm col-span-4 italic">No badges earned yet. Head to the lab!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
