import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const Card = ({ className, children, hoverEffect = false, ...props }) => {
    return (
        <motion.div
            whileHover={hoverEffect ? { y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" } : {}}
            className={cn(
                'bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
