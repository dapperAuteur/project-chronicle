export interface Milestone {
  id: string;
  name:string;
  goalId: string; // To link it back to its parent goal
  status: 'To Do' | 'Complete';
  deadline?: string;
}