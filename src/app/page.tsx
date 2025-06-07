import TaskItem from "@/components/TaskItem";
import { Task } from "@/types/task";

export default function Home() {
  const mockTasks: Task[] = [
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
          <h1>Add Task</h1>
        </div>
        <div>
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Today's Tasks</h2>
            <div className="space-y-4">
              {/* Render the tasks using your new component */}
              {mockTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
