import { Task } from '@/types/task';
import { ChangeEvent, MouseEvent } from 'react';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  isActive: boolean;
  isCollapsed: boolean;
  hasChildren: boolean;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (id: string) => void;
  onAdjustPomodoros: (id: string, amount: number) => void;
  onAddSubtask: (parentId: string) => void;
  onToggleCollapse: (id: string) => void;
  level: number;
  pomodorosEstimated: number;
}

// Notice how we're using the interface to type the props
export default function TaskItem({
  task,
  isSelected,
  // isActive,
  isCollapsed,
  hasChildren,
  onClick,
  onDelete,
  onToggleStatus,
  onEdit,
  onAdjustPomodoros,
  onAddSubtask,
  onToggleCollapse,
  level,
}: TaskItemProps) {
  const containerClasses = `
    bg-gray-800/50 p-3 rounded-lg flex flex-col gap-2 border border-gray-700
    ${isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-700/50'}
  `;

  const handleButtonClick = (e: MouseEvent, action: (id: string) => void) => {
    // const isChecked = e.target.checked;
    // const value = e.target.value;
    e.stopPropagation();
    action(task.id);
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleStatus(task.id);
  };

  const handleAdjustPomosClick = (e: MouseEvent, amount: number) => {
    e.stopPropagation();
    if (amount === -1 && task.pomodorosCompleted <= 0) return;
    onAdjustPomodoros(task.id, amount);
  };

  // const handleIncreasePomos = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   onAdjustPomodoros(task.id, 1);
  // };

  // const handleDecreasePomos = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   // Prevent going below zero
  //   if (task.pomodorosCompleted > 0) {
  //     onAdjustPomodoros(task.id, -1);
  //   }
  // };
  // const handleEditClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   onEdit(task.id);
  // };
  // const handleToggleChange = () => {
  //   onToggleStatus(task.id);
  // };
  // const handleDeleteClick = (e: React.MouseEvent) => {
  //   e.stopPropagation(); // Stop the click from bubbling up to the parent div
  //   onDelete(task.id);
  // };

  const getDeadlineInfo = () => {
    if (!task.deadline) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

    // Adjust for timezone offset before creating the deadline date
    const deadlineDate = new Date(task.deadline + 'T00:00:00');

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (task.status === 'Done') {
        return { text: `✓ Done`, color: 'text-green-500' };
    }
    if (diffDays < 0) {
      return { text: `⚠ Overdue by ${Math.abs(diffDays)} day(s)`, color: 'text-red-500 font-bold' };
    }
    if (diffDays === 0) {
      return { text: '🔥 Due Today', color: 'text-amber-500 font-bold' };
    }
    if (diffDays <= 7) {
      return { text: `Due in ${diffDays} day(s)`, color: 'text-amber-400' };
    }
    return { text: `Due: ${task.deadline}`, color: 'text-gray-400' };
  };

  const deadlineInfo = getDeadlineInfo();
  const pomodoroProgress = `${task.pomodorosCompleted} / ${task.pomodorosEstimated || '?'}`;

  return (
    <div
      className={containerClasses}
      onClick={() => onClick(task.id)}
      style={{ marginLeft: `${level * 2}rem` }} // NEW: Apply indentation based on level
    >
      <div className="flex items-start gap-3 w-full">
        <div className="w-6 flex-shrink-0 pt-1">
          {hasChildren ? (
            <button onClick={(e) => handleButtonClick(e, onToggleCollapse)}
              className="text-gray-400 hover:text-white text-lg w-6 text-center"
              aria-label={isCollapsed ? 'Expand task' : 'Collapse task'}>
                {isCollapsed ? '▶' : '▼'}
            </button>
            ) : <div className="w-6"></div>
          }
        </div>
        <input
          type="checkbox"
          checked={task.status === 'Done'}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 mt-1 rounded accent-blue-500 flex-shrink-0"
        />
        <div className="flex-grow truncate">
          <p className={`font-bold truncate ${task.status === 'Done' ? 'line-through text-gray-500' : ''}`}>
            {task.name}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {deadlineInfo && (
              <span className={`text-xs ${deadlineInfo.color}`}>
                {deadlineInfo.text}
              </span>
            )}
            {task.notes && <p className="text-xs text-gray-400 italic truncate">&quot;{task.notes}&quot;</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold text-lg text-amber-400">{pomodoroProgress} 🍅</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {/* NEW: Add Sub-task Button */}
        <button onClick={(e) => handleButtonClick(e, onAddSubtask)} className="p-1 rounded hover:bg-white/20 text-lg" aria-label="Add sub-task">＋</button>
        
        <div className="flex items-center gap-1">
          <button onClick={(e) => handleAdjustPomosClick(e, -1)} className="text-sm font-bold w-5 h-5 rounded-full bg-white/10 hover:bg-white/20">-</button>
          <span className="text-xs w-8 text-center">{task.pomodorosCompleted}</span>
          <button onClick={(e) => handleAdjustPomosClick(e, 1)} className="text-sm font-bold w-5 h-5 rounded-full bg-white/10 hover:bg-white/20">+</button>
        </div>
        
        <button onClick={(e) => handleButtonClick(e, onEdit)} className="p-1 rounded hover:bg-white/20" aria-label="Edit task">✏️</button>
        <button onClick={(e) => handleButtonClick(e, onDelete)} className="p-1 rounded hover:bg-white/20" aria-label="Delete task">🗑️</button>
      </div>
    </div>
  );
}