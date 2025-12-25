'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Layers, Grid3X3, ExternalLink, BookOpen, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store/useStore';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  details: string[];
  links: { label: string; url: string }[];
}

const sections: Section[] = [
  {
    id: 'nn',
    title: 'What is a Neural Network?',
    icon: <Brain className="w-6 h-6" />,
    description:
      'A Neural Network (NN) is a computational model inspired by the human brain. It consists of interconnected nodes (neurons) organized in layers that process information and learn patterns from data.',
    details: [
      'Input Layer: Receives the raw data (e.g., pixel values of an image)',
      'Hidden Layers: Process and transform the data through weighted connections',
      'Output Layer: Produces the final prediction or classification',
      'Training: The network learns by adjusting weights to minimize prediction errors',
    ],
    links: [
      { label: '3Blue1Brown - Neural Networks', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi' },
      { label: 'Neural Networks - Wikipedia', url: 'https://en.wikipedia.org/wiki/Artificial_neural_network' },
      { label: 'TensorFlow - Neural Network Basics', url: 'https://www.tensorflow.org/guide/keras/sequential_model' },
    ],
  },
  {
    id: 'dense',
    title: 'What is a Dense (Fully Connected) Network?',
    icon: <Layers className="w-6 h-6" />,
    description:
      'A Dense Network, also called a Fully Connected Network, is a type of neural network where every neuron in one layer is connected to every neuron in the next layer. This is the simplest and most fundamental architecture.',
    details: [
      'Each connection has a learnable weight that determines its importance',
      'Great for learning patterns in structured/tabular data',
      'For images, input pixels are "flattened" into a 1D array',
      'Can suffer from too many parameters with large inputs (e.g., high-resolution images)',
    ],
    links: [
      { label: 'Dense Layers - Keras Documentation', url: 'https://keras.io/api/layers/core_layers/dense/' },
      { label: 'Fully Connected Networks Explained', url: 'https://cs231n.github.io/neural-networks-1/' },
      { label: 'MIT Deep Learning Book - MLPs', url: 'https://www.deeplearningbook.org/contents/mlp.html' },
    ],
  },
  {
    id: 'cnn',
    title: 'What is a CNN (Convolutional Neural Network)?',
    icon: <Grid3X3 className="w-6 h-6" />,
    description:
      'A Convolutional Neural Network (CNN) is specifically designed for processing grid-like data such as images. It uses special layers called convolutional layers that can detect features like edges, textures, and shapes.',
    details: [
      'Convolutional Layers: Apply filters to detect local patterns (edges, corners, etc.)',
      'Pooling Layers: Reduce spatial dimensions while retaining important features',
      'Feature Hierarchy: Early layers detect simple patterns, deeper layers detect complex ones',
      'Much more efficient than dense networks for image data due to weight sharing',
    ],
    links: [
      { label: 'CNN Explainer - Interactive Visualization', url: 'https://poloclub.github.io/cnn-explainer/' },
      { label: 'Stanford CS231n - CNNs for Visual Recognition', url: 'https://cs231n.github.io/convolutional-networks/' },
      { label: 'A Guide to Convolution Arithmetic', url: 'https://arxiv.org/abs/1603.07285' },
    ],
  },
  {
    id: 'mnist',
    title: 'What is MNIST?',
    icon: <BookOpen className="w-6 h-6" />,
    description:
      'MNIST (Modified National Institute of Standards and Technology) is a famous dataset of handwritten digits. It\'s often called the "Hello World" of machine learning and is used to benchmark classification algorithms.',
    details: [
      '70,000 images total: 60,000 for training, 10,000 for testing',
      'Each image is 28×28 pixels in grayscale (784 total values)',
      'Labels are digits from 0 to 9',
      'Created in 1998 by Yann LeCun, widely used for educational purposes',
    ],
    links: [
      { label: 'MNIST Database - Yann LeCun', url: 'http://yann.lecun.com/exdb/mnist/' },
      { label: 'MNIST - Wikipedia', url: 'https://en.wikipedia.org/wiki/MNIST_database' },
      { label: 'TensorFlow MNIST Tutorial', url: 'https://www.tensorflow.org/datasets/catalog/mnist' },
    ],
  },
];

export function EducationalDialog() {
  const { showEducationalDialog, setShowEducationalDialog } = useStore();

  return (
    <AnimatePresence>
      {showEducationalDialog && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEducationalDialog(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-[90%] max-w-5xl h-[85vh] bg-card rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col border border-border">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-secondary rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Welcome to Neural Network Playground
                    </h2>
                    <p className="text-sm text-muted">
                      Learn about neural networks and explore the MNIST dataset
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEducationalDialog(false)}
                  className="p-2 rounded-lg hover:bg-border/50 transition-colors text-muted hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid gap-6">
                  {sections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-background rounded-xl p-6 border border-border"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent-secondary/20 rounded-xl flex items-center justify-center text-accent shrink-0">
                          {section.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {section.title}
                          </h3>
                          <p className="text-sm text-muted leading-relaxed mb-4">
                            {section.description}
                          </p>

                          {/* Details */}
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                              Key Points
                            </h4>
                            <ul className="space-y-1.5">
                              {section.details.map((detail, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-muted flex items-start gap-2"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Links */}
                          <div>
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                              Learn More
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {section.links.map((link, i) => (
                                <a
                                  key={i}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 rounded-full hover:bg-accent/20 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Tips Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 bg-gradient-to-r from-accent/10 to-accent-secondary/10 rounded-xl p-6 border border-accent/20"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="text-2xl">🚀</span> Getting Started
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-muted">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-accent">1.</span>
                      <span>Choose between Dense or CNN network architecture in the header</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-accent">2.</span>
                      <span>Adjust hyperparameters like learning rate, batch size, and epochs</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-accent">3.</span>
                      <span>Click "Train" to start training the model on MNIST data</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-accent">4.</span>
                      <span>Draw a digit on the canvas to test the trained model's predictions</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background/50">
                <p className="text-xs text-muted">
                  Click the <HelpCircle className="w-4 h-4 inline mx-1" /> icon in the header anytime to reopen this guide
                </p>
                <Button variant="primary" onClick={() => setShowEducationalDialog(false)}>
                  Close & Start Exploring
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
