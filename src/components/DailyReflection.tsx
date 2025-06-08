'use client';

import { useState, useEffect } from 'react';

// Define the props the component will accept
interface DailyReflectionProps {
  initialReflection: string; // The reflection already saved for today, if any
  isDrafting: boolean; // To show a loading state for the AI button
  onSave: (reflectionText: string) => void;
  onDraft: () => void;
  onClose: () => void;
}

export default function DailyReflection({
  initialReflection,
  isDrafting,
  onSave,
  onDraft,
  onClose,
}: DailyReflectionProps) {
  // State to hold the text inside the textarea, initialized with today's saved reflection
  const [reflectionText, setReflectionText] = useState(initialReflection);

  // This ensures that if the prop updates (e.g., after an AI draft), the text updates
  useEffect(() => {
    setReflectionText(initialReflection);
  }, [initialReflection]);

  const handleSave = () => {
    onSave(reflectionText);
    onClose(); // Close the modal after saving
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Daily Reflection</h2>
        
        <p className="text-sm text-gray-400 mb-4">
          How did today go? What did you accomplish towards your focus? What did you learn?
        </p>

        <label htmlFor="daily-reflection" className="sr-only">Daily Reflection</label>
        <textarea
          id="daily-reflection"
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="Start writing your thoughts here..."
          className="w-full h-48 bg-gray-900 p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
          rows={10}
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            onClick={onDraft}
            disabled={isDrafting}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed p-2 rounded-md font-bold transition-colors"
          >
            {isDrafting ? 'Drafting...' : '✨ Draft Summary with AI'}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold"
          >
            Save Reflection
          </button>
        </div>

        <button onClick={onClose} className="mt-4 w-full bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold">
          Close
        </button>
      </div>
    </div>
  );
}
