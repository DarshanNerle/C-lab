import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';

const TOUR_STEPS = [
    {
        target: 'dashboard-welcome',
        title: 'Welcome to C-Lab 4.0',
        content: 'Your personal futuristic chemistry laboratory. Ready for your first experiment, Scientist?',
        position: 'center'
    },
    {
        target: 'lab-chamber',
        title: 'The Reaction Chamber',
        content: 'This is where the magic happens. Select reagents from the bottom rack and drop them into the main flask.',
        position: 'bottom'
    },
    {
        target: 'lab-inventory',
        title: 'Reagents & Inventory',
        content: 'Your available chemicals are stored here. As you level up, you will unlock more volatile and complex elements.',
        position: 'top'
    },
    {
        target: 'gamification-stats',
        title: 'Scientist Rank & XP',
        content: 'Discover new reactions and complete assignments to earn XP. Rank up from Novice to Master Scientist.',
        position: 'bottom'
    }
];

export default function TourGuide({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // In a real implementation we would use a library like intro.js or driver.js
        // to highlight specific DOM elements by ID. This is a simplified overlay mock.
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const handleClose = () => {
        setIsVisible(false);
        if (onComplete) onComplete();
    };

    if (!isVisible) return null;

    const step = TOUR_STEPS[currentStep];

    return (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    className="glass-panel max-w-md w-full p-6 rounded-2xl border border-neon-cyan/50 shadow-[0_0_30px_rgba(0,255,255,0.2)] pointer-events-auto relative overflow-hidden"
                >
                    {/* Decorative Top Glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-green"></div>

                    <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan flex items-center justify-center text-neon-cyan">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold tracking-widest text-white">{step.title}</h3>
                    </div>

                    <p className="text-gray-300 font-mono text-sm leading-relaxed mb-8">
                        {step.content}
                    </p>

                    <div className="flex items-center justify-between mt-6">
                        <div className="flex gap-1.5">
                            {TOUR_STEPS.map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-neon-cyan w-6' : 'bg-gray-600'}`} />
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                className={`p-2 rounded-lg border transition-all ${currentStep === 0 ? 'border-gray-700 text-gray-600 cursor-not-allowed' : 'border-gray-500 text-gray-300 hover:bg-white/10 hover:border-white'}`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="glass-button px-6 py-2 rounded-lg text-sm font-bold tracking-widest text-white hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] flex items-center gap-1"
                            >
                                {currentStep === TOUR_STEPS.length - 1 ? 'START' : 'NEXT'}
                                {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
