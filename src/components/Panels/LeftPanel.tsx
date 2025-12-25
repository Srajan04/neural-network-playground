'use client';

import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import { DrawingCanvas, PredictionDisplay } from '@/components/DrawingCanvas';

interface LeftPanelProps {
  onPredict: (imageData: Float32Array) => void;
}

export function LeftPanel({ onPredict }: LeftPanelProps) {
  return (
    <div className="h-full bg-card border-r border-border flex flex-col overflow-hidden theme-transition">
      {/* Drawing Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-5 border-b border-border bg-pastel-purple/30 dark:bg-black/60"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
          Draw a Digit
        </h2>
        <DrawingCanvas onPredict={onPredict} />
      </motion.div>
      
      {/* Prediction Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-5 flex-1 bg-pastel-green/30 dark:bg-black/60 overflow-y-auto scrollbar-purple"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
          Prediction
        </h2>
        <PredictionDisplay />
      </motion.div>
      
      {/* Credits Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4 py-3 border-t border-border bg-background/50"
      >
        <div className="flex items-center justify-center gap-2 text-xs text-muted">
          <span>Built by</span>
          <a
            href="https://github.com/Srajan04"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-accent transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            Srajan
          </a>
        </div>
      </motion.div>
    </div>
  );
}
