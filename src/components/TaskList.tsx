'use client';

import { useState, useMemo } from 'react';
import { Task } from '@/types/task';
import TaskItem from './TaskItem';

// Define a recursive type for our nested task structure
type TaskWithChildren = Task & { children: TaskWithChildren[] };

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  timerIsActive: boolean;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onAdjustPomodoros: (id: string, amount: number) => void;
  onTaskClick: (id: string) => void;
  onAddSubtask: (parentId: string) => void;
}

export default function TaskList({
  tasks,
  selectedTaskId,
  timerIsActive,
  onToggleStatus,
  onDelete,
  onEdit,
  onAdjustPomodoros,
  onTaskClick,
  onAddSubtask,
}: TaskListProps) {
  const [collapsedTasks, setCollapsedTasks] = useState<string[]>([]);

  const handleToggleCollapse = (taskId: string) => {
    setCollapsedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const taskTree = useMemo(() => {
    const tasksById = new Map<string, TaskWithChildren>();
    tasks.forEach(task => tasksById.set(task.id, { ...task, children: [] }));
    const tree: TaskWithChildren[] = [];
    tasksById.forEach(task => {
      if (task.parentId && tasksById.has(task.parentId)) {
        tasksById.get(task.parentId)!.children.push(task);
      } else {
        tree.push(task);
      }
    });
    return tree;
  }, [tasks]);

  const renderTasks = (tasksToRender: TaskWithChildren[], level: number) => {
    return tasksToRender.map(task => {
      const isCollapsed = collapsedTasks.includes(task.id);
      const hasChildren = task.children && task.children.length > 0;
      return (
        <div key={task.id}>
          <TaskItem
            task={task}
            isSelected={task.id === selectedTaskId}
            isActive={timerIsActive && selectedTaskId === task.id}
            isCollapsed={isCollapsed}
            hasChildren={hasChildren}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onEdit={onEdit}
            onAdjustPomodoros={onAdjustPomodoros}
            onClick={onTaskClick}
            onAddSubtask={onAddSubtask}
            onToggleCollapse={handleToggleCollapse}
            level={level}
          />
          {!isCollapsed && hasChildren && (
            <div className="border-l-2 border-gray-700/50">
               {renderTasks(task.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        {taskTree.length > 0 ? (
            renderTasks(taskTree, 0)
        ) : (
            <p className="text-gray-400 text-center py-4">No tasks yet. Add one to get started!</p>
        )}
    </div>
  );
}
