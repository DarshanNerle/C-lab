import React from 'react';
import { motion } from 'framer-motion';

export default function NeonButton({ children, color = 'green', onClick, className = '', ...props }) {
    const colorMap = {
        green: "text-neon-green border-neon-green hover:bg-neon-green shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.6)]",
        blue: "text-neon-blue border-neon-blue hover:bg-neon-blue shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.6)]",
        red: "text-red-500 border-red-500 hover:bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.3)] hover:shadow-[0_0_20px_rgba(255,0,0,0.6)]"
    };

    const cssColors = colorMap[color] || colorMap.green;

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`px-6 py-3 rounded-full font-bold border-2 transition-all duration-300 hover:text-black ${cssColors} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
}
