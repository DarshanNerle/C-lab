import React from 'react';
import GlassCard from '../ui/GlassCard';
import NeonButton from '../ui/NeonButton';
import { Flame } from 'lucide-react';

export default function DailyChallenge({ title, goal, xpReward, isCompleted }) {
    return (
        <GlassCard className="relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-red-500/10 group-hover:text-red-500/20 transition-colors">
                <Flame className="w-32 h-32" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest">Daily Challenge</h3>
                    <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold border border-orange-500/50">+{xpReward} XP</span>
                </div>

                <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
                <p className="text-gray-400 text-sm mb-6">{goal}</p>

                {isCompleted ? (
                    <div className="w-full py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-center font-bold text-sm">
                        Challenge Completed
                    </div>
                ) : (
                    <NeonButton color="red" className="w-full text-sm py-2">
                        Start Challenge
                    </NeonButton>
                )}
            </div>
        </GlassCard>
    );
}
