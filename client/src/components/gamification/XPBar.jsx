import React from 'react';
import useGameStore from '../../store/useGameStore';
import { calculateLevelInfo } from '../../utils/levelSystem';

export default function XPBar() {
    const xp = useGameStore(state => state.xp);
    const { xpIntoCurrentLevel, xpNeededForNext, progressPercent } = calculateLevelInfo(xp);

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold tracking-widest text-[#0ff]">XP PROGRESS</span>
                <span className="text-xs text-gray-400 font-mono">
                    {Math.floor(xpIntoCurrentLevel)} / {xpNeededForNext}
                </span>
            </div>
            <div className="h-2.5 w-full bg-gray-800/80 rounded-full overflow-hidden border border-gray-700 relative">
                <div
                    className="h-full bg-gradient-to-r from-neon-blue to-neon-green transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,255,255,0.6)]"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
}
