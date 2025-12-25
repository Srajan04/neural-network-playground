'use client';

import { Suspense, useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { useStore } from '@/store/useStore';
import { DenseNetwork } from './DenseNetwork';
import { CNNNetwork } from './CNNNetwork';
import * as THREE from 'three';

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#8b5cf6" wireframe />
    </mesh>
  );
}

export interface NetworkSceneHandle {
  resetCamera: () => void;
}

interface NetworkSceneProps {
  onResetRef?: React.MutableRefObject<(() => void) | null>;
}

export const NetworkScene = forwardRef<NetworkSceneHandle, NetworkSceneProps>(
  function NetworkScene({ onResetRef }, ref) {
    const { networkMode, darkMode } = useStore();
    const controlsRef = useRef<any>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    
    const resetCamera = () => {
      if (controlsRef.current && cameraRef.current) {
        cameraRef.current.position.set(0, 0, 15);
        cameraRef.current.lookAt(0, 0, 0);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    };
    
    useImperativeHandle(ref, () => ({
      resetCamera,
    }));
    
    // Also expose via ref prop for easier access
    if (onResetRef) {
      onResetRef.current = resetCamera;
    }
    
    return (
      <Canvas
        className="w-full h-full"
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera 
          ref={cameraRef}
          makeDefault 
          position={[0, 0, 15]} 
          fov={60} 
        />
        
        <color attach="background" args={[darkMode ? '#0f0f0f' : '#fafbfc']} />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        
        <Suspense fallback={<LoadingFallback />}>
          {networkMode === 'dense' ? <DenseNetwork /> : <CNNNetwork />}
        </Suspense>
        
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={0.5}
          maxDistance={50}
          enablePan={true}
          panSpeed={0.8}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
        />
        
        <Environment preset={darkMode ? 'night' : 'city'} />
      </Canvas>
    );
  }
);
