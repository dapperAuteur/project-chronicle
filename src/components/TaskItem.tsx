// src/components/TaskItem.tsx
import { Task } from '@/types/task'; // Import the type we just created

interface TaskItemProps {
  task: Task;
  isSelected: boolean; // To know if it's the selected one
  isActive: boolean;
  onClick: (id: string) => void; // A function to call when clicked
  onDelete: (id: string) => void; // <-- Add this new prop
}

// Notice how we're using the interface to type the props
export default function TaskItem({
  task,
  isSelected,
  isActive,
  onClick,
  onDelete
}: TaskItemProps) {
  const containerClasses = `
    bg-white/10 p-4 rounded-lg flex justify-between items-center cursor-pointer
    ${isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-white/20'}
  `;
  const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Stop the click from bubbling up to the parent div
      onDelete(task.id);
    };
  return (
    <div
      className={containerClasses}
      onClick={() => onClick(task.id)}>
      <div className="flex items-center gap-4"> {/* <-- Wrapper div for alignment */}
        {/* We'll add a better icon later */}
        <button 
          onClick={handleDeleteClick} // <-- Use the new handler
          className="text-red-500 hover:text-red-400"
          aria-label={`Delete task ${task.name}`}
        >
          🗑️ {/* Simple trash can emoji for now */}
        </button>
        <div>
          <h3 className="font-bold">{task.name}</h3>
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