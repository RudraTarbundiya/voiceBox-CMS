import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

export function LoadingAnimation({ fullScreen = false, label = 'Loading System' }) {
    const content = (
        <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ["20%", "50%", "20%"]
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
                className="flex h-16 w-16 items-center justify-center bg-primary"
            >
                <Mic className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm font-medium tracking-widest text-muted-foreground uppercase"
            >
                {label}
            </motion.p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-100 flex min-h-screen w-full items-center justify-center bg-background/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
}
