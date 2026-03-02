import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import { Trophy } from 'lucide-react';
import useGameStore from '../store/useGameStore';

export default function LeaderboardPage() {
    const myXP = useGameStore((state) => state.xp);

    const mockLeaderboard = [
        { rank: 1, name: 'Dr. Marie Curie', xp: 45000, isCurrentUser: false },
        { rank: 2, name: 'Albert.E', xp: 42300, isCurrentUser: false },
        { rank: 3, name: 'Walter White', xp: 39100, isCurrentUser: false },
        { rank: 4, name: 'Rosalind Franklin', xp: 32000, isCurrentUser: false },
        { rank: 5, name: 'Guest Player', xp: myXP, isCurrentUser: true }
    ].sort((a, b) => b.xp - a.xp).map((user, index) => ({ ...user, rank: index + 1 }));

    return (
        <div className="w-full max-w-5xl space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
                <div className="flex items-center gap-3">
                    <Trophy className="h-7 w-7 text-yellow-500" />
                    <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Global Rankings</h1>
                </div>
                <p className="mt-2 text-sm text-slate-400">Compare your progress against top scientists.</p>
            </div>

            <GlassCard className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-0">
                <div className="grid grid-cols-[64px_1fr_120px] gap-2 border-b border-white/10 bg-black/30 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 sm:px-6">
                    <div>Rank</div>
                    <div>Scientist</div>
                    <div className="text-right">Total XP</div>
                </div>

                {mockLeaderboard.map((user) => (
                    <div
                        key={`${user.name}-${user.rank}`}
                        className={`grid grid-cols-[64px_1fr_120px] items-center gap-2 border-b border-white/10 px-4 py-4 transition-colors last:border-b-0 sm:px-6 ${user.isCurrentUser ? 'bg-neon-blue/10' : 'hover:bg-white/[0.03]'
                            }`}
                    >
                        <div className={`text-base font-bold font-mono ${user.rank <= 3 ? 'text-yellow-500' : 'text-gray-500'}`}>
                            #{user.rank}
                        </div>
                        <div className={`truncate text-sm font-semibold sm:text-base ${user.isCurrentUser ? 'text-neon-blue' : 'text-gray-200'}`}>
                            {user.name} {user.isCurrentUser && '(You)'}
                        </div>
                        <div className="text-right font-mono text-sm font-bold text-neon-green drop-shadow-[0_0_5px_rgba(57,255,20,0.5)] sm:text-base">
                            {user.xp}
                        </div>
                    </div>
                ))}
            </GlassCard>
        </div>
    );
}
