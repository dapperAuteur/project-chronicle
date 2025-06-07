"use client"
import { useState } from "react";
import TaskItem from "@/components/TaskItem";
import { Task } from "@/types/task";

export default function Home() {
  const [tasks, setTasks] = useState(
    [
      {
        id: '1',
        name: 'Set up project structure',
        category: 'Work',
        priority: 'High',
        status: 'Done',
        pomodorosCompleted: 2
      },
      {
        id: '2',
        name: 'Create Task component',
        category: 'Work',
        priority: 'High',
        status: 'In Progress',
        pomodorosCompleted: 1
      },
      {
        id: '3',
        name: 'Read for 30 minutes',
        category: 'Learning',
        priority: 'Medium',
        status: 'To Do',
        pomodorosCompleted: 0
      }
    ]
  )
  const [taskName, setTaskName] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
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
          <p text-3xl>25:00</p>
        </div>
        <div>
          <button>Start</button> | 
          <button>Pause</button> | 
          <button>Reset</button>
        </div>
        <div>
          <div className="w-full max-w-2xl mb-8">
            <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
            <form className="bg-white/10 p-4 rounded-lg flex flex-col gap-4">
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
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
