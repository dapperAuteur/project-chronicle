import * as tf from '@tensorflow/tfjs';
import { Task } from '@/types/task';
import { tasksToTensor, textToVector, PRIORITY_MAP } from './preprocessing';


const MODEL_STORAGE_PATH = 'localstorage://pomodoro-prediction-model';

/**
 * Defines the architecture of our neural network.
 * A model is essentially a series of layers that transform input data into a prediction.
 * @param {number} inputShape The number of features we're feeding into the model.
 * @returns {tf.Sequential} A compiled TensorFlow.js model.
 */
function createModel(inputShape: number): tf.Sequential {
  const model = tf.sequential();

  // Input Layer + First Hidden Layer:
  // 'Dense' means all neurons in this layer are connected to all neurons in the next.
  // 'inputShape' tells the model what our data looks like.
  // 'relu' (Rectified Linear Unit) is a standard activation function that helps the model learn complex patterns.
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu',
    inputShape: [inputShape],
  }));

  // Second Hidden Layer:
  // Adding more layers allows the model to learn more complex relationships in the data.
  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu',
  }));

  // Output Layer:
  // The final layer has 1 unit because we are predicting a single number (the pomodoro count).
  // It has no activation function, which is standard for regression problems like this.
  model.add(tf.layers.dense({ units: 1 }));

  // Compile the model: This configures the model for training.
  // 'optimizer': The algorithm that drives the learning. 'adam' is a smart and popular choice.
  // 'loss': The function that measures how wrong the model is. 'meanSquaredError' is the standard for regression.
  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError',
  });

  return model;
}

/**
 * Orchestrates the full training process:
 * 1. Preprocesses the data into tensors.
 * 2. Creates the model architecture.
 * 3. Trains (fits) the model on the data.
 * 4. Saves the trained model to local storage.
 * @param {Task[]} tasks The list of completed tasks to train on.
 */
export async function trainAndSaveModel(tasks: Task[]): Promise<void> {
  if (tasks.length < 10) {
    console.log("Not enough data to train the model. Need at least 10 completed tasks.");
    return;
  }

  console.log("Starting model training...");

  // 1. Preprocess the data using the function from Story 3
  const { features, labels, vocabulary, categoryMap } = tasksToTensor(tasks);

  // 2. Create the model
  const inputShape = features.shape[1];
  const model = createModel(inputShape);

  console.log("Model created. Starting training...");

  // 3. Train the model
  await model.fit(features, labels, {
    epochs: 50, // How many times the model sees the entire dataset.
    batchSize: 8, // How many tasks the model looks at before updating its learnings.
    shuffle: true, // Shuffle the data to prevent the model from learning the order.
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: Loss = ${logs?.loss?.toFixed(4)}`);
      }
    }
  });

  console.log("Training complete. Saving model...");

  // 4. Save the model to local storage.
  await model.save(MODEL_STORAGE_PATH);

  // We also need to save the 'vocabulary' and 'categoryMap' because we need
  // them later to make predictions on new data.
  localStorage.setItem('pomo-vocabulary', JSON.stringify(Array.from(vocabulary.entries())));
  localStorage.setItem('pomo-categoryMap', JSON.stringify(Array.from(categoryMap.entries())));

  console.log("Model, vocabulary, and category map saved successfully.");
  
  // Clean up tensors to free up memory
  features.dispose();
  labels.dispose();
}

// --- Add this new function to the end of the file ---

/**
 * Loads a saved model and its metadata to predict the pomodoro count for a new task.
 * @param taskInputs The data for the new task to be predicted.
 * @returns {Promise<number | null>} The predicted number of pomodoros, or null if it fails.
 */
export async function predictPomos(taskInputs: { name: string, notes: string, category: string, priority: 'High' | 'Medium' | 'Low' }): Promise<number | null> {
  // 1. Load the saved vocabulary and category map from local storage.
  const vocabString = localStorage.getItem('pomo-vocabulary');
  const categoryMapString = localStorage.getItem('pomo-categoryMap');

  if (!vocabString || !categoryMapString) {
    console.error("Vocabulary or Category Map not found in local storage. Please train the model first.");
    return null;
  }
  
  const vocabulary = new Map<string, number>(JSON.parse(vocabString));
  const categoryMap = new Map<string, number>(JSON.parse(categoryMapString));

  let model;
  try {
    // 2. Load the saved TensorFlow.js model from local storage.
    model = await tf.loadLayersModel(MODEL_STORAGE_PATH);
  } catch (e) {
    console.error("Could not load the saved model. Please train the model first.", e);
    return null;
  }

  // 3. Preprocess the new task's data into a Tensor in the *exact same way* as the training data.
  const textVector = textToVector(`${taskInputs.name} ${taskInputs.notes}`, vocabulary);

  const categoryVector = Array(categoryMap.size).fill(0);
  const categoryIndex = categoryMap.get(taskInputs.category);
  // Handle case where category might be new and not in the map
  if (categoryIndex !== undefined) {
      categoryVector[categoryIndex] = 1;
  }

  const priorityFeature = PRIORITY_MAP[taskInputs.priority]; // We need PRIORITY_MAP to be exported or redefined here

  const inputTensor = tf.tensor2d([[
    priorityFeature,
    ...categoryVector,
    ...textVector
  ]]);

  // 4. Make the prediction.
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const predictionValue = prediction.dataSync()[0];

  // 5. Clean up tensors to free memory. This is very important!
  model.dispose();
  inputTensor.dispose();
  prediction.dispose();

  // Return the prediction, rounded to the nearest whole number.
  return Math.round(predictionValue);
}
