import React, { useEffect, useRef, useState } from 'react';
import useGameStore from '../../store/useGameStore';
import { calculateLevelInfo } from '../../utils/levelSystem';

export default function XPBar() {
    const xp = useGameStore(state => state.xp);
    const { xpIntoCurrentLevel, xpNeededForNext, progressPercent } = calculateLevelInfo(xp);
    const previousXp = useRef(xp);
    const [burstKey, setBurstKey] = useState(0);

    useEffect(() => {
        if (xp > previousXp.current) {
            setBurstKey((prev) => prev + 1);
        }
        previousXp.current = xp;
    }, [xp]);

    return (
        <div className="relative w-full">
            <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold tracking-widest text-cyan-300">XP PROGRESS</span>
                <span className="text-xs text-gray-400 font-mono">
                    {Math.floor(xpIntoCurrentLevel)} / {xpNeededForNext}
                </span>
            </div>
            <div className="progress-shimmer h-2.5 w-full rounded-full overflow-hidden border border-gray-700 bg-gray-800/80 relative">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
            <div key={burstKey} className="pointer-events-none absolute -top-1 right-2 h-5 w-16">
                {Array.from({ length: 8 }).map((_, index) => (
                    <span
                        key={index}
                        className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300/80 animate-[confettiPop_620ms_ease-out_forwards]"
                        style={{
                            left: `${8 + (index % 4) * 10}px`,
                            top: `${index % 2 === 0 ? 10 : 14}px`,
                            animationDelay: `${index * 40}ms`
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
