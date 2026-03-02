import React, { useEffect, useRef, useState } from 'react';
import useGameStore from '../../store/useGameStore';

export default function LevelBadge({ className = '' }) {
    const level = useGameStore(state => state.level);
    const previousLevel = useRef(level);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (level > previousLevel.current) {
            setPulse(true);
            const timer = setTimeout(() => setPulse(false), 900);
            previousLevel.current = level;
            return () => clearTimeout(timer);
        }
        previousLevel.current = level;
        return undefined;
    }, [level]);

    return (
        <div className={`relative flex items-center justify-center w-14 h-14 ${className}`}>
            {/* Outer Glow Hexagon/Circle Simulator */}
            <div className={`absolute inset-0 rounded-full blur-[10px] ${pulse ? 'bg-amber-300/70 animate-ping' : 'bg-emerald-400/40 animate-pulse'}`}></div>

            {/* Container */}
            <div className={`relative z-10 w-12 h-12 flex items-center justify-center shadow-[inset_0_0_10px_rgba(57,255,20,0.3)] custom-hexagon ${pulse ? 'bg-gradient-to-br from-amber-400 to-fuchsia-500 border-2 border-amber-200' : 'bg-slate-900 border-2 border-emerald-400'}`} style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                <span className={`text-xl font-black font-mono ${pulse ? 'text-white drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]' : 'text-emerald-300 drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]'}`}>
                    {level}
                </span>
            </div>
        </div>
    );
}
