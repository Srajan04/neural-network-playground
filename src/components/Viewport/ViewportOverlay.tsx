'use client';

import { motion } from 'framer-motion';
import { Box, GitBranch, Hash, RotateCcw, Cpu, Database } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface ViewportOverlayProps {
  onResetCamera?: () => void;
  gpuAvailable: boolean;
  useGpu: boolean;
  onToggleGpu: () => void;
}

export function ViewportOverlay({ 
  onResetCamera, 
  gpuAvailable, 
  useGpu, 
  onToggleGpu 
}: ViewportOverlayProps) {
  const { denseLayers, networkMode, dataAmount, setDataAmount } = useStore();
  
  // Calculate network stats
  const layers = networkMode === 'dense' 
    ? [784, ...denseLayers, 10]
    : [784, 32, 32, 64, 64, 1600, 128, 10]; // CNN approximation
    
  const totalNeurons = layers.reduce((a, b) => a + b, 0);
  
  let totalConnections = 0;
  let totalParams = 0;
  for (let i = 0; i < layers.length - 1; i++) {
    totalConnections += layers[i] * layers[i + 1];
    totalParams += layers[i] * layers[i + 1] + layers[i + 1]; // weights + biases
  }
  
  // Format numbers consistently to avoid hydration mismatch
  const formatNumber = (n: number) => {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  return (
    <>
      {/* Bottom stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-5 left-5 flex gap-3 items-center"
      >
        <StatCard icon={<Hash size={14} />} label="Neurons" value={formatNumber(totalNeurons)} />
        <StatCard icon={<GitBranch size={14} />} label="Connections" value={formatNumber(totalConnections)} />
        <StatCard icon={<Box size={14} />} label="Parameters" value={formatNumber(totalParams)} />
        
        {/* Data Amount Slider */}
        <div className="bg-card/90 backdrop-blur-sm rounded-md px-4 py-3 shadow-medium">
          <div className="flex items-center gap-2 text-muted mb-1">
            <Database size={14} />
            <span className="text-[10px] uppercase tracking-wide">Data ({formatNumber(Math.round(55000 * dataAmount))})</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={dataAmount}
              onChange={(e) => setDataAmount(parseFloat(e.target.value))}
              className="w-24 h-1.5 cursor-pointer accent-accent"
              title={`Using ${(dataAmount * 100).toFixed(0)}% of training data`}
            />
            <span className="text-lg font-semibold text-foreground">{(dataAmount * 100).toFixed(0)}%</span>
          </div>
        </div>
      </motion.div>
      
      {/* Top left controls */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute top-5 left-5 flex gap-2"
      >
        {/* Reset camera */}
        <button
          onClick={onResetCamera}
          title="Reset camera view"
          className="w-10 h-10 rounded-md flex items-center justify-center shadow-medium bg-card text-muted hover:bg-border hover:text-foreground transition-all"
        >
          <RotateCcw size={18} />
        </button>
        
        {/* GPU toggle */}
        <button
          onClick={onToggleGpu}
          title={gpuAvailable ? (useGpu ? 'Using GPU (WebGL)' : 'Using CPU') : 'GPU not available'}
          className={`w-10 h-10 rounded-md flex items-center justify-center shadow-medium transition-all ${
            useGpu && gpuAvailable
              ? 'bg-emerald-500 text-white' 
              : gpuAvailable 
                ? 'bg-card text-muted hover:bg-border'
                : 'bg-card text-muted/50 cursor-not-allowed'
          }`}
          disabled={!gpuAvailable}
        >
          <Cpu size={18} />
        </button>
      </motion.div>
      
      {/* GPU status badge */}
      {gpuAvailable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`absolute top-5 left-40 px-3 py-1.5 rounded-full text-xs font-medium ${
            useGpu 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          {useGpu ? 'WebGL Accelerated' : 'CPU Mode'}
        </motion.div>
      )}
      
      {/* Help text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-5 right-5 text-xs text-muted bg-card/80 backdrop-blur-sm px-3 py-2 rounded-md"
      >
        Left-drag: Rotate • Right-drag: Pan • Scroll: Zoom
      </motion.div>
    </>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card/90 backdrop-blur-sm rounded-md px-4 py-3 shadow-medium">
      <div className="flex items-center gap-2 text-muted mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}
