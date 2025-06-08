export interface Task {
  id: string;
  name: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate?: string;
  pomodorosCompleted: number;
  notes?: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}