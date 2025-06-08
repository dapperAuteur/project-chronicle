"use client"
import { useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from '@/lib/firebase';
import TaskItem from "@/components/TaskItem";
import UserProfile from "@/components/UserProfile";
import { Goal } from "@/types/goal";
import { Task } from "@/types/task";
import Auth from "@/components/Auth";
import GoalManager from "@/components/GoalManager";

import DailyReflection from '@/components/DailyReflection';


export default function Home() {
  // Component State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGoalManagerOpen, setIsGoalManagerOpen] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);

  // Data State
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])

  // Daily Focus State
  const [selectedFocusGoalId, setSelectedFocusGoalId] = useState<string | null>(null);
  const [dailyMission, setDailyMission] = useState('');

  // Form State
  const [taskName, setTaskName] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Timer State
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(focusDuration * 60);

  // NEW: Daily Reflection State
  const [reflectionText, setReflectionText] = useState('');
  const [isDraftingAI, setIsDraftingAI] = useState(false);

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!user) {
      setGoals([]);
      return;
    }

    const goalsCollection = collection(db, 'users', user.uid, 'goals');
    const q = query(goalsCollection);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const goalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Goal[];
      setGoals(goalsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveGoal = async (goalName: string, goalId?: string) => {
    if (!user) return;
    const goalsCollectionRef = collection(db, 'users', user.uid, 'goals');

    if (goalId) { // Editing existing goal
      const goalDocRef = doc(db, 'users', user.uid, 'goals', goalId);
      await updateDoc(goalDocRef, { name: goalName });
    } else { // Adding new goal
      await addDoc(goalsCollectionRef, { name: goalName });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    const goalDocRef = doc(db, 'users', user.uid, 'goals', goalId);
    await deleteDoc(goalDocRef);
  };

  useEffect(() => {
    let tasksUnsubscribe: (() => void) | undefined;
    let goalsUnsubscribe: (() => void) | undefined;
    let reflectionUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Fetch Tasks
        const tasksCollection = collection(db, 'users', currentUser.uid, 'tasks');
        tasksUnsubscribe = onSnapshot(query(tasksCollection), (snapshot) => {
          setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]);
        });

        // Fetch Goals
        const goalsCollection = collection(db, 'users', currentUser.uid, 'goals');
        goalsUnsubscribe = onSnapshot(query(goalsCollection), (snapshot) => {
          setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Goal[]);
        });

        // NEW: Fetch today's reflection
        const today = getTodayDateString();
        const reflectionDocRef = doc(db, 'users', currentUser.uid, 'daily_reflection', today);
        reflectionUnsubscribe = onSnapshot(reflectionDocRef, (doc) => {
          if (doc.exists()) {
            setReflectionText(doc.data().text);
          } else {
            setReflectionText('');
          }
        });
      } else {
        // Clear all data on logout
        setTasks([]);
        setGoals([]);
        setReflectionText('');
        if (tasksUnsubscribe) tasksUnsubscribe();
        if (goalsUnsubscribe) goalsUnsubscribe();
        if (reflectionUnsubscribe) reflectionUnsubscribe();
      }
    });

    return () => {
      authUnsubscribe();
      if (tasksUnsubscribe) tasksUnsubscribe();
      if (goalsUnsubscribe) goalsUnsubscribe();
      if (reflectionUnsubscribe) reflectionUnsubscribe();
    };
  }, []);

  const handleSaveReflection = async (newReflectionText: string) => {
    if (!user) return;
    const today = getTodayDateString();
    const reflectionDocRef = doc(db, 'users', user.uid, 'daily_reflection', today);
    await setDoc(reflectionDocRef, { text: newReflectionText, date: today }, { merge: true });
    setReflectionText(newReflectionText); // Update local state immediately
  };

  const handleDraftReflection = async () => {
    setIsDraftingAI(true);
    console.log("handleDraftReflection");
    
    
    // 1. Find the full name of the selected focus goal.
    const focusGoal = goals.find(g => g.id === selectedFocusGoalId);
    if (!focusGoal) {
      alert("Please select a daily focus goal first.");
      setIsDraftingAI(false);
      return;
    }

    // 2. Filter for today's completed tasks.
    const completedTasks = tasks
      .filter(task => task.status === 'Done')
      .map(task => task.name);

    if (completedTasks.length === 0) {
      alert("You haven't completed any tasks yet! The AI needs something to summarize.");
      setIsDraftingAI(false);
      return;
    }

    try {
      // 3. Call our own API endpoint.
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          focusGoal: focusGoal.name,
          completedTasks: completedTasks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a summary from the AI.');
      }

      const data = await response.json();
      
      // 4. Update the reflection text with the AI's summary.
      setReflectionText(data.summary);

    } catch (error) {
      console.error("Error drafting reflection:", error);
      alert("Sorry, there was an error connecting to the AI. Please try again.");
    } finally {
      // 5. Always turn off the loading state.
      setIsDraftingAI(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    if (!user) {
      setSelectedFocusGoalId(null);
      setDailyMission('');
      return;
    }

    const getInitialFocus = async () => {
      const today = getTodayDateString();
      const focusDocRef = doc(db, 'users', user.uid, 'daily_focus', today);
      const docSnap = await getDoc(focusDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setSelectedFocusGoalId(data.goalId || null);
        setDailyMission(data.mission || '');
      }
    };

    getInitialFocus();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedFocusGoalId) {
      return;
    }

    const handler = setTimeout(() => {
      const today = getTodayDateString();
      const focusDocRef = doc(db, 'users', user.uid, 'daily_focus', today);
      const selectedGoal = goals.find(g => g.id === selectedFocusGoalId);

      setDoc(focusDocRef, { 
        goalId: selectedFocusGoalId,
        goalName: selectedGoal?.name || '', // Store the name for convenience
        mission: dailyMission 
      });
    }, 1000); // Debounced save

    return () => {
      clearTimeout(handler);
    };
  }, [selectedFocusGoalId, dailyMission, user, goals]);

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
        if (selectedTaskId && user) {
          const taskDocRef = doc(db, 'users', user?.uid, 'tasks', selectedTaskId);
          const taskToUpdate = tasks.find(t => t.id === selectedTaskId);
          if (taskToUpdate) {
            const incrementPomodoros = async () => {
              try {
                await updateDoc(taskDocRef, { pomodorosCompleted: taskToUpdate.pomodorosCompleted + 1 });
              } catch (error) {
                console.error("Error updating pomodoros:", error);
              }
            };
            incrementPomodoros();
          }
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
  }, [isActive, timeRemaining, mode, selectedTaskId, focusDuration, breakDuration, user, tasks, /*db**/]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('focus');
    setTimeRemaining(focusDuration * 60); // Use state instead of constant
  };

  const handleAdjustPomodoros = async (taskId: string, amount: number) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
    const taskToAdjust = tasks.find(t => t.id === taskId);
    if (taskToAdjust) {
      const newCount = taskToAdjust.pomodorosCompleted + amount;
      await updateDoc(taskDocRef, { pomodorosCompleted: newCount >= 0 ? newCount : 0 });
    }
  };

  const handleStartEditing = (taskId: string) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
      setEditingTaskId(taskId);
      setTaskName(taskToEdit.name);
      setTaskCategory(taskToEdit.category);
      setTaskPriority(taskToEdit.priority);
      setTaskNotes(taskToEdit.notes || '');
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
    const taskToToggle = tasks.find(t => t.id === taskId);
    if (taskToToggle) {
      await updateDoc(taskDocRef, { status: taskToToggle.status === 'Done' ? 'To Do' : 'Done' });
    }
  };
  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await deleteDoc(taskDocRef);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim() || !user) return;

    if (editingTaskId) {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', editingTaskId);
      await updateDoc(taskDocRef, {
        name: taskName,
        category: taskCategory,
        priority: taskPriority,
        notes: taskNotes
      });
      setEditingTaskId(null);
    } else {
      const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');
      await addDoc(tasksCollectionRef, {
        name: taskName,
        category: taskCategory,
        priority: taskPriority,
        status: 'To Do',
        pomodorosCompleted: 0,
        notes: taskNotes,
      });
    }
    setTaskName('');
    setTaskCategory('');
    setTaskPriority('Medium');
    setTaskNotes('');
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  if (loading) {
    return <p className="flex min-h-screen items-center justify-center">Loading...</p>;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          <h1 className="text-2xl font-bold mb-4 text-white">Project Chronicle</h1>
        </div>
        
        {user ? (
          <>
            <div className="w-full max-w-2xl flex justify-between items-center mb-8">
              <div>
                <p className="text-l font-bold mb-4 text-white">Welcome, {user.email}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsGoalManagerOpen(true)} className="bg-purple-600 hover:bg-purple-700 p-2 rounded-md font-bold text-white">
                  Manage Goals
                </button>
                <button onClick={() => setIsProfileOpen(true)} className="bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold">
                    Profile
                  </button>
                <button onClick={handleSignOut} className="bg-red-600 hover:bg-red-700 p-2 rounded-md font-bold">Sign Out</button>
              </div>
            </div>
            {
              isGoalManagerOpen && (
                <GoalManager
                  goals={goals}
                  onSave={handleSaveGoal}
                  onDelete={handleDeleteGoal}
                  onClose={() => setIsGoalManagerOpen(false)}
                />
              )
            }
            {
              isProfileOpen && user && <UserProfile user={user} onClose={() => setIsProfileOpen(false)} />
            }
            {
              isReflectionOpen && (
                <DailyReflection
                  initialReflection={reflectionText}
                  isDrafting={isDraftingAI}
                  onSave={handleSaveReflection}
                  onDraft={handleDraftReflection}
                  onClose={() => setIsReflectionOpen(false)}
                />
              )
            }
            <div className="w-full max-w-2xl my-8 h-px bg-gray-700" />        
              <div className="w-full max-w-2xl mb-8 mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-white">Daily Focus</h2>
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-4 border border-gray-700">
                  <div>
                    <label htmlFor="goal-select" className="block text-sm font-bold mb-2 text-gray-300">
                      Which goal are you focusing on today?
                    </label>
                    <select
                      id="goal-select"
                      value={selectedFocusGoalId || ''}
                      onChange={(e) => setSelectedFocusGoalId(e.target.value)}
                    >
                      <option value="" disabled>-- Select a Goal --</option>
                      {goals.map(goal => (
                        <option key={goal.id} value={goal.id}>
                          {goal.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="mission-input" className="block text-sm font-bold mb-2 text-gray-300">
                      What is your specific mission? (Optional)
                    </label>
                    <input
                      id="mission-input"
                      type="text"
                      placeholder="E.g., Complete the first draft of the landing page."
                      className="w-full p-3 rounded-md text-lg"
                      value={dailyMission}
                      onChange={(e) => setDailyMission(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="w-full max-w-2xl mb-8 mx-auto text-center">
                <button 
                    onClick={() => setIsReflectionOpen(true)}
                    className="bg-green-600 hover:bg-green-700 p-3 rounded-md font-bold text-lg"
                >
                    End Day & Reflect
                </button>
              </div>
              <div>
                <div className="text-center mb-8">
                  <div className="bg-white/10 rounded-lg p-8 inline-block">
                    <h2 className="text-8xl font-bold">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </h2>
                  </div>
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
                  <form onSubmit={handleSubmit} className="bg-gray-800/50 p-4 rounded-lg flex flex-col gap-4 border border-gray-700">
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
                      className="bg-gray-800 p-2 rounded-md border border-gray-700 text-white"
                      value={taskNotes}
                      onChange={(e) => setTaskNotes(e.target.value)}
                     >
                    </textarea>
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
                          setTaskNotes('');
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
                  <h2 className="text-2xl font-bold mb-4">Today&apos;s Tasks</h2>
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
          </>
          ) : (
            <Auth />
          )}
      </main>
    </div>
  );
}
