import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { playSound } from '../../utils/soundManager';

export default function AchievementPopup({ badge, description, xpReward }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        playSound('success');
        const timer = setTimeout(() => setIsVisible(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="fixed bottom-8 right-8 z-50 w-80 glass-card rounded-xl border border-yellow-500 p-4 shadow-[0_0_30px_rgba(234,179,8,0.3)] overflow-hidden"
                >
                    {/* Animated Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] animate-[shimmer_2s_infinite]" />

                    <div className="flex gap-4 items-center relative z-10">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center shadow-[inset_0_0_15px_rgba(234,179,8,0.5)]">
                            <Trophy className="text-yellow-400 w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xs text-yellow-500 font-bold tracking-wider uppercase">Achievement Unlocked</h4>
                            <p className="text-white font-bold text-lg leading-tight">{badge}</p>
                            {xpReward && <p className="text-xs text-neon-green mt-1">+{xpReward} XP</p>}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
