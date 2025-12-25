import * as tf from '@tensorflow/tfjs';

const IMAGE_SIZE = 784;
const NUM_CLASSES = 10;
const NUM_DATASET_ELEMENTS = 65000;
const NUM_TRAIN_ELEMENTS = 55000;
const NUM_TEST_ELEMENTS = 10000;

const MNIST_IMAGES_SPRITE_PATH =
  'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png';
const MNIST_LABELS_PATH =
  'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8';

// Deterministic RNG (Mulberry32) for reproducible shuffles
function createRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledIndices(length: number, seed: number): Int32Array {
  const rng = createRng(seed);
  const arr = new Int32Array(length);
  for (let i = 0; i < length; i++) arr[i] = i;
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export interface MnistData {
  trainImages: tf.Tensor2D;
  trainLabels: tf.Tensor2D;
  testImages: tf.Tensor2D;
  testLabels: tf.Tensor2D;
}

export async function loadMnistData(): Promise<MnistData> {
  // Load images
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  const imgRequest = new Promise<Float32Array>((resolve, reject) => {
    img.crossOrigin = '';
    img.onload = () => {
      img.width = img.naturalWidth;
      img.height = img.naturalHeight;

      const datasetBytesBuffer = new ArrayBuffer(
        NUM_DATASET_ELEMENTS * IMAGE_SIZE * 4
      );

      const chunkSize = 5000;
      canvas.width = img.width;
      canvas.height = chunkSize;

      for (let i = 0; i < NUM_DATASET_ELEMENTS / chunkSize; i++) {
        const datasetBytesView = new Float32Array(
          datasetBytesBuffer,
          i * IMAGE_SIZE * chunkSize * 4,
          IMAGE_SIZE * chunkSize
        );
        ctx.drawImage(
          img,
          0,
          i * chunkSize,
          img.width,
          chunkSize,
          0,
          0,
          img.width,
          chunkSize
        );

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let j = 0; j < imageData.data.length / 4; j++) {
          // All channels hold the same value since the image is grayscale
          datasetBytesView[j] = imageData.data[j * 4] / 255;
        }
      }
      resolve(new Float32Array(datasetBytesBuffer));
    };
    img.onerror = reject;
    img.src = MNIST_IMAGES_SPRITE_PATH;
  });

  // Load labels (one-hot encoded in source file)
  const labelsRequest = fetch(MNIST_LABELS_PATH)
    .then((response) => response.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  const [datasetImages, rawDatasetLabels] = await Promise.all([
    imgRequest,
    labelsRequest,
  ]);

  // Decode one-hot labels into class indices
  const datasetLabels = new Uint8Array(NUM_DATASET_ELEMENTS);
  for (let i = 0; i < NUM_DATASET_ELEMENTS; i++) {
    let label = 0;
    const offset = i * NUM_CLASSES;
    for (let j = 0; j < NUM_CLASSES; j++) {
      if (rawDatasetLabels[offset + j] === 1) {
        label = j;
        break;
      }
    }
    datasetLabels[i] = label;
  }

  // Split into train and test
  const trainImages = datasetImages.slice(0, IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
  const testImages = datasetImages.slice(IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
  const trainLabels = datasetLabels.slice(0, NUM_TRAIN_ELEMENTS);
  const testLabels = datasetLabels.slice(NUM_TRAIN_ELEMENTS);

  return {
    trainImages: tf.tensor2d(trainImages, [NUM_TRAIN_ELEMENTS, IMAGE_SIZE]),
    trainLabels: tf.oneHot(tf.tensor1d(trainLabels, 'int32'), NUM_CLASSES).toFloat() as tf.Tensor2D,
    testImages: tf.tensor2d(testImages, [NUM_TEST_ELEMENTS, IMAGE_SIZE]),
    testLabels: tf.oneHot(tf.tensor1d(testLabels, 'int32'), NUM_CLASSES).toFloat() as tf.Tensor2D,
  };
}

// Smaller subset for faster training in playground
export async function loadMnistSubset(
  trainSize: number = 10000,
  testSize: number = 2000,
  seed: number = 42
): Promise<MnistData> {
  const fullData = await loadMnistData();

  const trainPerm = shuffledIndices(NUM_TRAIN_ELEMENTS, seed);
  const testPerm = shuffledIndices(NUM_TEST_ELEMENTS, seed + 1);

  const trainIdx = tf.tensor1d(trainPerm.slice(0, trainSize), 'int32');
  const testIdx = tf.tensor1d(testPerm.slice(0, testSize), 'int32');

  const trainImages = tf.tidy(() => fullData.trainImages.gather(trainIdx)) as tf.Tensor2D;
  const trainLabels = tf.tidy(() => fullData.trainLabels.gather(trainIdx)) as tf.Tensor2D;
  const testImages = tf.tidy(() => fullData.testImages.gather(testIdx)) as tf.Tensor2D;
  const testLabels = tf.tidy(() => fullData.testLabels.gather(testIdx)) as tf.Tensor2D;

  trainIdx.dispose();
  testIdx.dispose();
  
  // Dispose full data
  fullData.trainImages.dispose();
  fullData.trainLabels.dispose();
  fullData.testImages.dispose();
  fullData.testLabels.dispose();
  
  return { trainImages, trainLabels, testImages, testLabels };
}
