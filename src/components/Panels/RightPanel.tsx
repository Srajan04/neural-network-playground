'use client';

import { motion } from 'framer-motion';
import { Plus, Trash2, RotateCcw, ArrowUp, ArrowDown, Layers } from 'lucide-react';
import { Slider } from '@/components/ui/Slider';
import { Select } from '@/components/ui/Select';
import { useStore } from '@/store/useStore';
import type { LayerConfig } from '@/store/useStore';

export function RightPanel() {
  const {
    networkMode,
    denseLayers,
    addDenseLayer,
    removeDenseLayer,
    updateDenseLayer,
    cnnConfig,
    setCnnConfig,
    resetCnnConfig,
    cnnViewMode,
    setCnnViewMode,
    learningRate,
    setLearningRate,
    batchSize,
    setBatchSize,
    epochs,
    setEpochs,
    activation,
    setActivation,
    optimizer,
    setOptimizer,
    trainingStats,
  } = useStore();
  
  return (
    <div className="h-full bg-card dark:bg-black/20 border-l border-border flex flex-col overflow-hidden theme-transition">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-purple">
        {/* Architecture Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-5 border-b border-border bg-pastel-blue/30 dark:bg-black/0"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
            Network Architecture
          </h2>
          
          {networkMode === 'dense' ? (
            <div className="space-y-2">
              {/* Input layer */}
              <div className="flex items-center gap-2 p-2.5 bg-card rounded-md shadow-soft">
                <span className="text-xs font-semibold text-accent bg-pastel-purple dark:bg-accent/20 px-2 py-0.5 rounded">
                  Input
                </span>
                <span className="text-sm text-muted flex-1">784 (28×28)</span>
              </div>
              
              {/* Hidden layers */}
              {denseLayers.map((units, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 p-2.5 bg-card rounded-md shadow-soft"
                >
                  <span className="text-xs font-semibold text-pink-500 bg-pastel-pink dark:bg-pink-500/20 px-2 py-0.5 rounded">
                    Dense
                  </span>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => updateDenseLayer(index, parseInt(e.target.value) || 32)}
                    min={1}
                    max={512}
                    className="w-16 px-2 py-1 text-sm text-center bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <button
                    onClick={() => removeDenseLayer(index)}
                    disabled={denseLayers.length <= 1}
                    className="ml-auto w-6 h-6 flex items-center justify-center rounded bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </motion.div>
              ))}
              
              {/* Output layer */}
              <div className="flex items-center gap-2 p-2.5 bg-card rounded-md shadow-soft">
                <span className="text-xs font-semibold text-amber-500 bg-pastel-yellow dark:bg-amber-500/20 px-2 py-0.5 rounded">
                  Output
                </span>
                <span className="text-sm text-muted flex-1">10 (digits)</span>
              </div>
              
              {/* Add layer button */}
              <button
                onClick={() => addDenseLayer(64)}
                className="w-full p-2.5 border-2 border-dashed border-border rounded-md text-sm text-muted hover:border-accent hover:text-accent hover:bg-pastel-purple/30 transition-all"
              >
                <Plus size={14} className="inline mr-2" />
                Add Hidden Layer
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* View Mode Toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setCnnViewMode('block')}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                    cnnViewMode === 'block'
                      ? 'bg-accent text-white'
                      : 'bg-card text-muted hover:bg-border'
                  }`}
                >
                  <Layers size={12} />
                  Block
                </button>
                <button
                  onClick={() => setCnnViewMode('neural')}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                    cnnViewMode === 'neural'
                      ? 'bg-accent text-white'
                      : 'bg-card text-muted hover:bg-border'
                  }`}
                >
                  <Layers size={12} />
                  Neural
                </button>
              </div>

              {/* CNN Layer editor */}
              <div className="space-y-2">
                {cnnConfig.layers.map((layer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-2 p-2.5 bg-card rounded-md shadow-soft"
                  >
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      layer.type === 'conv2d' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      layer.type === 'maxpool' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      layer.type === 'flatten' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                      'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                    }`}>
                      {layer.type === 'conv2d' ? 'Conv2D' :
                       layer.type === 'maxpool' ? 'MaxPool' :
                       layer.type === 'flatten' ? 'Flatten' :
                       'Dense'}
                    </span>
                    
                    {/* Filters input for Conv2D */}
                    {layer.type === 'conv2d' && (
                      <>
                        <label className="text-xs text-muted">Filters:</label>
                        <input
                          type="number"
                          value={layer.filters || 32}
                          onChange={(e) => {
                            const newLayers = [...cnnConfig.layers];
                            newLayers[index] = { ...layer, filters: parseInt(e.target.value) || 32 };
                            setCnnConfig({ layers: newLayers });
                          }}
                          min={1}
                          max={256}
                          className="w-14 px-2 py-1 text-xs text-center bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent/50"
                        />
                      </>
                    )}
                    
                    {/* Units input for Dense */}
                    {layer.type === 'dense' && (
                      <>
                        <label className="text-xs text-muted">Units:</label>
                        <input
                          type="number"
                          value={layer.units || 128}
                          onChange={(e) => {
                            const newLayers = [...cnnConfig.layers];
                            newLayers[index] = { ...layer, units: parseInt(e.target.value) || 128 };
                            setCnnConfig({ layers: newLayers });
                          }}
                          min={1}
                          max={512}
                          className="w-14 px-2 py-1 text-xs text-center bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent/50"
                        />
                      </>
                    )}
                    
                    {/* Move buttons */}
                    <div className="ml-auto flex gap-1">
                      <button
                        onClick={() => {
                          if (index > 0) {
                            const newLayers = [...cnnConfig.layers];
                            [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
                            setCnnConfig({ layers: newLayers });
                          }
                        }}
                        disabled={index === 0}
                        className="w-6 h-6 flex items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (index < cnnConfig.layers.length - 1) {
                            const newLayers = [...cnnConfig.layers];
                            [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
                            setCnnConfig({ layers: newLayers });
                          }
                        }}
                        disabled={index === cnnConfig.layers.length - 1}
                        className="w-6 h-6 flex items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => {
                        const newLayers = cnnConfig.layers.filter((_, i) => i !== index);
                        setCnnConfig({ layers: newLayers });
                      }}
                      disabled={cnnConfig.layers.length <= 2}
                      className="w-6 h-6 flex items-center justify-center rounded bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
              
              {/* Add layer buttons */}
              <div className="grid grid-cols-2 gap-2">
                <AddLayerButton
                  type="conv2d"
                  label="Conv2D"
                  onClick={() => {
                    setCnnConfig({
                      layers: [...cnnConfig.layers, { type: 'conv2d', filters: 32, kernelSize: 3 }]
                    });
                  }}
                />
                <AddLayerButton
                  type="maxpool"
                  label="MaxPool"
                  onClick={() => {
                    setCnnConfig({
                      layers: [...cnnConfig.layers, { type: 'maxpool' }]
                    });
                  }}
                />
                <AddLayerButton
                  type="flatten"
                  label="Flatten"
                  onClick={() => {
                    setCnnConfig({
                      layers: [...cnnConfig.layers, { type: 'flatten' }]
                    });
                  }}
                />
                <AddLayerButton
                  type="dense"
                  label="Dense"
                  onClick={() => {
                    setCnnConfig({
                      layers: [...cnnConfig.layers, { type: 'dense', units: 128 }]
                    });
                  }}
                />
              </div>
              
              {/* Reset button */}
              <button
                onClick={resetCnnConfig}
                className="w-full p-2.5 border-2 border-dashed border-border rounded-md text-sm text-muted hover:border-accent hover:text-accent hover:bg-pastel-purple/30 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                Reset to Default
              </button>
            </div>
          )}
        </motion.div>
        
        {/* Hyperparameters Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-pastel-yellow/30 dark:bg-black/0 border-b border-border space-y-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
            Hyperparameters
          </h2>
          
          <Slider
            label="Learning Rate"
            value={Math.log10(learningRate)}
            displayValue={learningRate.toFixed(4)}
            min={-4}
            max={-1}
            step={0.1}
            onChange={(v) => setLearningRate(Math.pow(10, v))}
          />
          
          <Slider
            label="Batch Size"
            value={Math.log2(batchSize)}
            displayValue={batchSize.toString()}
            min={4}
            max={8}
            step={1}
            onChange={(v) => setBatchSize(Math.pow(2, v))}
          />
          
          <Slider
            label="Epochs"
            value={epochs}
            displayValue={epochs.toString()}
            min={1}
            max={50}
            step={1}
            onChange={setEpochs}
          />
          
          <Select
            label="Activation"
            value={activation}
            options={[
              { value: 'relu', label: 'ReLU' },
              { value: 'sigmoid', label: 'Sigmoid' },
              { value: 'tanh', label: 'Tanh' },
              { value: 'elu', label: 'ELU' },
            ]}
            onChange={(v) => setActivation(v as typeof activation)}
          />
          
          <Select
            label="Optimizer"
            value={optimizer}
            options={[
              { value: 'adam', label: 'Adam' },
              { value: 'sgd', label: 'SGD' },
              { value: 'rmsprop', label: 'RMSprop' },
            ]}
            onChange={(v) => setOptimizer(v as typeof optimizer)}
          />
        </motion.div>
        
        {/* Training Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-5 dark:bg-black/0"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
            Training Statistics
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Loss" value={trainingStats.loss ? trainingStats.loss.toFixed(4) : '-'} />
            <StatCard label="Accuracy" value={trainingStats.accuracy ? `${(trainingStats.accuracy * 100).toFixed(1)}%` : '-'} />
            <StatCard label="Val Loss" value={trainingStats.valLoss ? trainingStats.valLoss.toFixed(4) : '-'} />
            <StatCard label="Val Acc" value={trainingStats.valAccuracy ? `${(trainingStats.valAccuracy * 100).toFixed(1)}%` : '-'} />
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 p-3 bg-card rounded-md shadow-soft">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-medium">Progress</span>
              <span className="text-accent font-semibold">
                {trainingStats.totalEpochs > 0 
                  ? `${Math.round((trainingStats.currentEpoch / trainingStats.totalEpochs) * 100)}%`
                  : '0%'}
              </span>
            </div>
            
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: trainingStats.totalEpochs > 0 
                    ? `${(trainingStats.currentEpoch / trainingStats.totalEpochs) * 100}%`
                    : '0%'
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="flex justify-between mt-2 text-xs text-muted">
              <span>Epoch {trainingStats.currentEpoch} / {trainingStats.totalEpochs}</span>
              <span>{formatTime(trainingStats.trainingTime)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-card rounded-md shadow-soft">
      <div className="text-[10px] uppercase tracking-wide text-muted mb-1">{label}</div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function AddLayerButton({ 
  type, 
  label, 
  onClick 
}: { 
  type: 'conv2d' | 'maxpool' | 'flatten' | 'dense'; 
  label: string; 
  onClick: () => void;
}) {
  const colorClasses = {
    conv2d: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800',
    maxpool: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800',
    flatten: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800',
    dense: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50 border-pink-200 dark:border-pink-800',
  };

  return (
    <button
      onClick={onClick}
      className={`p-2.5 border-2 rounded-md text-xs font-medium transition-colors ${colorClasses[type]}`}
    >
      <Plus size={12} className="inline mr-1" />
      {label}
    </button>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
