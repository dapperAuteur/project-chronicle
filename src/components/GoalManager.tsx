'use client';

import { useState } from 'react';
import { Goal } from '@/types/goal';
import { Milestone } from '@/types/milestone';

function MilestoneItem({ milestone, onToggle, onDelete }: { milestone: Milestone, onToggle: (id: string, status: 'To Do' | 'Complete') => void, onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded ml-4">
      <div className="flex items-center gap-2">
        <input 
          type="checkbox"
          checked={milestone.status === 'Complete'}
          onChange={() => onToggle(milestone.id, milestone.status)}
          className="w-4 h-4 rounded accent-blue-500 flex-shrink-0"
        />
        <div>
            <p className={`${milestone.status === 'Complete' ? 'line-through text-gray-400' : ''}`}>{milestone.name}</p>
            {milestone.deadline && <p className="text-xs text-amber-400">Due: {milestone.deadline}</p>}
        </div>
      </div>
      <button onClick={() => onDelete(milestone.id)} className="text-red-500 hover:text-red-400 text-xs">Delete</button>
    </div>
  );
}

interface GoalManagerProps {
  goals: Goal[];
  activeGoalMilestones: Milestone[];
  progressByGoal: Record<string, number>;
  expandedGoalId: string | null;
  onGoalSave: (goalName: string, deadline: string, goalId?: string) => void;
  onGoalDelete: (goalId: string) => void;
  onMilestoneSave: (milestoneName: string, deadline: string, goalId: string) => void;
  onMilestoneToggle: (milestoneId: string, currentStatus: 'To Do' | 'Complete') => void;
  onMilestoneDelete: (milestoneId: string) => void;
  onExpandGoal: (goalId: string | null) => void;
  onClose: () => void;
}

export default function GoalManager({
  goals,
  activeGoalMilestones,
  progressByGoal,
  expandedGoalId,
  onGoalDelete,
  onMilestoneSave,
  onMilestoneToggle,
  onMilestoneDelete,
  onExpandGoal,
  onClose,
}: GoalManagerProps) {
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDeadline, setNewMilestoneDeadline] = useState('');

  const handleMilestoneSave = (goalId: string) => {
    if (newMilestoneName.trim()) {
      onMilestoneSave(newMilestoneName, newMilestoneDeadline, goalId);
      setNewMilestoneName('');
      setNewMilestoneDeadline('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Goals & Milestones</h2>
        
        <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto">
          {goals.map(goal => {
            const progress = progressByGoal[goal.id] || 0;
            return (
            <div key={goal.id} className="bg-white/10 p-3 rounded">
              <div className="flex justify-between items-center">
                <div onClick={() => onExpandGoal(expandedGoalId === goal.id ? null : goal.id)} className="flex-grow cursor-pointer">
                  <p className="font-bold">{goal.name}</p>
                  {goal.deadline && <p className="text-xs text-amber-400">Goal Due: {goal.deadline}</p>}
                </div>
                <button onClick={() => onGoalDelete(goal.id)} className="text-red-500 text-sm">Delete Goal</button>
              </div>

              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-white">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              {/* Expanded View for Milestones */}
              {expandedGoalId === goal.id && (
                <div className="mt-4 border-t border-gray-700 pt-3 space-y-2">
                  <h4 className="font-bold text-sm ml-4 mb-2">Milestones:</h4>
                  {activeGoalMilestones.map(milestone => (
                    <MilestoneItem key={milestone.id} milestone={milestone} onToggle={onMilestoneToggle} onDelete={onMilestoneDelete}/>
                  ))}
                  
                  {/* Add Milestone Form */}
                  <div className="ml-4 pt-2">
                     <input
                        type="text"
                        value={newMilestoneName}
                        onChange={(e) => setNewMilestoneName(e.target.value)}
                        placeholder="New milestone name..."
                        className="w-full bg-gray-700 p-2 rounded-md text-sm mb-2"
                      />
                      <input
                        type="date"
                        value={newMilestoneDeadline}
                        onChange={(e) => setNewMilestoneDeadline(e.target.value)}
                        className="w-full bg-gray-700 p-2 rounded-md text-sm"
                      />
                      <button onClick={() => handleMilestoneSave(goal.id)} className="mt-2 w-full text-sm bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold">Add Milestone</button>
                  </div>
                </div>
              )}
            </div>
          )
          })}
        </div>
        
        <button onClick={onClose} className="mt-4 w-full bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold">Close</button>
      </div>
    </div>
  );
}