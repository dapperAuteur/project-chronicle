"use client"
import { useEffect, useState } from "react";
import TaskItem from "@/components/TaskItem";
import { Task } from "@/types/task";

const FOCUS_TIME_SECONDS = 25 * 60; // 25 minutes
const BREAK_TIME_SECONDS = 5 * 60;  // 5 minutes

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskName, setTaskName] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_TIME_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []); // An empty dependency array means this effect runs only one time.

  useEffect(() => {
    // localStorage can only store strings, so we convert the array to a JSON string.
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]); // The dependency array ensures this runs only when `tasks` is updated.

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
      new Audio('/sounds/its_time.wav').play(); // Make sure you have a sound file in your public/sounds folder
      // If a focus session just ended
      if (mode === 'focus') {
        // If a task was selected, increment its pomodoro count
        if (selectedTaskId) {
          setTasks(prevTasks =>
            prevTasks.map(task =>
              task.id === selectedTaskId
                ? { ...task, pomodorosCompleted: task.pomodorosCompleted + 1 }
                : task
            )
          );
        }
        // Switch to break mode
        setMode('break');
        setTimeRemaining(BREAK_TIME_SECONDS);
        setIsActive(true); // Automatically start the break
      } else { // If a break session just ended
        // Switch to focus mode
        setMode('focus');
        setTimeRemaining(FOCUS_TIME_SECONDS);
        setIsActive(false); // Pause before the next focus session starts
      }
    }
    // This is the cleanup function.
    // It runs when the component unmounts or before the effect runs again.
    // This is crucial to prevent memory leaks!
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining, mode, selectedTaskId]); // <-- The Dependency Array

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(FOCUS_TIME_SECONDS);
    setMode('focus');
  };

  const handleDeleteTask = (taskId: string) => {
    // A simple confirmation dialog.
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Basic validation: Don't add a task if the name is empty.
    if (!taskName.trim()) {
      alert("Task name cannot be empty!"); // We'll use a nicer notification later
      return;
    }

    // 2. Create the new task object.
    const newTask: Task = {
      id: crypto.randomUUID(), // Generates a unique random ID
      name: taskName,
      category: taskCategory,
      priority: taskPriority,
      status: 'To Do',
      pomodorosCompleted: 0,
      // We'll add notes later
    };

    // 3. Add the new task to the existing tasks array.
    //    The ...tasks part is the "spread" syntax. It copies all existing tasks.
    setTasks([...tasks, newTask]);

    // 4. Clear the form fields for the next entry.
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
        <div>
          <h2>Daily Focus</h2>
        </div>
        <div>
          <div className="text-center mb-8">
            <div className="bg-white/10 rounded-lg p-8 inline-block">
              <h2 className="text-8xl font-bold">
                {/* Display the formatted time */}
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </h2>
            </div>
            <div className="mt-4 space-x-4">
              <button
                onClick={toggleTimer} // <-- Add this
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md font-bold w-24"
              >
                {
                  isActive ? 'Pause' : 'Start'
                }
              </button>
              <button
                onClick={resetTimer} // <-- Add this
                className="bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold w-24"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        <div>
          <div className="w-full max-w-2xl mb-8">
            <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
            <form onSubmit={handleAddTask} className="bg-white/10 p-4 rounded-lg flex flex-col gap-4">
              <input
                type="text"
                placeholder="Task Name"
                className="bg-gray-800 p-2 rounded-md border border-gray-700 text-blue-50"
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
                Add Task
              </button>
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
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
