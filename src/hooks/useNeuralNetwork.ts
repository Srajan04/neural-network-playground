'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useStore } from '@/store/useStore';
import { loadMnistSubset, MnistData } from '@/lib/mnist';


export function useNeuralNetwork() {
  const modelRef = useRef<tf.LayersModel | null>(null);
  const dataRef = useRef<MnistData | null>(null);
  const trainingRef = useRef(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [gpuAvailable, setGpuAvailable] = useState(false);
  const [useGpu, setUseGpu] = useState(true);
  
  const {
    networkMode,
    denseLayers,
    learningRate,
    batchSize,
    epochs,
    activation,
    optimizer,
    dataAmount,
    setIsTraining,
    setTrainingStats,
    resetTrainingStats,
    setPrediction,
    setModelReady,
  } = useStore();
  
  // Load real MNIST data and check GPU
  useEffect(() => {
    const loadData = async () => {
      await tf.ready();
      setLoadingProgress(10);
      
      // Check GPU availability
      const backend = tf.getBackend();
      const hasGpu = backend === 'webgl' || backend === 'webgpu';
      setGpuAvailable(hasGpu);
      setUseGpu(hasGpu);
      console.log(`TensorFlow.js backend: ${backend}, GPU available: ${hasGpu}`);
      
      try {
        // Load training samples based on dataAmount (55000 max) and proportional test samples
        const trainSize = Math.round(55000 * dataAmount);
        const testSize = Math.round(10000 * dataAmount);
        const data = await loadMnistSubset(trainSize, testSize, 42);
        dataRef.current = data;
        setDataLoaded(true);
        setLoadingProgress(100);
        console.log(`MNIST data loaded: ${trainSize} training, ${testSize} test samples`);
      } catch (error) {
        console.error('Failed to load MNIST data:', error);
        // Fallback to synthetic data
        const NUM_TRAIN = 5000;
        const NUM_TEST = 1000;
        
        dataRef.current = {
          trainImages: tf.randomUniform([NUM_TRAIN, 784], 0, 1) as tf.Tensor2D,
          trainLabels: tf.oneHot(tf.randomUniform([NUM_TRAIN], 0, 10, 'int32'), 10).toFloat() as tf.Tensor2D,
          testImages: tf.randomUniform([NUM_TEST, 784], 0, 1) as tf.Tensor2D,
          testLabels: tf.oneHot(tf.randomUniform([NUM_TEST], 0, 10, 'int32'), 10).toFloat() as tf.Tensor2D,
        };
        setDataLoaded(true);
        setLoadingProgress(100);
      }
    };
    
    loadData();
    
    return () => {
      if (dataRef.current) {
        dataRef.current.trainImages.dispose();
        dataRef.current.trainLabels.dispose();
        dataRef.current.testImages.dispose();
        dataRef.current.testLabels.dispose();
      }
    };
  }, [dataAmount]);
  
  // Create dense model with better architecture
  const createDenseModel = useCallback(() => {
    const model = tf.sequential();
    const layers = [784, ...denseLayers, 10];
    
    for (let i = 1; i < layers.length; i++) {
      const isLast = i === layers.length - 1;
      
      model.add(tf.layers.dense({
        units: layers[i],
        activation: isLast ? 'softmax' : activation,
        inputShape: i === 1 ? [784] : undefined,
        kernelInitializer: 'heNormal',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      }));
      
      // Add dropout after hidden layers for regularization
      if (!isLast && layers[i] > 32) {
        model.add(tf.layers.dropout({ rate: 0.2 }));
      }
    }
    
    return model;
  }, [denseLayers, activation]);
  
  // Create CNN model with better architecture
  const createCNNModel = useCallback(() => {
    const model = tf.sequential();
    
    model.add(tf.layers.reshape({
      targetShape: [28, 28, 1],
      inputShape: [784],
    }));
    
    // First conv block
    model.add(tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      activation: activation,
      kernelInitializer: 'heNormal',
      padding: 'same',
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      activation: activation,
      kernelInitializer: 'heNormal',
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.dropout({ rate: 0.25 }));
    
    // Second conv block
    model.add(tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: activation,
      kernelInitializer: 'heNormal',
      padding: 'same',
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: activation,
      kernelInitializer: 'heNormal',
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.dropout({ rate: 0.25 }));
    
    // Dense layers
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({
      units: 256,
      activation: activation,
      kernelInitializer: 'heNormal',
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.5 }));
    
    model.add(tf.layers.dense({
      units: 10,
      activation: 'softmax',
    }));
    
    return model;
  }, [activation]);
  
  // Train the model
  const train = useCallback(async () => {
    if (trainingRef.current || !dataRef.current) return;
    
    trainingRef.current = true;
    setIsTraining(true);
    resetTrainingStats();
    
    // Dispose old model
    if (modelRef.current) {
      modelRef.current.dispose();
    }
    
    // Create new model
    const model = networkMode === 'dense' ? createDenseModel() : createCNNModel();
    
    // Get optimizer with appropriate learning rate
    let opt: tf.Optimizer;
    const lr = learningRate;
    switch (optimizer) {
      case 'sgd':
        opt = tf.train.sgd(lr);
        break;
      case 'rmsprop':
        opt = tf.train.rmsprop(lr);
        break;
      default:
        opt = tf.train.adam(lr);
    }
    
    model.compile({
      optimizer: opt,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
    
    modelRef.current = model;
    
    const startTime = Date.now();
    
    try {
      await model.fit(dataRef.current.trainImages, dataRef.current.trainLabels, {
        epochs,
        batchSize,
        validationData: [dataRef.current.testImages, dataRef.current.testLabels],
        shuffle: true,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            if (!trainingRef.current) {
              model.stopTraining = true;
              return;
            }
            
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            
            setTrainingStats({
              loss: logs?.loss ?? 0,
              accuracy: logs?.acc ?? 0,
              valLoss: logs?.val_loss ?? 0,
              valAccuracy: logs?.val_acc ?? 0,
              currentEpoch: epoch + 1,
              totalEpochs: epochs,
              trainingTime: elapsed,
            });
            
            await tf.nextFrame();
          },
          onBatchEnd: async () => {
            if (!trainingRef.current) {
              model.stopTraining = true;
            }
            await tf.nextFrame();
          },
        },
      });
      
      if (trainingRef.current) {
        setModelReady(true);
      }
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      trainingRef.current = false;
      setIsTraining(false);
    }
  }, [
    networkMode,
    createDenseModel,
    createCNNModel,
    epochs,
    batchSize,
    learningRate,
    optimizer,
    setIsTraining,
    setTrainingStats,
    resetTrainingStats,
    setModelReady,
  ]);
  
  // Stop training
  const stopTraining = useCallback(() => {
    trainingRef.current = false;
    setIsTraining(false);
  }, [setIsTraining]);
  
  // Toggle training
  const toggleTraining = useCallback(() => {
    if (trainingRef.current) {
      stopTraining();
    } else {
      train();
    }
  }, [train, stopTraining]);
  
  // Predict digit
  const predict = useCallback(async (imageData: Float32Array) => {
    if (!modelRef.current) {
      // Demo prediction when no model trained
      const probs = Array.from({ length: 10 }, () => Math.random() * 0.1);
      probs[Math.floor(Math.random() * 10)] = 0.5 + Math.random() * 0.5;
      const sum = probs.reduce((a, b) => a + b, 0);
      const normalized = probs.map(p => p / sum);
      const maxIdx = normalized.indexOf(Math.max(...normalized));
      
      setPrediction({
        digit: maxIdx,
        confidence: normalized[maxIdx],
        probabilities: normalized,
      });
      return;
    }
    
    const input = tf.tensor2d(imageData, [1, 784]);
    const prediction = modelRef.current.predict(input) as tf.Tensor;
    const probabilities = await prediction.data();
    const probArray = Array.from(probabilities);
    const maxIdx = probArray.indexOf(Math.max(...probArray));
    
    setPrediction({
      digit: maxIdx,
      confidence: probArray[maxIdx],
      probabilities: probArray,
    });
    
    input.dispose();
    prediction.dispose();
  }, [setPrediction]);
  
  // Reset everything
  const reset = useCallback(() => {
    stopTraining();
    
    if (modelRef.current) {
      modelRef.current.dispose();
      modelRef.current = null;
    }
    
    resetTrainingStats();
    setPrediction(null);
    setModelReady(false);
  }, [stopTraining, resetTrainingStats, setPrediction, setModelReady]);
  
  // Toggle GPU/CPU backend
  const toggleGpu = useCallback(async () => {
    if (!gpuAvailable) return;
    
    const newUseGpu = !useGpu;
    setUseGpu(newUseGpu);
    
    try {
      if (newUseGpu) {
        await tf.setBackend('webgl');
      } else {
        await tf.setBackend('cpu');
      }
      await tf.ready();
      console.log(`Switched to ${tf.getBackend()} backend`);
    } catch (error) {
      console.error('Failed to switch backend:', error);
      setUseGpu(!newUseGpu); // Revert on failure
    }
  }, [gpuAvailable, useGpu]);

  return {
    train,
    stopTraining,
    toggleTraining,
    predict,
    reset,
    dataLoaded,
    loadingProgress,
    gpuAvailable,
    useGpu,
    toggleGpu,
  };
}
