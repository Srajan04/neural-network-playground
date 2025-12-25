# Neural Network Playground

An interactive 3D visualization platform for understanding neural networks, built with Next.js, TensorFlow.js, and Three.js.

## Overview

Neural Network Playground is an educational tool designed to help users understand how neural networks work through interactive visualization. Users can draw digits, train models in real-time, and observe the network architecture in 3D.

## Features

- Real-time neural network training in the browser using TensorFlow.js
- Interactive 3D visualization of Dense and CNN architectures
- GPU-accelerated training with WebGL backend
- Draw digits and see predictions in real-time
- Customizable network architecture (layers, neurons, filters)
- Adjustable hyperparameters (learning rate, batch size, epochs)
- Support for multiple optimizers (Adam, SGD, RMSprop)
- Dark and light theme support
- Multiple color schemes for visualization

## Tech Stack

- Next.js 14 (React Framework)
- TypeScript
- TensorFlow.js (Machine Learning)
- Three.js with React Three Fiber (3D Visualization)
- Zustand (State Management)
- Framer Motion (Animations)
- Tailwind CSS (Styling)

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/neural-network-playground.git
cd neural-network-playground
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. Select a network type (Dense or CNN) from the header
2. Configure the network architecture using the right panel
3. Adjust hyperparameters as needed
4. Click "Train" to start training on the MNIST dataset
5. Draw a digit on the canvas and click "Predict" to test the model
6. Use mouse controls to explore the 3D visualization:
   - Left-drag: Rotate
   - Right-drag: Pan
   - Scroll: Zoom

## Project Structure

```
src/
  app/              # Next.js app router
  components/
    DrawingCanvas/  # Digit drawing interface
    Header/         # Navigation and controls
    NetworkVisualization/  # 3D network rendering
    Panels/         # Left and right configuration panels
    ui/             # Reusable UI components
    Viewport/       # 3D viewport and overlays
  hooks/            # Custom React hooks
  lib/              # Utilities and MNIST data loading
  store/            # Zustand state management
```

## Educational Purpose

This project is created solely for educational purposes to help students, developers, and enthusiasts understand the inner workings of neural networks through interactive visualization.

## Contributing

Contributions are welcome and encouraged. If you would like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your contributions align with the educational goals of this project.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License (CC BY-NC-ND 4.0).

You are free to:
- View and learn from the source code
- Share the project with proper attribution

You may not:
- Use the code for commercial purposes
- Distribute modified versions of the code
- Copy substantial portions of the code for other projects

See the [LICENSE](LICENSE) file for full details.

## Acknowledgments

- MNIST Dataset provided by Yann LeCun and Corinna Cortes
- TensorFlow.js team for the browser-based ML framework
- Three.js and React Three Fiber communities

## Author

Created for educational demonstration of neural network concepts.

---

For questions or feedback, please open an issue on the repository.
