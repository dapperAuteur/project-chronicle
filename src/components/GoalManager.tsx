'use client';

import { useEffect, useState } from 'react';
import { Goal } from '@/types/goal';
import { Milestone } from '@/types/milestone';
import MilestoneItem from './Milestone';

interface GoalManagerProps {
  goals: Goal[];
  activeGoalMilestones: Milestone[];
  progressByGoal: Record<string, number>;
  expandedGoalId: string | null;
  onGoalSave: (goalName: string, deadline: string, goalId?: string) => void;
  onGoalDelete: (goalId: string) => void;
  onGoalArchive: (goalId: string) => void;
  onGoalUnarchive: (goalId: string) => void;
  onMilestoneSave: (milestoneName: string, deadline: string, goalId: string) => void;
  onMilestoneToggle: (milestoneId: string, currentStatus: 'To Do' | 'Complete') => void;
  onMilestoneUpdate: (milestoneId: string, goalId: string, data: { name: string, deadline: string }) => void;
  onMilestoneDelete: (milestoneId: string) => void;
  onMilestoneMove: (milestoneId: string, newGoalId: string, oldGoalId: string) => void;
  onExpandGoal: (goalId: string | null) => void;
  onClose: () => void;
}

export default function GoalManager({
  goals,
  activeGoalMilestones,
  progressByGoal,
  expandedGoalId,
  onGoalSave,
  onGoalDelete,
  onGoalArchive,
  onGoalUnarchive,
  onMilestoneSave,
  onMilestoneToggle,
  onMilestoneUpdate,
  onMilestoneDelete,
  onMilestoneMove,
  onExpandGoal,
  onClose,
}: GoalManagerProps) {
  // Milestones
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDeadline, setNewMilestoneDeadline] = useState('');
  // const [milestoneName, setMilestoneName] = useState('');
  const [milestoneDeadline, setMilestoneDeadline] = useState('');
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  // Goals
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // UI State
  const [showArchived, setShowArchived] = useState(false);
  // Filter goals into active and archived lists
  const activeGoals = goals.filter(g => !g.isArchived);
  const archivedGoals = goals.filter(g => g.isArchived);

  const handleMilestoneUpdate = () => {
    if (editingMilestone && newMilestoneName.trim()) {
      onMilestoneUpdate(editingMilestone.id, editingMilestone.goalId, { 
        name: newMilestoneName, 
        deadline: newMilestoneDeadline 
      });
      setEditingMilestone(null); // Exit editing mode
    }
  };
  
  // Handler for adding a NEW milestone
  const handleAddNewMilestone = (goalId: string) => {
    if (newMilestoneName.trim()) {
      onMilestoneSave(newMilestoneName, newMilestoneDeadline, goalId);
      setNewMilestoneName('');
      setNewMilestoneDeadline('');
    }
  }

  const handleGoalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalName.trim()) {
      onGoalSave(newGoalName, newGoalDeadline, editingGoal?.id);
      setNewGoalName('');
      setNewGoalDeadline('');
      setEditingGoal(null);
    }
  };
  useEffect(() => {
    if (editingGoal) {
      setNewGoalName(editingGoal.name);
      setNewGoalDeadline(editingGoal.deadline || '');
    } else {
      // Clear form when not editing
      setNewGoalName('');
      setNewGoalDeadline('');
    }
  }, [editingGoal]);

  useEffect(() => {
    if (editingMilestone) {
      setNewMilestoneName(editingMilestone.name);
      setNewMilestoneDeadline(editingMilestone.deadline || '');
    } else {
      setNewMilestoneName('');
      setNewMilestoneDeadline('');
    }
  }, [editingMilestone]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Goals & Milestones</h2>

        <form onSubmit={handleGoalFormSubmit} className="mb-6">
          <h3 className="font-bold text-lg mb-2">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New Goal Name"
              className="flex-grow bg-gray-800 p-2 rounded-md border border-gray-700"
              // 5. CONNECT the input to state
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
            />
            <input
              type="date"
              className="bg-gray-800 p-2 rounded-md border border-gray-700"
              // 6. CONNECT the input to state
              value={newGoalDeadline}
              onChange={(e) => setNewGoalDeadline(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold"
            >
              {editingGoal ? 'Update Goal' : 'Save Goal'}
            </button>
            {editingGoal && (
              <button
                type="button"
                onClick={() => setEditingGoal(null)} // Clears the form
                className="bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        
        <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto">
          {activeGoals.map(goal => {
            const progress = progressByGoal[goal.id] || 0;
            return (
            <div key={goal.id} className="bg-white/10 p-3 rounded">
              <div className="flex justify-between items-center">
                <div onClick={() => onExpandGoal(expandedGoalId === goal.id ? null : goal.id)} className="flex-grow cursor-pointer">
                  <p className="font-bold">{goal.name}</p>
                  {goal.deadline && <p className="text-xs text-amber-400">Goal Due: {goal.deadline}</p>}
                </div>
                <button onClick={() => onGoalArchive(goal.id)} className="text-xl ml-2 p-1 hover:bg-white/20 rounded" title="Archive Goal">
                  🗄️
                </button>
                <button onClick={() => onGoalDelete(goal.id)} className="text-xl ml-2 p-1 hover:bg-white/20 rounded" title="Delete Goal">
                  🗑️
                </button>
                <button onClick={() => setEditingGoal(goal)} className="text-xl ml-2 p-1 hover:bg-white/20 rounded" title="Edit Goal">
                  ✏️
                </button>
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
                  <div className="pl-4 mt-4 border-t border-gray-700 pt-3 space-y-2">
                    <h4 className="font-bold text-sm ml-4 mb-2">Milestones:</h4>
                    {activeGoalMilestones.map(milestone => (
                       <MilestoneItem
                          key={milestone.id}
                          milestone={milestone}
                          goal={goal}
                          activeGoals={activeGoals}
                          isEditing={editingMilestone?.id === milestone.id}
                          editingName={newMilestoneName}
                          setEditingName={setNewMilestoneName}
                          editingDeadline={newMilestoneDeadline}
                          setEditingDeadline={setNewMilestoneDeadline}
                          onToggle={onMilestoneToggle}
                          onMilestoneMove={onMilestoneMove}
                          onDelete={onMilestoneDelete}
                          onStartEdit={setEditingMilestone}
                          onCancelEdit={() => setEditingMilestone(null)}
                          onUpdate={handleMilestoneUpdate}
                        />
                    ))}
                    
                    {/* ADD NEW MILESTONE FORM */}
                    {!editingMilestone && (
                       <div className="ml-4 pt-2 space-y-2">
                          <input
                            type="text"
                            value={newMilestoneName}
                            onChange={(e) => setNewMilestoneName(e.target.value)}
                            placeholder="Add new milestone..."
                            className="w-full bg-gray-700 p-2 rounded-md text-sm"
                          />
                          <input
                            type="date"
                            value={newMilestoneDeadline}
                            onChange={(e) => setNewMilestoneDeadline(e.target.value)}
                            className="w-full bg-gray-700 p-2 rounded-md text-sm"
                          />
                          <button onClick={() => handleAddNewMilestone(goal.id)} className="mt-2 w-full text-sm bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold">Add Milestone</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
              
            </div>

          <div>
            {archivedGoals.length > 0 && (
                <div className="mt-6">
                  <button onClick={() => setShowArchived(!showArchived)} className="text-sm text-gray-400 hover:text-white">
                    {showArchived ? '▼ Hide' : '▶ Show'} {archivedGoals.length} Archived Goal(s)
                  </button>
                  {showArchived && (
                    <div className="mt-2 space-y-2">
                      {archivedGoals.map(goal => (
                        <div key={goal.id} className="bg-gray-700 space-y-2 mb-4 max-h-[60vh] overflow-y-auto p-3 rounded-md flex justify-between items-center text-gray-400">
                          <span className="line-through">{goal.name}</span>
                          {/* Optionally add an "Unarchive" button here in the future */}
                          <button onClick={() =>{
                            console.log('goal.id :>> ', goal.id);
                            onGoalUnarchive(goal.id)

                          }} className="text-xl p-1 hover:bg-white/20 rounded" title="Unarchive Goal">🗄️</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
          <button onClick={onClose} className="mt-4 w-full bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold">Close</button>
        </div>
        
        
      </div>
  );
}