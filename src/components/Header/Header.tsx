'use client';

import { motion } from 'framer-motion';
import { Sun, Moon, Play, Square, RotateCcw, Brain, Layers, Palette } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useStore, ColorScheme, NetworkMode } from '@/store/useStore';

interface HeaderProps {
  onTrain: () => void;
  onReset: () => void;
}

export function Header({ onTrain, onReset }: HeaderProps) {
  const {
    darkMode,
    setDarkMode,
    colorScheme,
    setColorScheme,
    networkMode,
    setNetworkMode,
    isTraining,
    modelReady,
  } = useStore();
  
  const colorSchemes: { value: ColorScheme; label: string }[] = [
    { value: 'soft', label: 'Soft' },
    { value: 'vibrant', label: 'Vibrant' },
    { value: 'purple', label: 'Purple' },
  ];
  
  const networkModes: { value: NetworkMode; label: string; icon: React.ReactNode }[] = [
    { value: 'dense', label: 'Dense', icon: <Layers size={14} /> },
    { value: 'cnn', label: 'CNN', icon: <Brain size={14} /> },
  ];
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-16 bg-card dark:bg-black/40 border-b border-border flex items-center justify-between px-6 theme-transition"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-10 h-10 bg-gradient-to-br from-accent to-accent-secondary rounded-lg flex items-center justify-center shadow-medium"
        >
          <Brain className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Neural Network Playground</h1>
          <p className="text-xs text-muted">MNIST Digit Recognition</p>
        </div>
      </div>
      
      {/* Center Controls */}
      <div className="flex items-center gap-6">
        {/* Network Mode */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted uppercase tracking-wide">Network</span>
          <SegmentedControl
            options={networkModes}
            value={networkMode}
            onChange={setNetworkMode}
          />
        </div>
        
        {/* Color Scheme */}
        <div className="flex items-center gap-3">
          <Palette size={14} className="text-muted" />
          <SegmentedControl
            options={colorSchemes}
            value={colorScheme}
            onChange={setColorScheme}
          />
        </div>
      </div>
      
      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <div className="flex items-center gap-2">
          <Sun size={14} className={`${darkMode ? 'text-muted' : 'text-amber-500'} transition-colors`} />
          <Switch
            checked={darkMode}
            onChange={setDarkMode}
            size="sm"
          />
          <Moon size={14} className={`${darkMode ? 'text-accent' : 'text-muted'} transition-colors`} />
        </div>
        
        {/* Status Badge */}
        <StatusBadge isTraining={isTraining} modelReady={modelReady} />
        
        {/* Action Buttons */}
        <Button variant="secondary" onClick={onReset} icon={<RotateCcw size={16} />}>
          Reset
        </Button>
        
        <Button
          variant="primary"
          onClick={onTrain}
          icon={isTraining ? <Square size={16} /> : <Play size={16} />}
        >
          {isTraining ? 'Stop' : 'Train'}
        </Button>
      </div>
    </motion.header>
  );
}

function StatusBadge({ isTraining, modelReady }: { isTraining: boolean; modelReady: boolean }) {
  const { trainingStats } = useStore();
  
  let status: 'idle' | 'training' | 'ready' = 'idle';
  let label = 'Idle';
  
  if (isTraining) {
    status = 'training';
    const percent = trainingStats.totalEpochs > 0 
      ? Math.round((trainingStats.currentEpoch / trainingStats.totalEpochs) * 100)
      : 0;
    label = `Training... (${percent}%)`;
  } else if (modelReady) {
    status = 'ready';
    label = 'Ready';
  }
  
  const styles = {
    idle: 'bg-border text-muted',
    training: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    ready: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  };
  
  return (
    <motion.div
      layout
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      <motion.span
        animate={status === 'training' ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
        transition={{ duration: 1, repeat: status === 'training' ? Infinity : 0 }}
        className="w-2 h-2 rounded-full bg-current"
      />
      {label}
    </motion.div>
  );
}
