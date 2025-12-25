'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export function PredictionDisplay() {
  const { prediction } = useStore();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Main prediction */}
      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={prediction?.digit ?? 'empty'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="w-20 h-20 bg-gradient-to-br from-accent to-accent-secondary rounded-xl flex items-center justify-center shadow-large"
          >
            <span className="text-5xl font-bold text-white">
              {prediction?.digit ?? '-'}
            </span>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex-1">
          <div className="text-xs text-muted uppercase tracking-wide mb-1">
            Confidence
          </div>
          <motion.div
            key={prediction?.confidence}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-semibold text-foreground"
          >
            {prediction ? `${(prediction.confidence * 100).toFixed(1)}%` : '0%'}
          </motion.div>
          
          <div className="h-1.5 bg-border rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(prediction?.confidence ?? 0) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
      
      {/* Probability bars */}
      <div className="space-y-1.5">
        {Array.from({ length: 10 }, (_, i) => {
          const prob = prediction?.probabilities[i] ?? 0;
          const isActive = prediction?.digit === i;
          
          return (
            <div key={i} className="flex items-center gap-2">
              <span className={`w-4 text-xs font-medium ${isActive ? 'text-accent' : 'text-muted'}`}>
                {i}
              </span>
              
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    isActive 
                      ? 'bg-gradient-to-r from-accent to-accent-secondary' 
                      : 'bg-accent-tertiary'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${prob * 100}%` }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                />
              </div>
              
              <span className={`w-10 text-right text-[10px] ${isActive ? 'text-accent font-medium' : 'text-muted'}`}>
                {(prob * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
