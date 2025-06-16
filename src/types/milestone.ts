import { Goal } from "./goal";

export interface Milestone {
  id: string;
  name:string;
  goalId: string; // To link it back to its parent goal
  status: 'To Do' | 'Complete';
  deadline?: string;
}
 
export interface MilestoneItemProps {
  goal: Goal;
  activeGoals: Goal[];
  milestone: Milestone;
  isEditing: boolean;
  editingName: string;
  setEditingName: (name: string) => void;
  editingDeadline: string;
  setEditingDeadline: (date: string) => void;
  onToggle: (id: string, status: 'To Do' | 'Complete') => void;
  onMilestoneMove: (milestoneId: string, oldGoalId: string, newGoalId: string) => void;
  onDelete: (id: string) => void;
  onStartEdit: (milestone: Milestone) => void;
  onCancelEdit: () => void;
  onUpdate: () => void; // A simplified update handler
}