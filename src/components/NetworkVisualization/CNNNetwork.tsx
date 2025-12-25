'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { RoundedBox, Text } from '@react-three/drei';

interface LayerBox {
  position: THREE.Vector3;
  size: [number, number, number];
  color: number;
  label: string;
  type: string;
}

export function CNNNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const { colorScheme, animationsEnabled, prediction, cnnConfig, cnnViewMode } = useStore();
  
  const colors = useMemo(() => {
    const schemes = {
      soft: {
        input: 0xc4b5fd,
        conv: 0xfbcfe8,
        pool: 0xbfdbfe,
        flatten: 0xbbf7d0,
        dense: 0xfde68a,
        output: 0xfcd34d,
      },
      vibrant: {
        input: 0x8b5cf6,
        conv: 0xec4899,
        pool: 0x3b82f6,
        flatten: 0x22c55e,
        dense: 0xf59e0b,
        output: 0xef4444,
      },
      purple: {
        input: 0xddd6fe,
        conv: 0xc4b5fd,
        pool: 0xa78bfa,
        flatten: 0x8b5cf6,
        dense: 0x7c3aed,
        output: 0x6d28d9,
      },
    };
    return schemes[colorScheme];
  }, [colorScheme]);
  
  const layerBoxes: LayerBox[] = useMemo(() => {
    const boxes: LayerBox[] = [];
    let xOffset = -12;
    const spacing = 3;
    
    // Input layer (28x28x1)
    boxes.push({
      position: new THREE.Vector3(xOffset, 0, 0),
      size: [2.8, 2.8, 0.3],
      color: colors.input,
      label: '28×28×1',
      type: 'Input',
    });
    xOffset += spacing;
    
    // Dynamically add layers from cnnConfig
    let currentHeight = 28;
    let currentDepth = 1;
    
    cnnConfig.layers.forEach((layer) => {
      if (layer.type === 'conv2d') {
        const filters = layer.filters || 32;
        const kernelSize = layer.kernelSize || 3;
        // Approximate output size after conv2d with same padding
        currentHeight = Math.max(1, currentHeight - kernelSize + 1);
        currentDepth = filters;
        
        const size = Math.max(0.3, Math.min(3, currentHeight / 10));
        const depthSize = Math.min(3, currentDepth / 20);
        
        boxes.push({
          position: new THREE.Vector3(xOffset, 0, 0),
          size: [size, size, depthSize],
          color: colors.conv,
          label: `${currentHeight}×${currentHeight}×${filters}`,
          type: 'Conv2D',
        });
        xOffset += spacing;
      } else if (layer.type === 'maxpool') {
        // MaxPool reduces size by 2
        currentHeight = Math.floor(currentHeight / 2);
        
        const size = Math.max(0.3, Math.min(3, currentHeight / 10));
        
        boxes.push({
          position: new THREE.Vector3(xOffset, 0, 0),
          size: [size, size, Math.min(3, currentDepth / 20)],
          color: colors.pool,
          label: `${currentHeight}×${currentHeight}×${currentDepth}`,
          type: 'MaxPool',
        });
        xOffset += spacing;
      } else if (layer.type === 'flatten') {
        const flattenSize = currentHeight * currentHeight * currentDepth;
        
        boxes.push({
          position: new THREE.Vector3(xOffset, 0, 0),
          size: [0.3, Math.min(3, flattenSize / 200), 0.3],
          color: colors.flatten,
          label: flattenSize.toString(),
          type: 'Flatten',
        });
        xOffset += spacing;
        
        currentDepth = flattenSize;
      } else if (layer.type === 'dense') {
        const units = layer.units || 128;
        currentDepth = units;
        
        boxes.push({
          position: new THREE.Vector3(xOffset, 0, 0),
          size: [0.3, Math.min(3, units / 50), 0.3],
          color: colors.dense,
          label: units.toString(),
          type: 'Dense',
        });
        xOffset += spacing;
      }
    });
    
    // Output layer (always 10 for MNIST)
    boxes.push({
      position: new THREE.Vector3(xOffset, 0, 0),
      size: [0.3, 1.5, 0.3],
      color: colors.output,
      label: '10',
      type: 'Output',
    });
    
    return boxes;
  }, [colors, cnnConfig]);
  
  // Animation
  useFrame((state) => {
    if (!animationsEnabled || !groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(time * 0.15) * 0.1;
    groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.02;
  });
  
  if (cnnViewMode === 'neural') {
    return <CNNNeuralView layerBoxes={layerBoxes} />;
  }

  return (
    <group ref={groupRef}>
      {layerBoxes.map((box, index) => (
        <group key={index} position={box.position}>
          {/* Connection arrow to next layer */}
          {index < layerBoxes.length - 1 && (
            <mesh position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.1, 0.3, 8]} />
              <meshBasicMaterial 
                color={colorScheme === 'purple' ? 0x8b5cf6 : 0x9ca3af} 
                transparent 
                opacity={0.5} 
              />
            </mesh>
          )}
          
          {/* Layer box */}
          <RoundedBox
            args={box.size}
            radius={0.05}
            smoothness={4}
          >
            <meshPhongMaterial
              color={box.color}
              transparent
              opacity={prediction ? 0.9 : 0.8}
              emissive={new THREE.Color(box.color)}
              emissiveIntensity={prediction ? 0.3 : 0.1}
            />
          </RoundedBox>
          
          {/* Layer type label */}
          <Text
            position={[0, box.size[1] / 2 + 0.4, 0]}
            fontSize={0.25}
            color="#6b7280"
            anchorX="center"
            anchorY="bottom"
          >
            {box.type}
          </Text>
          
          {/* Dimensions label */}
          <Text
            position={[0, -box.size[1] / 2 - 0.3, 0]}
            fontSize={0.2}
            color="#9ca3af"
            anchorX="center"
            anchorY="top"
          >
            {box.label}
          </Text>
        </group>
      ))}
      
      {/* Data flow visualization when predicting */}
      {prediction && (
        <DataFlowParticles layerBoxes={layerBoxes} />
      )}
    </group>
  );
}

interface NeuralLayerData {
  position: THREE.Vector3;
  neurons: { x: number; y: number; z: number }[];
  color: number;
  type: string;
  label: string;
  displayNeurons: number;
  dimensions: { height: number; width: number; depth: number };
  isBlock?: boolean; // For Flatten layer - render as block instead of neurons
  blockSize?: [number, number, number]; // Size of block if isBlock is true
}

// Parse layer dimensions from label
function parseDimensions(label: string, type: string): { height: number; width: number; depth: number } {
  const match3d = label.match(/(\d+)×(\d+)×(\d+)/);
  if (match3d) {
    return {
      height: parseInt(match3d[1]),
      width: parseInt(match3d[2]),
      depth: parseInt(match3d[3]),
    };
  }
  
  const singleValue = parseInt(label);
  if (!isNaN(singleValue)) {
    return { height: 1, width: 1, depth: singleValue };
  }
  
  return { height: 1, width: 1, depth: 10 };
}

// Return actual grid dimensions - show ALL neurons for educational purposes
function getRepresentativeGrid(dims: { height: number; width: number; depth: number }, type: string): { rows: number; cols: number; layers: number } {
  if (type === 'Input') {
    // 28×28×1 - show full input
    return { rows: dims.height, cols: dims.width, layers: dims.depth };
  }
  
  if (type === 'Conv2D' || type === 'MaxPool') {
    // Show all spatial dimensions and all filters
    return { rows: dims.height, cols: dims.width, layers: dims.depth };
  }
  
  if (type === 'Flatten') {
    // Flatten rendered as a block, not individual neurons
    return { rows: 0, cols: 0, layers: 0 };
  }
  
  if (type === 'Dense') {
    // Show all dense units
    return { rows: dims.depth, cols: 1, layers: 1 };
  }
  
  if (type === 'Output') {
    // Output always shows all 10 neurons
    return { rows: 10, cols: 1, layers: 1 };
  }
  
  return { rows: dims.height, cols: dims.width, layers: dims.depth };
}

function CNNNeuralView({ layerBoxes }: { layerBoxes: LayerBox[] }) {
  const { colorScheme, animationsEnabled, prediction } = useStore();
  const groupRef = useRef<THREE.Group>(null);
  const neuronsRef = useRef<THREE.InstancedMesh>(null);
  const connectionsRef = useRef<THREE.LineSegments>(null);

  // Build neural layer data with proper positioning based on actual dimensions
  const { neuralLayers, connectionData, totalNeurons } = useMemo(() => {
    const layers: NeuralLayerData[] = [];
    const connections: number[] = [];
    let neuronCount = 0;

    const layerSpacing = 5;
    const totalWidth = (layerBoxes.length - 1) * layerSpacing;
    const startX = -totalWidth / 2;

    layerBoxes.forEach((box, layerIndex) => {
      const dimensions = parseDimensions(box.label, box.type);
      const grid = getRepresentativeGrid(dimensions, box.type);
      const displayNeurons = grid.rows * grid.cols * grid.layers;
      
      // Base neuron radius - scaled down for conv layers to show all neurons
      const baseNeuronRadius = 0.024;
      const x = startX + layerIndex * layerSpacing;

      const neurons: { x: number; y: number; z: number }[] = [];
      let isBlock = false;
      let blockSize: [number, number, number] = [0, 0, 0];

      if (box.type === 'Flatten') {
        // Flatten layer rendered as a proportional block
        isBlock = true;
        const flattenSize = dimensions.depth;
        // Height proportional to log of neuron count for reasonable sizing
        const blockHeight = Math.min(3, Math.max(1.5, Math.log10(flattenSize) * 0.8));
        blockSize = [0.15, blockHeight, 0.15];
        
        // Add virtual connection points at top and bottom of block
        const halfHeight = blockHeight / 2;
        neurons.push({ x: x, y: halfHeight * 0.8, z: 0 });
        neurons.push({ x: x, y: 0, z: 0 });
        neurons.push({ x: x, y: -halfHeight * 0.8, z: 0 });
        
      } else if (box.type === 'Conv2D' || box.type === 'MaxPool' || box.type === 'Input') {
        // 3D grid arrangement: rows (Y) × cols (Z) × layers (X offset)
        // Ensure spacing is at least 2.5x neuron diameter to prevent overlap
        const spacing = baseNeuronRadius * 2.5; // Y and Z spacing
        const depthSpacing = baseNeuronRadius * 3; // X spacing between filter layers (needs more room)
        const rowOffset = ((grid.rows - 1) * spacing) / 2;
        const colOffset = ((grid.cols - 1) * spacing) / 2;
        const layerOffset = ((grid.layers - 1) * depthSpacing) / 2;

        for (let layer = 0; layer < grid.layers; layer++) {
          for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
              neurons.push({
                x: x + layer * depthSpacing - layerOffset,
                y: row * spacing - rowOffset,
                z: col * spacing - colOffset,
              });
            }
          }
        }
      } else if (box.type === 'Output') {
        // Output layer - larger neurons with proper spacing
        // Output neurons are scaled 2x, so need 2x spacing
        const outputNeuronRadius = baseNeuronRadius * 2.0;
        const spacing = outputNeuronRadius * 3; // Ensure no overlap
        const rowOffset = ((grid.rows - 1) * spacing) / 2;
        
        for (let i = 0; i < grid.rows; i++) {
          neurons.push({
            x: x,
            y: i * spacing - rowOffset,
            z: 0,
          });
        }
      } else {
        // Dense layers - medium neurons with proper spacing
        // Dense neurons are scaled 1.2x
        const denseNeuronRadius = baseNeuronRadius * 1.2;
        const spacing = denseNeuronRadius * 3; // Ensure no overlap
        const rowOffset = ((grid.rows - 1) * spacing) / 2;
        
        for (let i = 0; i < grid.rows; i++) {
          neurons.push({
            x: x,
            y: i * spacing - rowOffset,
            z: 0,
          });
        }
      }

      layers.push({
        position: new THREE.Vector3(x, 0, 0),
        neurons,
        color: box.color,
        type: box.type,
        label: box.label,
        displayNeurons: isBlock ? dimensions.depth : displayNeurons,
        dimensions,
        isBlock,
        blockSize: isBlock ? blockSize : undefined,
      });

      if (!isBlock) {
        neuronCount += displayNeurons;
      }
    });

    // Build connections between adjacent layers
    layers.forEach((layer, layerIndex) => {
      if (layerIndex >= layers.length - 1) return;

      const nextLayer = layers[layerIndex + 1];
      const currentNeurons = layer.neurons;
      const nextNeurons = nextLayer.neurons;

      // Sample connections - more connections for smaller layers
      const totalPossible = currentNeurons.length * nextNeurons.length;
      const maxConnections = Math.min(150, Math.max(60, Math.floor(totalPossible / 3)));
      const skipRate = Math.max(1, Math.floor(totalPossible / maxConnections));

      let count = 0;
      for (let i = 0; i < currentNeurons.length; i++) {
        for (let j = 0; j < nextNeurons.length; j++) {
          count++;
          if (count % skipRate !== 0) continue;

          const n1 = currentNeurons[i];
          const n2 = nextNeurons[j];

          connections.push(n1.x, n1.y, n1.z, n2.x, n2.y, n2.z);
        }
      }
    });

    return {
      neuralLayers: layers,
      connectionData: new Float32Array(connections),
      totalNeurons: neuronCount,
    };
  }, [layerBoxes]);

  // Color scheme
  const colors = useMemo(() => {
    const schemes = {
      soft: {
        connection: 0x9ca3af,
        emissive: 0xc4b5fd,
      },
      vibrant: {
        connection: 0x6b7280,
        emissive: 0x8b5cf6,
      },
      purple: {
        connection: 0xa78bfa,
        emissive: 0x8b5cf6,
      },
    };
    return schemes[colorScheme];
  }, [colorScheme]);

  // Update instanced mesh for neurons
  useEffect(() => {
    if (!neuronsRef.current) return;

    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    let instanceIndex = 0;

    neuralLayers.forEach((layer) => {
      // Skip block layers (Flatten) - they don't render as neurons
      if (layer.isBlock) return;
      
      layer.neurons.forEach((neuron) => {
        tempObject.position.set(neuron.x, neuron.y, neuron.z);
        
        // Scale based on layer type - output neurons slightly larger for visibility
        const scale = layer.type === 'Output' ? 2.0 : 
                     layer.type === 'Dense' ? 1.2 : 1.0;
        tempObject.scale.setScalar(scale);
        tempObject.updateMatrix();
        neuronsRef.current!.setMatrixAt(instanceIndex, tempObject.matrix);

        tempColor.setHex(layer.color);
        neuronsRef.current!.setColorAt(instanceIndex, tempColor);

        instanceIndex++;
      });
    });

    neuronsRef.current.instanceMatrix.needsUpdate = true;
    if (neuronsRef.current.instanceColor) {
      neuronsRef.current.instanceColor.needsUpdate = true;
    }
  }, [neuralLayers]);

  // Animate based on predictions
  useEffect(() => {
    if (!prediction || !neuronsRef.current) return;

    const tempObject = new THREE.Object3D();
    let instanceIndex = 0;

    neuralLayers.forEach((layer, layerIndex) => {
      // Skip block layers
      if (layer.isBlock) return;
      
      layer.neurons.forEach((neuron, neuronIdx) => {
        let activation = 0;

        if (layer.type === 'Output') {
          activation = prediction.probabilities[neuronIdx] || 0;
        } else {
          // Simulated activation based on layer depth
          const layerProgress = layerIndex / (neuralLayers.length - 1);
          activation = Math.random() * prediction.confidence * (0.3 + layerProgress * 0.4);
        }

        const baseScale = layer.type === 'Output' ? 2.0 : 
                         layer.type === 'Dense' ? 1.2 : 1.0;
        
        tempObject.position.set(neuron.x, neuron.y, neuron.z);
        tempObject.scale.setScalar(baseScale * (1 + activation * 0.5));
        tempObject.updateMatrix();
        neuronsRef.current!.setMatrixAt(instanceIndex, tempObject.matrix);

        instanceIndex++;
      });
    });

    neuronsRef.current.instanceMatrix.needsUpdate = true;
  }, [prediction, neuralLayers]);

  // Idle animation - disabled for large neuron counts for performance
  useFrame((state) => {
    if (!animationsEnabled || !groupRef.current) return;

    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(time * 0.15) * 0.1;
    groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.02;

    // Skip per-neuron animation when there are too many neurons (performance)
    if (totalNeurons > 1000) return;

    // Subtle floating animation for neurons when no prediction
    if (neuronsRef.current && !prediction) {
      const tempObject = new THREE.Object3D();
      let instanceIndex = 0;

      neuralLayers.forEach((layer) => {
        // Skip block layers
        if (layer.isBlock) return;
        
        layer.neurons.forEach((neuron, neuronIdx) => {
          const offset = Math.sin(time * 0.5 + instanceIndex * 0.1) * 0.01;
          
          tempObject.position.set(neuron.x, neuron.y + offset, neuron.z);
          
          const baseScale = layer.type === 'Output' ? 2.0 : 
                           layer.type === 'Dense' ? 1.2 : 1.0;
          tempObject.scale.setScalar(baseScale);
          tempObject.updateMatrix();
          neuronsRef.current!.setMatrixAt(instanceIndex, tempObject.matrix);

          instanceIndex++;
        });
      });

      neuronsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Connections between all layers */}
      <lineSegments ref={connectionsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[connectionData, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={colors.connection}
          transparent
          opacity={0.15}
        />
      </lineSegments>

      {/* Neurons as instanced mesh for performance */}
      <instancedMesh
        ref={neuronsRef}
        args={[undefined, undefined, totalNeurons]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.024, 8, 8]} />
        <meshPhongMaterial
          transparent
          opacity={0.85}
          emissive={new THREE.Color(colors.emissive)}
          emissiveIntensity={0.25}
        />
      </instancedMesh>

      {/* Flatten layer as block */}
      {neuralLayers.filter(layer => layer.isBlock).map((layer, i) => (
        <group key={`block-${i}`} position={layer.position}>
          <RoundedBox
            args={layer.blockSize}
            radius={0.03}
            smoothness={4}
          >
            <meshPhongMaterial
              color={layer.color}
              transparent
              opacity={0.85}
              emissive={new THREE.Color(layer.color)}
              emissiveIntensity={prediction ? 0.4 : 0.2}
            />
          </RoundedBox>
        </group>
      ))}

      {/* Layer labels */}
      {neuralLayers.map((layer, i) => {
        const maxY = layer.isBlock && layer.blockSize 
          ? layer.blockSize[1] / 2 
          : Math.max(...layer.neurons.map(n => n.y));
        const neuronCount = layer.displayNeurons;
        return (
          <group key={i} position={[layer.position.x, maxY + 0.4, 0]}>
            <Text
              fontSize={0.2}
              color="#6b7280"
              anchorX="center"
              anchorY="bottom"
            >
              {layer.type}
            </Text>
            <Text
              position={[0, 0.25, 0]}
              fontSize={0.14}
              color="#9ca3af"
              anchorX="center"
              anchorY="bottom"
            >
              {layer.isBlock ? `${neuronCount.toLocaleString()}` : layer.label}
            </Text>
            <Text
              position={[0, 0.45, 0]}
              fontSize={0.11}
              color="#a1a1aa"
              anchorX="center"
              anchorY="bottom"
            >
              {layer.isBlock ? 'flattened values' : `${neuronCount.toLocaleString()} neurons`}
            </Text>
          </group>
        );
      })}

      {/* Data flow particles */}
      {prediction && (
        <NeuralDataFlowParticles neuralLayers={neuralLayers} />
      )}
    </group>
  );
}

function NeuralDataFlowParticles({ neuralLayers }: { neuralLayers: NeuralLayerData[] }) {
  const particlesRef = useRef<THREE.Points>(null);
  const { colorScheme } = useStore();

  const particleCount = 80;

  const { positions, velocities, layerIndices } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount);
    const layers = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const layerIdx = Math.floor(Math.random() * (neuralLayers.length - 1));
      const currentLayer = neuralLayers[layerIdx];
      const nextLayer = neuralLayers[layerIdx + 1];

      // Pick random neurons from each layer
      const fromNeuron = currentLayer.neurons[Math.floor(Math.random() * currentLayer.neurons.length)];
      const toNeuron = nextLayer.neurons[Math.floor(Math.random() * nextLayer.neurons.length)];

      const t = Math.random();
      pos[i * 3] = fromNeuron.x + (toNeuron.x - fromNeuron.x) * t;
      pos[i * 3 + 1] = fromNeuron.y + (toNeuron.y - fromNeuron.y) * t;
      pos[i * 3 + 2] = fromNeuron.z + (toNeuron.z - fromNeuron.z) * t;

      vel[i] = 0.015 + Math.random() * 0.025;
      layers[i] = layerIdx;
    }

    return { positions: pos, velocities: vel, layerIndices: layers };
  }, [neuralLayers]);

  useFrame(() => {
    if (!particlesRef.current || neuralLayers.length < 2) return;

    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const layerIdx = Math.floor(layerIndices[i]);
      if (layerIdx >= neuralLayers.length - 1) continue;

      const currentLayer = neuralLayers[layerIdx];
      const nextLayer = neuralLayers[layerIdx + 1];

      // Move particle toward next layer
      posArray[i * 3] += velocities[i];

      // Reset particle when it passes the next layer
      if (posArray[i * 3] > nextLayer.position.x) {
        const newLayerIdx = Math.floor(Math.random() * (neuralLayers.length - 1));
        layerIndices[i] = newLayerIdx;

        const fromLayer = neuralLayers[newLayerIdx];
        const toLayer = neuralLayers[newLayerIdx + 1];

        const fromNeuron = fromLayer.neurons[Math.floor(Math.random() * fromLayer.neurons.length)];
        const toNeuron = toLayer.neurons[Math.floor(Math.random() * toLayer.neurons.length)];

        posArray[i * 3] = fromNeuron.x;
        posArray[i * 3 + 1] = fromNeuron.y;
        posArray[i * 3 + 2] = fromNeuron.z;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={colorScheme === 'purple' ? 0xa78bfa : 0x8b5cf6}
        size={0.06}
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

function DataFlowParticles({ layerBoxes }: { layerBoxes: LayerBox[] }) {
  const particlesRef = useRef<THREE.Points>(null);
  const { colorScheme } = useStore();
  
  const particleCount = 50;
  
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const layerIdx = Math.floor(Math.random() * (layerBoxes.length - 1));
      const startBox = layerBoxes[layerIdx];
      const endBox = layerBoxes[layerIdx + 1];
      
      const t = Math.random();
      pos[i * 3] = startBox.position.x + (endBox.position.x - startBox.position.x) * t;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      
      vel[i] = 0.02 + Math.random() * 0.03;
    }
    
    return { positions: pos, velocities: vel };
  }, [layerBoxes]);
  
  useFrame(() => {
    if (!particlesRef.current) return;
    
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const minX = layerBoxes[0].position.x;
    const maxX = layerBoxes[layerBoxes.length - 1].position.x;
    
    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] += velocities[i];
      
      if (posArray[i * 3] > maxX) {
        posArray[i * 3] = minX;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 2;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={colorScheme === 'purple' ? 0xa78bfa : 0x8b5cf6}
        size={0.08}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}
