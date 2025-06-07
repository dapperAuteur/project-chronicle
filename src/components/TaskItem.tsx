// src/components/TaskItem.tsx
import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  isActive: boolean;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

// Notice how we're using the interface to type the props
export default function TaskItem({
  task,
  isSelected,
  isActive,
  onClick,
  onDelete,
  onToggleStatus
}: TaskItemProps) {
  const containerClasses = `
    bg-white/10 p-4 rounded-lg flex justify-between items-center cursor-pointer
    ${isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-white/20'}
  `;

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStatus(task.id);
  };
  const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Stop the click from bubbling up to the parent div
      onDelete(task.id);
    };
  return (
    <div
      className={containerClasses}
      onClick={() => onClick(task.id)}>
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={task.status === 'Done'}
          onChange={handleToggleClick} // We'll reuse the click handler logic
          className="w-5 h-5 rounded accent-blue-500"
        />
        <button 
          onClick={handleDeleteClick}
          className="text-red-500 hover:text-red-400"
          aria-label={`Delete task ${task.name}`}
        >
          🗑️ {/* Simple trash can emoji for now */}
        </button>
        <div>
          <h3 className={`font-bold ${task.status === 'Done' ? 'line-through text-gray-500' : ''}`}>
            {task.name}
          </h3>
          <p className="text-sm text-gray-400">{task.category}</p>
        </div>
      </div>
      <div className="text-right">
        {isSelected && isActive && (
           <span className="text-xs text-blue-400 mr-2">Running</span>
        )}
        <p className="font-semibold">{task.pomodorosCompleted} Pomodoros</p>
        <span className="text-xs px-2 py-1 bg-gray-600 rounded-full">{task.priority}</span>
      </div>
    </div>
  );
}