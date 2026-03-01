import React from 'react';
import { motion } from 'framer-motion';

/**
 * GlassCard - UI Component for futuristic glassmorphism containers.
 */
const GlassCard = ({ children, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card p-6 ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
