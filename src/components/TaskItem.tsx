// src/components/TaskItem.tsx
import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  isActive: boolean;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (id: string) => void;
  onAdjustPomodoros: (id: string, amount: number) => void;
}

// Notice how we're using the interface to type the props
export default function TaskItem({
  task,
  isSelected,
  isActive,
  onClick,
  onDelete,
  onToggleStatus,
  onEdit,
  onAdjustPomodoros
}: TaskItemProps) {
  const containerClasses = `
    bg-white/10 p-4 rounded-lg flex justify-between items-center cursor-pointer
    ${isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-white/20'}
  `;

  const handleIncreasePomos = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdjustPomodoros(task.id, 1);
  };

  const handleDecreasePomos = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Prevent going below zero
    if (task.pomodorosCompleted > 0) {
      onAdjustPomodoros(task.id, -1);
    }
  };
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task.id);
  };
  const handleToggleChange = () => {
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
          // onChange={handleToggleClick} // We'll reuse the click handler logic
          onChange={handleToggleChange}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="w-5 h-5 rounded accent-blue-500"
        />
        <div className="flex items-center gap-2"> {/* Wrapper for buttons */}
          <button 
            onClick={handleEditClick} // Add handler
            className="text-blue-500 hover:text-blue-400"
            aria-label={`Edit task ${task.name}`}
          >
            ✏️ {/* Pencil emoji */}
          </button>
          <button 
            onClick={handleDeleteClick}
            className="text-red-500 hover:text-red-400"
            aria-label={`Delete task ${task.name}`}
          >
            🗑️ {/* Simple trash can emoji for now */}
          </button>
        </div>
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
        <div className="flex items-center justify-end gap-2">
          <button onClick={handleDecreasePomos} className="text-lg font-bold w-6 h-6 rounded-full bg-white/10 hover:bg-white/20">-</button>
          <p className="font-semibold w-20 text-center">{task.pomodorosCompleted} Pomodoros</p>
          <button onClick={handleIncreasePomos} className="text-lg font-bold w-6 h-6 rounded-full bg-white/10 hover:bg-white/20">+</button>
        </div>
        <span className="text-xs px-2 py-1 bg-gray-600 rounded-full mt-2 inline-block">{task.priority}</span>
      </div>
    </div>
  );
}