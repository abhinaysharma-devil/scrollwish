import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoaderProps {
    text?: string;
    fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ text = "Loading...", fullScreen = false }) => {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-16 h-16">
                {/* Outer Ring */}
                <motion.div 
                    className="absolute inset-0 border-4 border-rose-100 rounded-full"
                />
                {/* Spinning Ring */}
                <motion.div 
                    className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                {/* Center Heart */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Heart size={20} className="text-rose-500 fill-rose-500" />
                    </motion.div>
                </div>
            </div>
            <p className="text-rose-600 font-medium text-sm animate-pulse">{text}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[200px] flex items-center justify-center">
            {content}
        </div>
    );
};