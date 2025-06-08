"use client"
import { useEffect, useState } from "react";
import TaskItem from "@/components/TaskItem";
import { Task } from "@/types/task";

// const FOCUS_TIME_SECONDS = 25 * 60; // 25 minutes
// const BREAK_TIME_SECONDS = 5 * 60;  // 5 minutes

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskName, setTaskName] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  // const [timeRemaining, setTimeRemaining] = useState(FOCUS_TIME_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [dailyFocus, setDailyFocus] = useState('');
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  const [timeRemaining, setTimeRemaining] = useState(focusDuration * 60);

  useEffect(() => {
    const storedFocus = localStorage.getItem('dailyFocus');
    if (storedFocus) {
      setDailyFocus(JSON.parse(storedFocus));
    }
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []); // An empty dependency array means this effect runs only one time.

  useEffect(() => {
    // localStorage can only store strings, so we convert the array to a JSON string.
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('dailyFocus', JSON.stringify(dailyFocus));
  }, [dailyFocus]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;

    // Only run the timer if it's active and there's time left
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Handle session completion here (we'll do this in the next task)
      console.log("Session's over!");
      setIsActive(false); // Stop the timer
      new Audio('/sounds/its_time.wav').play();
      if (mode === 'focus') {
        if (selectedTaskId) {
          setTasks(prevTasks =>
            prevTasks.map(task =>
              task.id === selectedTaskId
                ? { ...task, pomodorosCompleted: task.pomodorosCompleted + 1 }
                : task
            )
          );
        }
        setMode('break');
        setTimeRemaining(breakDuration * 60);
        setIsActive(true);
      } else {
        setMode('focus');
        setTimeRemaining(focusDuration * 60);
        setIsActive(false);
      }
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining, mode, selectedTaskId, focusDuration, breakDuration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('focus');
    setTimeRemaining(focusDuration * 60); // Use state instead of constant
  };

  const handleAdjustPomodoros = (taskId: string, amount: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, pomodorosCompleted: task.pomodorosCompleted + amount }
          : task
      )
    );
  };

  const handleStartEditing = (taskId: string) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
      setEditingTaskId(taskId);
      setTaskName(taskToEdit.name);
      setTaskCategory(taskToEdit.category);
      setTaskPriority(taskToEdit.priority);
    }
  };

  const handleToggleStatus = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'Done' ? 'To Do' : 'Done' }
          : task
      )
    );
  };
  const handleDeleteTask = (taskId: string) => {
    // A simple confirmation dialog.
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim()) {
      alert("Task name cannot be empty!"); // We'll use a nicer notification later
      return;
    }
    // UPDATE LOGIC
    if (editingTaskId) {
      setTasks(tasks.map(task => 
        task.id === editingTaskId 
          ? { ...task, name: taskName, category: taskCategory, priority: taskPriority }
          : task
      ));
      setEditingTaskId(null);
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        name: taskName,
        category: taskCategory,
        priority: taskPriority,
        status: 'To Do',
        pomodorosCompleted: 0,
      };
      setTasks([...tasks, newTask]);
    }

    setTaskName('');
    setTaskCategory('');
    setTaskPriority('Medium');
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          <h1>Project Chronicle</h1>
        </div>        
        <div className="w-full max-w-2xl mb-8">
          <h2 className="text-2xl font-bold mb-4">Daily Focus</h2>
          <input
            type="text"
            placeholder="What is your main goal for today?"
            className="w-full bg-gray-800 p-3 rounded-md border border-gray-700 text-lg text-blue-50"
            value={dailyFocus}
            onChange={(e) => setDailyFocus(e.target.value)}
          />
        </div>
        <div>
          <div className="text-center mb-8">
            <div className="flex justify-center gap-4 mb-4 text-center">
            <div>
              <label htmlFor="focus-duration" className="block text-sm text-gray-400">Focus Minutes</label>
              <input
                id="focus-duration"
                type="number"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
                className="w-20 bg-gray-800 p-2 rounded-md border border-gray-700 text-center text-amber-50"
                disabled={isActive} // Disable input while timer is running
              />
              </div>
              <div>
                <label htmlFor="break-duration" className="block text-sm text-gray-400">Break Minutes</label>
                <input
                  id="break-duration"
                  type="number"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  className="w-20 bg-gray-800 p-2 rounded-md border border-gray-700 text-center text-amber-50"
                  disabled={isActive} // Disable input while timer is running
                />
              </div>
            </div>
            <div className="mt-4 space-x-4">
              <button
                onClick={toggleTimer} // <-- Add this
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold w-24 text-amber-50"
              >
                {
                  isActive ? 'Pause' : 'Start'
                }
              </button>
              <button
                onClick={resetTimer} // <-- Add this
                className="bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold w-24 text-amber-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        <div>
          <div className="w-full max-w-2xl mb-8">
            <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
            <form onSubmit={handleSubmit} className="bg-white/10 p-4 rounded-lg flex flex-col gap-4">
              <input
                type="text"
                placeholder="Task Name"
                className="bg-gray-800 p-2 rounded-md border border-gray-700 text-amber-50"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Category"
                className="bg-gray-800 p-2 rounded-md border border-gray-700 text-blue-50"
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
              />
              <select
               className="bg-gray-800 p-2 rounded-md border border-gray-700 text-blue-50"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as 'High' | 'Medium' | 'Low')}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <textarea
                placeholder="Notes (optional)"
                className="bg-gray-800 p-2 rounded-md border border-gray-700 text-blue-50"
              ></textarea>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold text-blue-50"
              >
                {editingTaskId ? 'Update Task' : 'Add Task'}
              </button>
              {editingTaskId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTaskId(null);
                    setTaskName('');
                    setTaskCategory('');
                    setTaskPriority('Medium');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold"
                >
                  Cancel
                </button>
                )
              }
            </form>
          </div>
        </div>
        <div>
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Today's Tasks</h2>
            <div className="space-y-4">
              {/* Render the tasks using your new component */}
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={task.id === selectedTaskId}
                  isActive={isActive}
                  onClick={setSelectedTaskId}
                  onDelete={handleDeleteTask}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleStartEditing}
                  onAdjustPomodoros={handleAdjustPomodoros}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
