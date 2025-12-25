'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { LeftPanel } from '@/components/Panels/LeftPanel';
import { RightPanel } from '@/components/Panels/RightPanel';
import { ViewportOverlay } from '@/components/Viewport';
import { ResizablePanel } from '@/components/ui/ResizablePanel';
import { EducationalDialog } from '@/components/EducationalDialog';
import { useStore } from '@/store/useStore';
import { useNeuralNetwork } from '@/hooks/useNeuralNetwork';

// Dynamic import for Three.js to avoid SSR issues
const NetworkScene = dynamic(
  () => import('@/components/NetworkVisualization/NetworkScene').then(mod => ({ default: mod.NetworkScene })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-border border-t-accent rounded-full"
          />
          <span className="text-sm text-muted">Loading 3D Scene...</span>
        </div>
      </div>
    )
  }
);

export default function Home() {
  const { darkMode, colorScheme, hasSeenEducationalDialog, setShowEducationalDialog, setHasSeenEducationalDialog } = useStore();
  const { 
    toggleTraining, 
    predict, 
    reset, 
    dataLoaded, 
    loadingProgress,
    gpuAvailable,
    useGpu,
    toggleGpu,
  } = useNeuralNetwork();
  
  const resetCameraRef = useRef<(() => void) | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isFullyReady, setIsFullyReady] = useState(false);
  
  // Handle hydration to prevent layout shifts
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Track when everything is fully loaded and ready
  useEffect(() => {
    if (isHydrated && dataLoaded && !isFullyReady) {
      // Wait for loading overlay to fade out (400ms) + buffer
      const timer = setTimeout(() => {
        setIsFullyReady(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, dataLoaded, isFullyReady]);
  
  // Show educational dialog on first visit - only after everything is fully ready
  useEffect(() => {
    if (isFullyReady && !hasSeenEducationalDialog) {
      setShowEducationalDialog(true);
      setHasSeenEducationalDialog(true);
    }
  }, [isFullyReady, hasSeenEducationalDialog, setShowEducationalDialog, setHasSeenEducationalDialog]);
  
  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    root.setAttribute('data-color-scheme', colorScheme);
  }, [darkMode, colorScheme]);
  
  const handleResetCamera = () => {
    resetCameraRef.current?.();
  };
  
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Initial loading screen before hydration */}
      <AnimatePresence>
        {!isHydrated && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background z-[100] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-border border-t-accent rounded-full"
              />
              <span className="text-sm text-muted">Initializing...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header onTrain={toggleTraining} onReset={reset} />
      
      {/* Educational Dialog */}
      <EducationalDialog />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Resizable */}
        <ResizablePanel
          defaultWidth={320}
          minWidth={280}
          maxWidth={480}
          side="left"
        >
          <LeftPanel onPredict={predict} />
        </ResizablePanel>
        
        {/* Main 3D Viewport */}
        <main className="flex-1 relative bg-background theme-transition min-w-0">
          <NetworkScene onResetRef={resetCameraRef} />
          <ViewportOverlay 
            onResetCamera={handleResetCamera}
            gpuAvailable={gpuAvailable}
            useGpu={useGpu}
            onToggleGpu={toggleGpu}
          />
          
          {/* Loading overlay for data */}
          <AnimatePresence>
            {!dataLoaded && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10"
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-border border-t-accent rounded-full"
                  />
                  <span className="text-sm text-muted">Loading MNIST data... {loadingProgress}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Right Panel - Resizable */}
        <ResizablePanel
          defaultWidth={320}
          minWidth={280}
          maxWidth={480}
          side="right"
        >
          <RightPanel />
        </ResizablePanel>
      </div>
    </div>
  );
}
