import React from 'react';
import Navbar from '../components/ui/Navbar';
import GlassCard from '../components/ui/GlassCard';
import { Trophy } from 'lucide-react';
import useGameStore from '../store/useGameStore';

export default function LeaderboardPage() {
    const myXP = useGameStore(state => state.xp);

    const mockLeaderboard = [
        { rank: 1, name: "Dr. Marie Curie", xp: 45000, isCurrentUser: false },
        { rank: 2, name: "Albert.E", xp: 42300, isCurrentUser: false },
        { rank: 3, name: "Walter White", xp: 39100, isCurrentUser: false },
        { rank: 4, name: "Rosalind Franklin", xp: 32000, isCurrentUser: false },
        { rank: 5, name: "Guest Player", xp: myXP, isCurrentUser: true },
    ].sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, rank: i + 1 }));

    return (
        <div className="w-full h-full flex flex-col">
            <Navbar />
            <div className="flex-1 p-8 overflow-y-auto w-full max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold font-outfit">Global Rankings</h1>
                </div>

                <GlassCard className="p-0 overflow-hidden">
                    <div className="w-full bg-black/40 px-6 py-4 flex font-bold text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
                        <div className="w-16">Rank</div>
                        <div className="flex-1">Scientist</div>
                        <div className="w-32 text-right">Total XP</div>
                    </div>

                    {mockLeaderboard.map(user => (
                        <div
                            key={user.rank}
                            className={`w-full px-6 py-4 flex items-center border-b border-gray-800 transition-colors ${user.isCurrentUser ? 'bg-neon-blue/10 border-l-4 border-l-neon-blue' : 'hover:bg-white/5'}`}
                        >
                            <div className={`w-16 font-bold font-mono text-lg ${user.rank <= 3 ? 'text-yellow-500' : 'text-gray-500'}`}>
                                #{user.rank}
                            </div>
                            <div className={`flex-1 font-semibold ${user.isCurrentUser ? 'text-neon-blue' : 'text-gray-200'}`}>
                                {user.name} {user.isCurrentUser && '(You)'}
                            </div>
                            <div className="w-32 text-right font-mono font-bold text-neon-green drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">
                                {user.xp}
                            </div>
                        </div>
                    ))}
                </GlassCard>
            </div>
        </div>
    );
}
