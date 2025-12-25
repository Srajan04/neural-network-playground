'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { Text } from '@react-three/drei';

interface NeuronData {
  position: THREE.Vector3;
  layer: number;
  index: number;
  activation: number;
  scale: number;
}

export function DenseNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const neuronsRef = useRef<THREE.InstancedMesh>(null);
  const connectionsRef = useRef<THREE.LineSegments>(null);
  
  const { denseLayers, colorScheme, animationsEnabled, prediction } = useStore();
  
  const layers = useMemo(() => [784, ...denseLayers, 10], [denseLayers]);
  
  // Calculate display neurons proportionally based on actual count
  const getDisplayNeurons = (numNeurons: number, layerIndex: number, totalLayers: number) => {
    // Input and output layers have fixed representation
    if (layerIndex === 0) return 16; // Input layer compressed
    if (layerIndex === totalLayers - 1) return 10; // Output layer shows all 10
    
    // Hidden layers: scale display based on actual neuron count
    // Map 16-512 neurons to 4-20 display neurons
    const minDisplay = 4;
    const maxDisplay = 20;
    const minNeurons = 16;
    const maxNeurons = 512;
    
    const normalized = Math.log(numNeurons / minNeurons) / Math.log(maxNeurons / minNeurons);
    const display = Math.round(minDisplay + normalized * (maxDisplay - minDisplay));
    return Math.max(minDisplay, Math.min(maxDisplay, display));
  };
  
  // Calculate vertical spacing based on neuron count
  const getLayerHeight = (displayNeurons: number) => {
    return displayNeurons * 0.4;
  };
  
  const { neuronData, connectionData, layerInfo } = useMemo(() => {
    const neurons: NeuronData[] = [];
    const connections: number[] = [];
    const info: { x: number; neurons: number; displayNeurons: number }[] = [];
    
    const layerSpacing = 5;
    const totalWidth = (layers.length - 1) * layerSpacing;
    const startX = -totalWidth / 2;
    
    layers.forEach((numNeurons, layerIndex) => {
      const displayNeurons = getDisplayNeurons(numNeurons, layerIndex, layers.length);
      const layerHeight = getLayerHeight(displayNeurons);
      const neuronSpacing = layerHeight / (displayNeurons - 1 || 1);
      const startY = -layerHeight / 2;
      const x = startX + layerIndex * layerSpacing;
      
      // Scale neuron size based on layer's neuron count
      // More neurons = smaller individual dots
      const baseScale = 0.15;
      const scaleMultiplier = layerIndex === 0 ? 0.6 : // Input layer smaller
                             layerIndex === layers.length - 1 ? 1.2 : // Output layer bigger
                             Math.max(0.5, 1.2 - (numNeurons / 512) * 0.7); // Hidden layers
      
      info.push({ x, neurons: numNeurons, displayNeurons });
      
      for (let i = 0; i < displayNeurons; i++) {
        const y = displayNeurons > 1 ? startY + i * neuronSpacing : 0;
        neurons.push({
          position: new THREE.Vector3(x, y, 0),
          layer: layerIndex,
          index: i,
          activation: 0,
          scale: baseScale * scaleMultiplier,
        });
      }
      
      // Connections to next layer
      if (layerIndex < layers.length - 1) {
        const nextNumNeurons = layers[layerIndex + 1];
        const nextDisplayNeurons = getDisplayNeurons(nextNumNeurons, layerIndex + 1, layers.length);
        const nextLayerHeight = getLayerHeight(nextDisplayNeurons);
        const nextSpacing = nextLayerHeight / (nextDisplayNeurons - 1 || 1);
        const nextStartY = -nextLayerHeight / 2;
        const nextX = startX + (layerIndex + 1) * layerSpacing;
        
        // Sample connections - fewer for larger layers
        const maxConnections = 120;
        const totalPossible = displayNeurons * nextDisplayNeurons;
        const skipRate = Math.max(1, Math.floor(totalPossible / maxConnections));
        
        let count = 0;
        for (let i = 0; i < displayNeurons; i++) {
          for (let j = 0; j < nextDisplayNeurons; j++) {
            count++;
            if (count % skipRate !== 0) continue;
            
            const y1 = displayNeurons > 1 ? startY + i * neuronSpacing : 0;
            const y2 = nextDisplayNeurons > 1 ? nextStartY + j * nextSpacing : 0;
            
            connections.push(x, y1, 0, nextX, y2, 0);
          }
        }
      }
    });
    
    return {
      neuronData: neurons,
      connectionData: new Float32Array(connections),
      layerInfo: info,
    };
  }, [layers]);
  
  // Color scheme colors
  const colors = useMemo(() => {
    const schemes = {
      soft: [0xc4b5fd, 0xfbcfe8, 0xbfdbfe, 0xbbf7d0, 0xfcd34d],
      vibrant: [0x8b5cf6, 0xec4899, 0x3b82f6, 0x22c55e, 0xf59e0b],
      purple: [0xddd6fe, 0xc4b5fd, 0xa78bfa, 0x8b5cf6, 0x7c3aed],
    };
    return schemes[colorScheme];
  }, [colorScheme]);
  
  // Update instanced mesh
  useEffect(() => {
    if (!neuronsRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    neuronData.forEach((neuron, i) => {
      tempObject.position.copy(neuron.position);
      tempObject.scale.setScalar(neuron.scale / 0.15); // Normalize to geometry size
      tempObject.updateMatrix();
      neuronsRef.current!.setMatrixAt(i, tempObject.matrix);
      
      const colorIndex = Math.min(neuron.layer, colors.length - 1);
      tempColor.setHex(colors[colorIndex]);
      neuronsRef.current!.setColorAt(i, tempColor);
    });
    
    neuronsRef.current.instanceMatrix.needsUpdate = true;
    if (neuronsRef.current.instanceColor) {
      neuronsRef.current.instanceColor.needsUpdate = true;
    }
  }, [neuronData, colors]);
  
  // Animate based on predictions
  useEffect(() => {
    if (!prediction || !neuronsRef.current) return;
    
    const tempObject = new THREE.Object3D();
    
    neuronData.forEach((neuron, i) => {
      let activation = 0;
      
      if (neuron.layer === layers.length - 1) {
        // Output layer - use prediction probabilities
        activation = prediction.probabilities[neuron.index] || 0;
      } else {
        // Other layers - simulated activation
        activation = Math.random() * prediction.confidence * 0.5;
      }
      
      const baseScale = neuron.scale / 0.15;
      tempObject.position.copy(neuron.position);
      tempObject.scale.setScalar(baseScale * (1 + activation * 0.5));
      tempObject.updateMatrix();
      neuronsRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    neuronsRef.current.instanceMatrix.needsUpdate = true;
  }, [prediction, neuronData, layers.length]);
  
  // Idle animation
  useFrame((state) => {
    if (!animationsEnabled || !groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
    
    // Subtle floating for neurons
    if (neuronsRef.current && !prediction) {
      const tempObject = new THREE.Object3D();
      
      neuronData.forEach((neuron, i) => {
        const offset = Math.sin(time * 0.5 + i * 0.1) * 0.015;
        tempObject.position.set(
          neuron.position.x,
          neuron.position.y + offset,
          neuron.position.z
        );
        
        const baseScale = neuron.scale / 0.15;
        tempObject.scale.setScalar(baseScale);
        tempObject.updateMatrix();
        neuronsRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      
      neuronsRef.current.instanceMatrix.needsUpdate = true;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Connections */}
      <lineSegments ref={connectionsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[connectionData, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={colorScheme === 'purple' ? 0xa78bfa : 0x9ca3af}
          transparent
          opacity={0.12}
        />
      </lineSegments>
      
      {/* Neurons */}
      <instancedMesh
        ref={neuronsRef}
        args={[undefined, undefined, neuronData.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshPhongMaterial
          transparent
          opacity={0.95}
          emissive={new THREE.Color(colors[0])}
          emissiveIntensity={0.15}
        />
      </instancedMesh>
      
      {/* Layer labels */}
      {layerInfo.map((info, i) => (
        <group key={i} position={[info.x, -4, 0]}>
          <Text
            fontSize={0.25}
            color="#6b7280"
            anchorX="center"
            anchorY="top"
          >
            {i === 0 ? 'Input' : i === layers.length - 1 ? 'Output' : `Dense`}
          </Text>
          <Text
            position={[0, -0.35, 0]}
            fontSize={0.2}
            color="#9ca3af"
            anchorX="center"
            anchorY="top"
          >
            {info.neurons}
          </Text>
        </group>
      ))}
    </group>
  );
}
