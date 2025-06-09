'use client';

import { useState, useEffect } from 'react';

// This is our simple, rule-based "model".
// It maps keywords to a predicted number of Pomodoros.
const predictionModel: { [keyword: string]: number } = {
  // Quick tasks: 1 Pomodoro
  'call': 1, 'email': 1, 'reply': 1, 'message': 1, 'schedule': 1, 'update': 1,
  // Medium tasks: 2 Pomodoros
  'write': 2, 'review': 2, 'research': 2, 'plan': 2, 'debug': 2, 'test': 2,
  // Longer tasks: 3 Pomodoros
  'design': 3, 'develop': 3, 'create': 3, 'build': 3, 'presentation': 3,
  // Epic tasks: 4+ Pomodoros
  'strategy': 4, 'architecture': 4, 'launch': 5,
};

interface UsePredictionProps {
  taskName: string;
}

export function usePrediction({ taskName }: UsePredictionProps) {
  const [prediction, setPrediction] = useState<number | null>(null);

  useEffect(() => {
    const lowerCaseTaskName = taskName.toLowerCase();
    
    // If the task name is empty, don't make a prediction.
    if (!lowerCaseTaskName.trim()) {
      setPrediction(null);
      return;
    }

    let bestGuess = 1; // Default to 1 Pomodoro
    let found = false;

    // Find the keyword that matches and set the prediction
    for (const keyword in predictionModel) {
      if (lowerCaseTaskName.includes(keyword)) {
        bestGuess = predictionModel[keyword];
        found = true;
        break; // Use the first keyword found
      }
    }
    
    setPrediction(found ? bestGuess : null);

  }, [taskName]); // Re-run the prediction whenever the task name changes

  return { prediction };
}
