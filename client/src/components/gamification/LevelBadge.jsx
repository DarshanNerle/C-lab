import React from 'react';
import useGameStore from '../../store/useGameStore';

export default function LevelBadge({ className = '' }) {
    const level = useGameStore(state => state.level);

    return (
        <div className={`relative flex items-center justify-center w-14 h-14 ${className}`}>
            {/* Outer Glow Hexagon/Circle Simulator */}
            <div className="absolute inset-0 bg-neon-green blur-[8px] opacity-40 rounded-full animate-pulse"></div>

            {/* Container */}
            <div className="relative z-10 w-12 h-12 bg-lab-dark border-2 border-neon-green flex items-center justify-center shadow-[inset_0_0_10px_rgba(57,255,20,0.3)] custom-hexagon" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                <span className="text-xl font-black font-mono text-neon-green drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]">
                    {level}
                </span>
            </div>
        </div>
    );
}
