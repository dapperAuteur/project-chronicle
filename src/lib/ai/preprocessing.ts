// In lib/ai/preprocessing.ts

import * as tf from '@tensorflow/tfjs';
import { Task } from '@/types/task';

// --- 1. Define Mappings for Categorical Data ---

// We convert priority levels into numbers. This is an "ordinal" mapping because
// 'High' is greater than 'Medium', which is greater than 'Low'.
export const PRIORITY_MAP = {
  'Low': 0,
  'Medium': 1,
  'High': 2,
};

// --- 2. Define Functions for Text Processing ---

/**
 * Creates a vocabulary of unique words from all task names and notes.
 * The "vocabulary" is a map where each unique word has its own index number.
 * @param {Task[]} tasks The list of completed tasks.
 * @returns {Map<string, number>} A map of word -> index.
 */
export const createVocabulary = (tasks: Task[]): Map<string, number> => {
  const wordSet = new Set<string>();
  tasks.forEach(task => {
    // Combine name and notes and split into words
    const text = `${task.name.toLowerCase()} ${task.notes?.toLowerCase() || ''}`;
    // Regex to split by space and remove punctuation
    const words = text.split(/\s+/).map(w => w.replace(/[.,!?;:]/g, ''));
    words.forEach(word => {
      if (word) wordSet.add(word); // Add word to the set if it's not empty
    });
  });

  // Convert the set of unique words into a map with indexes
  const vocabulary = new Map<string, number>();
  let index = 0;
  wordSet.forEach(word => {
    vocabulary.set(word, index++);
  });
  return vocabulary;
};

/**
 * Converts a sentence into a "Bag of Words" vector.
 * This vector is an array of 0s and 1s. The length of the array is the size
 * of the entire vocabulary. A 1 at a certain position means that word exists
 * in the sentence.
 * @param {string} text The text to convert (e.g., a task name).
 * @param {Map<string, number>} vocabulary The vocabulary map.
 * @returns {number[]} The numerical vector representation of the text.
 */
export const textToVector = (text: string, vocabulary: Map<string, number>): number[] => {
  const vector = Array(vocabulary.size).fill(0);
  const words = text.toLowerCase().split(/\s+/).map(w => w.replace(/[.,!?;:]/g, ''));
  words.forEach(word => {
    if (vocabulary.has(word)) {
      const index = vocabulary.get(word)!;
      vector[index] = 1; // Mark the word as present
    }
  });
  return vector;
};


// --- 3. Main Function to Convert Tasks to Tensors ---

/**
 * Takes an array of Task objects and converts them into tensors for model training.
 * @param {Task[]} tasks The raw task data.
 * @returns {{features: tf.Tensor2D, labels: tf.Tensor1D, vocabulary: Map<string, number>, categoryMap: Map<string, number>}}
 */
export const tasksToTensor = (tasks: Task[]): {features: tf.Tensor2D, labels: tf.Tensor1D, vocabulary: Map<string, number>, categoryMap: Map<string, number>} => {
  // We dynamically create a mapping for categories found in the data
  const categoryMap = new Map<string, number>();
  tasks.forEach(task => {
    if (!categoryMap.has(task.category)) {
      categoryMap.set(task.category, categoryMap.size);
    }
  });

  const vocabulary = createVocabulary(tasks);

  const features: number[][] = [];
  const labels: number[] = [];

  for (const task of tasks) {
    // A. The 'label' is the correct answer we want the model to learn to predict.
    labels.push(task.pomodorosCompleted);

    // B. The 'features' are the inputs the model will use to make its prediction.
    const textVector = textToVector(`${task.name} ${task.notes || ''}`, vocabulary);
    const categoryVector = Array(categoryMap.size).fill(0);
    categoryVector[categoryMap.get(task.category)!] = 1; // One-hot encode the category
    
    const priorityFeature = PRIORITY_MAP[task.priority];

    features.push([
      priorityFeature,
      ...categoryVector,
      ...textVector
    ]);
  }

  // C. Convert our JavaScript arrays into TensorFlow.js Tensors.
  // Tensors are the fundamental data structure used by the AI model.
  const featureTensor = tf.tensor2d(features);
  const labelTensor = tf.tensor1d(labels);
  
  return {
    features: featureTensor,
    labels: labelTensor,
    vocabulary,
    categoryMap
  };
};