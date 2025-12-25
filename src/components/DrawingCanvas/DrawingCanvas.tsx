'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Pencil, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store/useStore';

interface DrawingCanvasProps {
  onPredict: (imageData: Float32Array) => void;
}

export function DrawingCanvas({ onPredict }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [hasDrawn, setHasDrawn] = useState(false);
  
  const { darkMode, setPrediction } = useStore();
  
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 280;
    const center = size / 2;
    
    // Fill background
    ctx.fillStyle = darkMode ? '#1a1a1a' : 'white';
    ctx.fillRect(0, 0, size, size);
    
    // Draw dashed grid with radial fade effect (28x28 grid to match MNIST resolution)
    const gridSize = size / 28; // 10px per cell
    const maxRadius = size * 0.9; // Fade starts from this radius
    
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 2]); // Dashed pattern
    
    // Function to calculate opacity based on distance from center
    const getOpacity = (x: number, y: number) => {
      const dx = x - center;
      const dy = y - center;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const opacity = Math.max(0, 1 - (distance / maxRadius));
      return opacity * (darkMode ? 0.15 : 0.12);
    };
    
    // Draw vertical lines with gradient
    for (let x = 0; x <= size; x += gridSize) {
      for (let y = 0; y < size; y += gridSize) {
        const opacity = getOpacity(x, y + gridSize / 2);
        if (opacity > 0.01) {
          ctx.strokeStyle = darkMode 
            ? `rgba(255, 255, 255, ${opacity})` 
            : `rgba(0, 0, 0, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, Math.min(y + gridSize, size));
          ctx.stroke();
        }
      }
    }
    
    // Draw horizontal lines with gradient
    for (let y = 0; y <= size; y += gridSize) {
      for (let x = 0; x < size; x += gridSize) {
        const opacity = getOpacity(x + gridSize / 2, y);
        if (opacity > 0.01) {
          ctx.strokeStyle = darkMode 
            ? `rgba(255, 255, 255, ${opacity})` 
            : `rgba(0, 0, 0, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(Math.min(x + gridSize, size), y);
          ctx.stroke();
        }
      }
    }
    
    // Reset stroke style for drawing
    ctx.setLineDash([]); // Remove dash pattern
    ctx.strokeStyle = darkMode ? 'white' : 'black';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setHasDrawn(false);
  }, [darkMode]);
  
  useEffect(() => {
    initCanvas();
  }, [initCanvas]);
  
  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = 280 / rect.width;
    const scaleY = 280 / rect.height;
    
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);
  
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    setIsDrawing(true);
    setLastPos(pos);
    setHasDrawn(true);
  }, [getPos]);
  
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    const pos = getPos(e);
    
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    setLastPos(pos);
  }, [isDrawing, lastPos, getPos]);
  
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);
  
  const triggerPrediction = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a 28x28 canvas for resizing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    // Draw resized image
    tempCtx.drawImage(canvas, 0, 0, 28, 28);
    
    // Get pixel data
    const imageData = tempCtx.getImageData(0, 0, 28, 28);
    const data = imageData.data;
    
    // Convert to grayscale and normalize
    const input = new Float32Array(784);
    for (let i = 0; i < 784; i++) {
      // Invert for dark mode, keep as is for light mode
      const pixel = data[i * 4];
      input[i] = darkMode ? pixel / 255 : 1 - (pixel / 255);
    }
    
    onPredict(input);
  }, [onPredict, darkMode]);
  
  const clearCanvas = useCallback(() => {
    initCanvas();
    setPrediction(null);
  }, [initCanvas, setPrediction]);
  
  const handlePredict = useCallback(() => {
    triggerPrediction();
  }, [triggerPrediction]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-4"
    >
      <div className="bg-card rounded-lg p-3 shadow-medium theme-transition">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="w-full aspect-square rounded-md drawing-canvas bg-card"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={clearCanvas}
          icon={<RotateCcw size={16} />}
          className="flex-1"
        >
          Clear
        </Button>
        <Button
          variant="primary"
          onClick={handlePredict}
          icon={<Sparkles size={16} />}
          className="flex-1"
          disabled={!hasDrawn}
        >
          Predict
        </Button>
      </div>
      
      <div className="flex items-center justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Pencil size={12} />
          Draw a digit (0-9)
        </span>
      </div>
    </motion.div>
  );
}
