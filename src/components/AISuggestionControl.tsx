'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types/task';

interface AISuggestionControlProps {
  // We need all completed tasks to check our business rule (>= 10)
  tasks: Task[];
  // This function will be called when the user clicks the button
  onGetEstimate: () => void;
  // Prop to know if the parent is currently fetching a prediction
  isEstimating: boolean;
}

export default function AISuggestionControl({ tasks, onGetEstimate, isEstimating }: AISuggestionControlProps) {
  // State to know if the prediction feature is available
  const [isSuggestionAvailable, setIsSuggestionAvailable] = useState(false);

  // Check if we have enough data to enable the feature
  useEffect(() => {
    // We filter for tasks marked as 'Done' as per your data structure
    const completedTasks = tasks.filter(task => task.status === 'Done');
    if (completedTasks.length >= 10) {
      setIsSuggestionAvailable(true);
    } else {
      setIsSuggestionAvailable(false);
    }
  }, [tasks]); // This effect re-runs whenever the tasks list changes

  if (!isSuggestionAvailable) {
    return (
      <p style={{ fontSize: '0.8rem', color: '#666', padding: '8px 0' }}>
        Complete more tasks to unlock AI estimates.
      </p>
    );
  }

  return (
    <button
      type="button" // Important: prevents form submission
      onClick={onGetEstimate}
      disabled={isEstimating}
      className="text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed px-3 py-1 rounded-md text-white font-semibold transition-colors"
    >
      {isEstimating ? '🤖 Thinking...' : '🤖 Get AI Estimate'}
    </button>
  );
}