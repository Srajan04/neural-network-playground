import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorScheme = 'soft' | 'vibrant' | 'purple';
export type NetworkMode = 'dense' | 'cnn';
export type Activation = 'relu' | 'sigmoid' | 'tanh' | 'elu';
export type Optimizer = 'adam' | 'sgd' | 'rmsprop';
export type CNNViewMode = 'block' | 'neural';

export interface LayerConfig {
  type: 'dense' | 'conv2d' | 'maxpool' | 'flatten';
  units?: number;
  filters?: number;
  kernelSize?: number;
}

interface CNNConfig {
  layers: LayerConfig[];
}

interface TrainingStats {
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  currentEpoch: number;
  totalEpochs: number;
  trainingTime: number;
}

interface Prediction {
  digit: number;
  confidence: number;
  probabilities: number[];
}

interface AppState {
  // Educational Dialog
  showEducationalDialog: boolean;
  hasSeenEducationalDialog: boolean;
  setShowEducationalDialog: (value: boolean) => void;
  setHasSeenEducationalDialog: (value: boolean) => void;

  // Theme
  darkMode: boolean;
  colorScheme: ColorScheme;
  setDarkMode: (value: boolean) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  
  // Network mode
  networkMode: NetworkMode;
  setNetworkMode: (mode: NetworkMode) => void;
  
  // Architecture
  denseLayers: number[];
  cnnLayers: LayerConfig[];
  cnnConfig: CNNConfig;
  dataAmount: number;
  setDenseLayers: (layers: number[]) => void;
  setCnnLayers: (layers: LayerConfig[]) => void;
  setCnnConfig: (config: CNNConfig) => void;
  setDataAmount: (amount: number) => void;
  addDenseLayer: (units: number) => void;
  removeDenseLayer: (index: number) => void;
  updateDenseLayer: (index: number, units: number) => void;
  resetCnnConfig: () => void;
  
  // Hyperparameters
  learningRate: number;
  batchSize: number;
  epochs: number;
  activation: Activation;
  optimizer: Optimizer;
  setLearningRate: (value: number) => void;
  setBatchSize: (value: number) => void;
  setEpochs: (value: number) => void;
  setActivation: (value: Activation) => void;
  setOptimizer: (value: Optimizer) => void;
  
  // Training state
  isTraining: boolean;
  trainingStats: TrainingStats;
  setIsTraining: (value: boolean) => void;
  setTrainingStats: (stats: Partial<TrainingStats>) => void;
  resetTrainingStats: () => void;
  
  // Prediction
  prediction: Prediction | null;
  setPrediction: (prediction: Prediction | null) => void;
  
  // Visualization
  animationsEnabled: boolean;
  setAnimationsEnabled: (value: boolean) => void;
  cnnViewMode: CNNViewMode;
  setCnnViewMode: (mode: CNNViewMode) => void;
  
  // Model ready state
  modelReady: boolean;
  setModelReady: (value: boolean) => void;
}

const defaultCnnConfig: CNNConfig = {
  layers: [
    { type: 'conv2d', filters: 32, kernelSize: 3 },
    { type: 'maxpool' },
    { type: 'conv2d', filters: 64, kernelSize: 3 },
    { type: 'maxpool' },
    { type: 'flatten' },
    { type: 'dense', units: 128 },
  ],
};

const initialTrainingStats: TrainingStats = {
  loss: 0,
  accuracy: 0,
  valLoss: 0,
  valAccuracy: 0,
  currentEpoch: 0,
  totalEpochs: 10,
  trainingTime: 0,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Educational Dialog
      showEducationalDialog: true,
      hasSeenEducationalDialog: false,
      setShowEducationalDialog: (value) => set({ showEducationalDialog: value }),
      setHasSeenEducationalDialog: (value) => set({ hasSeenEducationalDialog: value }),

      // Theme
      darkMode: false,
      colorScheme: 'soft',
      setDarkMode: (value) => set({ darkMode: value }),
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      
      // Network mode
      networkMode: 'dense',
      setNetworkMode: (mode) => set({ networkMode: mode }),
      
      // Architecture
      denseLayers: [128, 64],
      cnnLayers: [
        { type: 'conv2d', filters: 32, kernelSize: 3 },
        { type: 'maxpool' },
        { type: 'conv2d', filters: 64, kernelSize: 3 },
        { type: 'maxpool' },
        { type: 'flatten' },
        { type: 'dense', units: 128 },
      ],
      cnnConfig: defaultCnnConfig,
      dataAmount: 1,
      setDenseLayers: (layers) => set({ denseLayers: layers }),
      setCnnLayers: (layers) => set({ cnnLayers: layers }),
      setCnnConfig: (config) => set({ cnnConfig: config }),
      setDataAmount: (amount) => set({ dataAmount: amount }),
      addDenseLayer: (units) => set((state) => ({ 
        denseLayers: [...state.denseLayers, units] 
      })),
      removeDenseLayer: (index) => set((state) => ({
        denseLayers: state.denseLayers.filter((_, i) => i !== index)
      })),
      updateDenseLayer: (index, units) => set((state) => ({
        denseLayers: state.denseLayers.map((u, i) => i === index ? units : u)
      })),
      resetCnnConfig: () => set({ cnnConfig: defaultCnnConfig }),
      
      // Hyperparameters
      learningRate: 0.001,
      batchSize: 32,
      epochs: 10,
      activation: 'relu',
      optimizer: 'adam',
      setLearningRate: (value) => set({ learningRate: value }),
      setBatchSize: (value) => set({ batchSize: value }),
      setEpochs: (value) => set({ epochs: value }),
      setActivation: (value) => set({ activation: value }),
      setOptimizer: (value) => set({ optimizer: value }),
      
      // Training state
      isTraining: false,
      trainingStats: initialTrainingStats,
      setIsTraining: (value) => set({ isTraining: value }),
      setTrainingStats: (stats) => set((state) => ({
        trainingStats: { ...state.trainingStats, ...stats }
      })),
      resetTrainingStats: () => set({ trainingStats: initialTrainingStats }),
      
      // Prediction
      prediction: null,
      setPrediction: (prediction) => set({ prediction }),
      
      // Visualization
      animationsEnabled: true,
      setAnimationsEnabled: (value) => set({ animationsEnabled: value }),
      cnnViewMode: 'block',
      setCnnViewMode: (mode) => set({ cnnViewMode: mode }),
      
      // Model ready
      modelReady: false,
      setModelReady: (value) => set({ modelReady: value }),
    }),
    {
      name: 'nn-playground-storage',
      partialize: (state) => ({
        hasSeenEducationalDialog: state.hasSeenEducationalDialog,
        darkMode: state.darkMode,
        colorScheme: state.colorScheme,
        networkMode: state.networkMode,
        denseLayers: state.denseLayers,
        cnnConfig: state.cnnConfig,
        dataAmount: state.dataAmount,
        learningRate: state.learningRate,
        batchSize: state.batchSize,
        epochs: state.epochs,
        activation: state.activation,
        optimizer: state.optimizer,
        animationsEnabled: state.animationsEnabled,
        cnnViewMode: state.cnnViewMode,
      }),
    }
  )
);
