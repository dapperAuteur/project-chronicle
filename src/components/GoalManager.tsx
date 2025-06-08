'use client';

import { useState } from 'react';
import { Goal } from '@/types/goal';

interface GoalManagerProps {
  goals: Goal[];
  onSave: (goalName: string, goalId?: string) => void;
  onDelete: (goalId: string) => void;
  onClose: () => void;
}

export default function GoalManager({ goals, onSave, onDelete, onClose }: GoalManagerProps) {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalName, setGoalName] = useState('');

  const handleSave = () => {
    if (goalName.trim()) {
      onSave(goalName, editingGoal?.id);
      setEditingGoal(null);
      setGoalName('');
    }
  };

  const startEditing = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
  }

  const startNew = () => {
    setEditingGoal(null);
    setGoalName('');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800/50 p-4 rounded-lg space-y-4 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Manage Your Goals</h2>

        {/* Goal List */}
        <div className="space-y-2 mb-4">
          {goals.map(goal => (
            <div key={goal.id} className="flex justify-between items-center bg-white/10 p-2 rounded">
              <span>{goal.name}</span>
              <div>
                <button onClick={() => startEditing(goal)} className="text-blue-400 mr-2">✏️</button>
                <button onClick={() => onDelete(goal.id)} className="text-red-400">🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {(goals.length < 3 || editingGoal) && (
          <div className="border-t border-gray-700 pt-4 text-white">
            <h3 className="font-bold mb-2 text-white">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h3>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="E.g., Launch my website"
            />
            <div className="flex gap-4 mt-2">
                <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold text-white">
                    {editingGoal ? 'Update Goal' : 'Save Goal'}
                </button>
                {editingGoal && <button onClick={startNew} className="w-full bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold">New</button>}
            </div>
          </div>
        )}
        {goals.length >= 3 && !editingGoal && (
            <p className="text-sm text-amber-400">You can have a maximum of 3 goals to maintain focus.</p>
        )}

        <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold text-white">Close</button>
      </div>
    </div>
  );
}