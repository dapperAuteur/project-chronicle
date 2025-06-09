'use client';

import { ChangeEvent, FormEvent } from 'react';
import { Goal } from '@/types/goal';
import { Task } from '@/types/task';
import { Milestone } from '@/types/milestone';
import AISuggestionControl from './AISuggestionControl';

interface ControlPanelProps {
  // Focus Props
  goals: Goal[];
  selectedFocusGoalId: string | null;
  onFocusGoalChange: (id: string) => void;
  dailyMission: string;
  onMissionChange: (mission: string) => void;

  // Milestone Props
  milestonesForFocusGoal: Milestone[];
  selectedMilestoneId: string | null;
  onMilestoneChange: (id: string) => void;

  // Timer Props
  minutes: number;
  seconds: number;
  timerIsActive: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  focusDuration: number;
  onFocusDurationChange: (duration: number) => void;
  breakDuration: number;
  onBreakDurationChange: (duration: number) => void;

  // Form Props
  tasks: Task[];
  taskName: string;
  onTaskNameChange: (name: string) => void;
  taskCategory: string;
  onTaskCategoryChange: (e: ChangeEvent<HTMLInputElement>) => void;
  taskPriority: 'High' | 'Medium' | 'Low';
  onTaskPriorityChange: (priority: 'High' | 'Medium' | 'Low') => void;
  taskNotes: string;
  onTaskNotesChange: (notes: string) => void;
  taskDeadline: string;
  onTaskDeadlineChange: (date: string) => void;
  editingTaskId: string | null;
  subtaskParentId: string | null;
  potentialParentTasks: Task[];
  taskParentId: string | null;
  onTaskParentChange: (id: string | null) => void;
  onFormSubmit: (e: FormEvent) => void;
  onCancelEdit: () => void;

  // Pomodoro Estimation Props
  estimatedPomos: number;
  onEstimatedPomosChange: (pomos: number) => void;
  aiPrediction: number | null;

  // AI Estimation
  aiSuggestion: number | null;
  isEstimating: boolean;
  onGetAiEstimate: () => void;
}

export default function ControlPanel({
  goals, selectedFocusGoalId, onFocusGoalChange, dailyMission, onMissionChange,milestonesForFocusGoal, selectedMilestoneId, onMilestoneChange,
  minutes, seconds, timerIsActive, onToggleTimer, onResetTimer,
  focusDuration, onFocusDurationChange, breakDuration, onBreakDurationChange,
  tasks, taskName, onTaskNameChange, taskCategory, onTaskCategoryChange, taskPriority, onTaskPriorityChange,
  taskNotes, onTaskNotesChange, taskDeadline, onTaskDeadlineChange,
  editingTaskId, subtaskParentId, potentialParentTasks,
  taskParentId,
  onTaskParentChange, onFormSubmit, onCancelEdit,estimatedPomos, onEstimatedPomosChange, aiPrediction, aiSuggestion, isEstimating, onGetAiEstimate,
}: ControlPanelProps) {

  const getTaskDepth = (taskId: string, tasksById: Map<string, Task>, depth = 0): number => {
    const task = tasksById.get(taskId);
    if (task && task.parentId) {
      return getTaskDepth(task.parentId, tasksById, depth + 1);
    }
    return depth;
  };
  const tasksById = new Map(tasks.map(task => [task.id, task]));
  return (
    <div className="lg:col-span-1 space-y-8">
      {/* Daily Focus */}
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2 text-white">Daily Focus</h2>
        <div className="bg-gray-800/50 p-4 rounded-lg space-y-4 border border-gray-700">
          <div>
            <label htmlFor="goal-select" className="block text-sm font-bold mb-2 text-gray-300">
              Which goal are you focusing on today?
            </label>
            <select
              id="goal-select"
              value={selectedFocusGoalId || ''}
              onChange={(e) => onFocusGoalChange(e.target.value)}
              className="w-full p-3 rounded-md text-lg bg-gray-800 border border-gray-700"
            >
              <option value="" disabled>-- Select a Goal --</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>{goal.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="mission-input" className="block text-sm font-bold mb-2 text-gray-300">
              What is your specific mission? (Optional)
            </label>
            <input
              id="mission-input"
              type="text"
              placeholder="E.g., Complete the first draft."
              className="w-full p-3 rounded-md text-lg bg-gray-800 border border-gray-700"
              value={dailyMission}
              onChange={(e) => onMissionChange(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Pomodoro Timer */}
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2 text-white">Pomodoro Timer</h2>
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <div className="flex justify-center gap-4 mb-4 text-center">
            <div>
              <label htmlFor="focus-duration" className="block text-sm text-gray-400">Focus (min)</label>
              <input id="focus-duration" type="number" value={focusDuration} onChange={(e) => onFocusDurationChange(Number(e.target.value))} className="w-20 bg-gray-800 p-2 rounded-md border border-gray-700 text-center" disabled={timerIsActive} />
            </div>
            <div>
              <label htmlFor="break-duration" className="block text-sm text-gray-400">Break (min)</label>
              <input id="break-duration" type="number" value={breakDuration} onChange={(e) => onBreakDurationChange(Number(e.target.value))} className="w-20 bg-gray-800 p-2 rounded-md border border-gray-700 text-center" disabled={timerIsActive} />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-8xl font-bold">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</h2>
            <div className="mt-4 space-x-4">
              <button onClick={onToggleTimer} className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold w-24">{timerIsActive ? 'Pause' : 'Start'}</button>
              <button onClick={onResetTimer} className="bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold w-24">Reset</button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Task Form */}
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">
          {editingTaskId ? 'Edit Task' : (subtaskParentId ? 'Add Sub-task' : 'Add New Task')}
        </h2>
        <form onSubmit={onFormSubmit} className="bg-gray-800/50 p-4 rounded-lg flex flex-col gap-4 border border-gray-700">
          <input id="task-name-input" type="text" placeholder="Task Name" value={taskName} onChange={(e) => onTaskNameChange(e.target.value)} className="bg-gray-800 p-2 rounded-md border border-gray-700" />
          {editingTaskId && (
            <div>
              <label htmlFor="parent-task-select" className="text-sm text-gray-400">Parent Task</label>
              <select
                id="parent-task-select"
                value={taskParentId || ''}
                onChange={(e) => onTaskParentChange(e.target.value || null)}
                className="w-full bg-gray-800 p-2 rounded-md border border-gray-700"
              >
                <option value="">-- None (Top-Level Task) --</option>
                {potentialParentTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {'\u00A0'.repeat(getTaskDepth(task.id, tasksById) * 4)}
                    {task.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedFocusGoalId && milestonesForFocusGoal.length > 0 && (
            <div>
              <label htmlFor="milestone-select" className="text-sm text-gray-400">Assign to Milestone (Optional)</label>
              <select
                id="milestone-select"
                value={selectedMilestoneId || ''}
                onChange={(e) => onMilestoneChange(e.target.value)}
                className="w-full bg-gray-800 p-2 rounded-md border border-gray-700"
              >
                <option value="">None</option>
                {milestonesForFocusGoal.map(milestone => (
                  <option key={milestone.id} value={milestone.id}>{milestone.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="estimated-pomos" className="text-sm text-gray-400">Estimated Pomodoros</label>
            <div className="flex items-center gap-2">
              <input
                id="estimated-pomos"
                type="number"
                min="1"
                value={estimatedPomos}
                onChange={(e) => onEstimatedPomosChange(Number(e.target.value))}
                className="w-20 bg-gray-800 p-2 rounded-md border border-gray-700 text-center"
              />
              <AISuggestionControl
                tasks={tasks}
                isEstimating={isEstimating}
                onGetEstimate={onGetAiEstimate}
              />
              {
                aiSuggestion && !isEstimating && (
                  <p className="text-xs text-purple-400 mt-1">
                    🤖 Suggestion: {aiSuggestion} pomodoro(s).
                  </p>
                )
              }
              {/* {aiPrediction && !editingTaskId && (
                <div className="flex items-center gap-2 text-sm text-purple-400">
                  <span>🤖 AI Suggests: {aiPrediction}</span>
                  <button
                    type="button"
                    onClick={() => onEstimatedPomosChange(aiPrediction)}
                    className="text-xs bg-purple-600/50 hover:bg-purple-600 px-2 py-1 rounded-md"
                  >
                    Use
                  </button>
                </div>
              )} */}
            </div>
          </div>
          <input type="text" placeholder="Category" value={taskCategory} onChange={onTaskCategoryChange} className="bg-gray-800 p-2 rounded-md border border-gray-700" />
          <select value={taskPriority} onChange={(e) => onTaskPriorityChange(e.target.value as 'High' | 'Medium' | 'Low')} className="bg-gray-800 p-2 rounded-md border border-gray-700">
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
          <textarea placeholder="Notes (optional)" value={taskNotes} onChange={(e) => onTaskNotesChange(e.target.value)} className="bg-gray-800 p-2 rounded-md border border-gray-700"></textarea>
          <div>
            <label htmlFor="task-deadline" className="text-sm text-gray-400">Deadline</label>
            <input id="task-deadline" type="date" value={taskDeadline} onChange={(e) => onTaskDeadlineChange(e.target.value)} className="w-full bg-gray-800 p-2 rounded-md border border-gray-700" />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="flex-grow bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold">{editingTaskId ? 'Update Task' : 'Add Task'}</button>
            {editingTaskId && (<button type="button" onClick={onCancelEdit} className="bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold">Cancel</button>)}
          </div>
          {subtaskParentId && !editingTaskId && (
            <div className="text-sm text-amber-400 p-2 bg-amber-900/50 rounded-md">
                Adding sub-task to: &quot;{tasks.find(t => t.id === subtaskParentId)?.name}&quot;
                <button type="button" onClick={onCancelEdit} className="ml-2 text-red-400 font-bold">[Cancel]</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
