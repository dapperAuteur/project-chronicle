// src/components/TaskItem.tsx
import { Task } from '@/types/task'; // Import the type we just created

interface TaskItemProps {
  task: Task;
}

// Notice how we're using the interface to type the props
export default function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="bg-white/10 p-4 rounded-lg flex justify-between items-center">
      <div>
        <h3 className="font-bold">{task.name}</h3>
        <p className="text-sm text-gray-400">{task.category}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold">{task.pomodorosCompleted} Pomodoros</p>
        <span className="text-xs px-2 py-1 bg-gray-600 rounded-full">{task.priority}</span>
      </div>
    </div>
  );
}