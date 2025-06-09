 "use client";

import { useMemo, useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { signOut } from 'firebase/auth';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { trainAndSaveModel, predictPomos } from '@/lib/ai/model';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { useTimer } from '@/hooks/useTimer';
import { usePrediction } from '@/hooks/usePrediction';
import { Milestone } from "@/types/milestone";

import Header from '@/components/Header';
import Auth from "@/components/Auth";
import UserProfile from "@/components/UserProfile";
import GoalManager from "@/components/GoalManager";
import DailyReflection from '@/components/DailyReflection';
import ControlPanel from '@/components/ControlPanel';
import TaskList from '@/components/TaskList';
import ProgressReport from '@/components/ProgressReport';

export default function Home() {

  const { user, loading } = useAuth();
  const { 
    tasks, goals, streak, topStreaks,
    /* addTask, */ updateTask, deleteTask,
    addGoal, updateGoal, /* deleteGoal, */
    saveReflection,
  } = useFirestore(user);

  const [milestonesByGoal, setMilestonesByGoal] = useState<Record<string, Milestone[]>>({});
  const [currentMilestones, setCurrentMilestones] = useState<Milestone[]>([]);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGoalManagerOpen, setIsGoalManagerOpen] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedFocusGoalId, setSelectedFocusGoalId] = useState<string | null>(null);
  const [dailyMission, setDailyMission] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [isDraftingAI, setIsDraftingAI] = useState(false);

  // Form State
  const [taskName, setTaskName] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [subtaskParentId, setSubtaskParentId] = useState<string | null>(null);
  const [taskDeadline, setTaskDeadline] = useState('');
  const [selectedTaskMilestoneId, setSelectedTaskMilestoneId] = useState<string | null>(null);
  const categoryManuallySet = useRef(false);
  const [estimatedPomos, setEstimatedPomos] = useState(1);

  const { prediction: aiPrediction } = usePrediction({ taskName });
  const pomosManuallySet = useRef(false);
  const [aiSuggestion, setAiSuggestion] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  //  useEffect(() => {
  //   // If user has not manually set the pomos and there is a prediction
  //   if (!pomosManuallySet.current && aiPrediction) {
  //     setEstimatedPomos(aiPrediction);
  //   }
  // }, [aiPrediction]);

  const handleEstimatedPomosChange = (pomos: number) => {
    pomosManuallySet.current = true; // Mark as manually changed
    setEstimatedPomos(pomos);
  };

  const handleGetAiEstimate = async () => {
    setIsEstimating(true);
    setAiSuggestion(null);

    try {
      // Create an object with the current form inputs
      const taskInputs = {
        name: taskName,
        notes: taskNotes,
        category: taskCategory,
        priority: taskPriority,
      };

    // This is where the real TensorFlow.js logic will go.
    // For now, we simulate the process.
    console.log("Requesting AI prediction with task name:", taskName);

    const prediction = await predictPomos(taskInputs);

    if (prediction !== null) {
        setAiSuggestion(prediction);
        setEstimatedPomos(prediction); // Automatically apply the suggestion
      } else {
        // Handle case where prediction is not possible (e.g., model not trained)
        alert("AI model not ready. Please complete at least 10 tasks to train the model.");
      }
    } catch (error) {
      console.error("An error occurred during prediction:", error);
      alert("An error occurred while trying to get an AI suggestion.");
    } finally {
      setIsEstimating(false);
    }

    // // Simulate a 1-second delay
    // setTimeout(() => {
    //   const mockPrediction = Math.ceil(Math.random() * 5) + 1; // Random guess from 2-6
    //   setAiSuggestion(mockPrediction);
    //   setEstimatedPomos(mockPrediction); // Automatically apply the suggestion
    //   setIsEstimating(false);
    // }, 1000);
  };

  const handleTrainModel = async () => {
      alert("Starting AI model training. This may take a moment and might make the page unresponsive.");
      // We only want to train on tasks that are 'Done'
      const completedTasks = tasks.filter(task => task.status === 'Done');
      await trainAndSaveModel(completedTasks);
      alert("Model training complete!");
  }

  const weeklyReportData = useMemo(() => {
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 7);

    const recentTasks = tasks.filter(task => new Date(task.updatedAt) >= last7Days);
    
    // 1. Total Pomodoros
    const totalPomos = recentTasks.reduce((sum, task) => sum + task.pomodorosCompleted, 0);

    // 2. Category Breakdown
    const pomosByCategory = recentTasks.reduce((acc, task) => {
      const category = task.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + task.pomodorosCompleted;
      return acc;
    }, {} as Record<string, number>);

    // 3. Daily Breakdown
    const pomosByDay: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
        const day = new Date();
        day.setDate(today.getDate() - i);
        const dayString = day.toLocaleDateString('en-US', { weekday: 'short' });
        pomosByDay[dayString] = 0;
    }
    recentTasks.forEach(task => {
        const dayString = new Date(task.updatedAt).toLocaleDateString('en-US', { weekday: 'short' });
        if(pomosByDay[dayString] !== undefined) {
            pomosByDay[dayString] += task.pomodorosCompleted;
        }
    });

    const dailyPomosData = {
        labels: Object.keys(pomosByDay).reverse(),
        data: Object.values(pomosByDay).reverse(),
    };
    
    // 4. Most Productive Day
    const mostProductiveDay = Object.entries(pomosByDay).reduce((max, entry) => entry[1] > max[1] ? entry : max, ['', 0])[0] || 'N/A';
    
    return {
      totalPomos,
      mostProductiveDay,
      categoryData: {
        labels: Object.keys(pomosByCategory),
        data: Object.values(pomosByCategory),
      },
      dailyPomosData,
    };
  }, [tasks]);

  const handleSessionComplete = (completedMode: 'focus' | 'break') => {
    if (completedMode === 'focus' && selectedTaskId && user) {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task) {
        updateTask(selectedTaskId, { 
          pomodorosCompleted: task.pomodorosCompleted + 1,
          updatedAt: new Date().toISOString()
        });
      }
    }
  };

  const {
    minutes, seconds, isActive, toggleTimer, resetTimer,
    focusDuration, setFocusDuration, breakDuration, setBreakDuration
  } = useTimer({
    initialFocusDuration: 25,
    initialBreakDuration: 5,
    onSessionComplete: handleSessionComplete,
  });

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // All data fetching is handled by custom hooks, this component just uses the data.
  // Milestone fetching remains here as it depends on the `goals` state.
  useEffect(() => {
    if (!user || goals.length === 0) {
      setMilestonesByGoal({});
      return;
    }
    const unsubscribers: Unsubscribe[] = [];
    goals.forEach(goal => {
      const milestonesCollection = collection(db, 'users', user.uid, 'goals', goal.id, 'milestones');
      const q = query(milestonesCollection, orderBy('deadline', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const milestonesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Milestone[];
        setMilestonesByGoal(prev => ({ ...prev, [goal.id]: milestonesData }));
      });
      unsubscribers.push(unsubscribe);
    });
    return () => unsubscribers.forEach(unsub => unsub());
  }, [user, goals]);

  useEffect(() => {
    setCurrentMilestones(expandedGoalId ? milestonesByGoal[expandedGoalId] || [] : []);
  }, [expandedGoalId, milestonesByGoal]);

  const resetFormState = () => {
    setTaskName('');
    setTaskCategory('');
    setTaskPriority('Medium');
    setTaskNotes('');
    setEditingTaskId(null);
    setSubtaskParentId(null);
    setTaskDeadline('');
    setEstimatedPomos(1);
    pomosManuallySet.current = false;
    categoryManuallySet.current = false;
  };
  
  const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    categoryManuallySet.current = true;
    setTaskCategory(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || !user) return;
    const now = new Date().toISOString();
    const taskData = {
      name: taskName,
      category: taskCategory,
      priority: taskPriority,
      notes: taskNotes,
      updatedAt: now,
      deadline: taskDeadline,
      pomodorosCompleted: 0, // NEW: We will now track an estimated vs completed
      pomodorosEstimated: estimatedPomos,
      milestoneId: selectedTaskMilestoneId || null, // Is this needed
    };
    if (editingTaskId) {
      await updateTask(editingTaskId, taskData);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        ...taskData,
        status: 'To Do',
        pomodorosCompleted: 0,
        createdAt: now,
        parentId: subtaskParentId
      });
    }
    resetFormState();
  };

  const handleAddSubtask = (parentId: string) => {
    setSubtaskParentId(parentId); // Set the parent ID
    setEditingTaskId(null); // Ensure we are not in edit mode
    // Optional: focus the task name input field
    document.getElementById('task-name-input')?.focus();
  };

  const handleGoalSave = async (goalName: string, deadline: string, goalId?: string) => {
    if (!user) return;

    const goalData = { name: goalName, deadline: deadline };

    if (goalId) {
      await updateGoal(goalId, goalData);
    } else { // Adding new goal
      await addGoal(goalData);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    const goalDocRef = doc(db, 'users', user.uid, 'goals', goalId);
    await deleteDoc(goalDocRef);
  };

  const handleSaveReflection = async (newReflectionText: string) => {
    if (!user) return;
    const todayStr = getTodayDateString();
    const statsDocRef = doc(db, 'users', user.uid, 'stats', 'user_stats');

    const statsDoc = await getDoc(statsDocRef);
    let currentStreak = 0;
    let lastDate = '';
    let currentTopStreaks: number[] = [];
    
    if (statsDoc.exists()) {
      const data = statsDoc.data();
      lastDate = data.lastReflectionDate;
      currentStreak = data.reflectionStreak || 0;
      currentTopStreaks = data.topStreaks || [];
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    if(lastDate === todayStr){
      // Already reflected today, do nothing to streak
    } else if (lastDate === yesterdayStr) {
      // Maintained the streak
      currentStreak++;
    } else {
      // --- Streak is BROKEN ---
      // Check if the broken streak should be added to the leaderboard
      if (currentStreak > 0) {
        currentTopStreaks.push(currentStreak);
        // Sort descending and keep only the top 5
        currentTopStreaks.sort((a, b) => b - a);
        if (currentTopStreaks.length > 5) {
            currentTopStreaks = currentTopStreaks.slice(0, 5);
        }
      }
      // Missed a day, reset streak
      currentStreak = 1;
    }
    const reflectionDocRef = doc(db, 'users', user.uid, 'daily_reflection', todayStr);
    await setDoc(reflectionDocRef, {
      text: newReflectionText, date: todayStr
      }, {
        merge: true
      }
    );
    await setDoc(statsDocRef, { 
        reflectionStreak: currentStreak, 
        lastReflectionDate: todayStr,
        topStreaks: currentTopStreaks
      }, {
        merge: true
      }
    );
    setReflectionText(newReflectionText); // Update local state immediately
  };

  const handleDraftReflection = async () => {
    setIsDraftingAI(true);    
    
    // 1. Find the full name of the selected focus goal.
    const focusGoal = goals.find(g => g.id === selectedFocusGoalId);
    if (!focusGoal) {
      alert("Please select a daily focus goal first.");
      setIsDraftingAI(false);
      return;
    }

    // 2. Filter for today's completed tasks.
    const todayStr = new Date().toISOString().slice(0, 10);
    const completedTodayTasks = tasks
      .filter(task =>
        task.status === 'Done' &&
        task.updatedAt?.slice(0, 10) === todayStr
      )
      .map(task => task.name);

    if (completedTodayTasks.length === 0) {
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
          completedTasks: completedTodayTasks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a summary from the AI.');
      }

      const data = await response.json();

      await saveReflection(data.summary, todayStr);
      
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

  useEffect(() => {
    let milestoneUnsubscribe: (() => void) | undefined;
    
    if (user && expandedGoalId) {
      const milestonesCollection = collection(db, 'users', user.uid, 'goals', expandedGoalId, 'milestones');
      const q = query(milestonesCollection, orderBy('deadline', 'asc')); // Order by deadline
      
      milestoneUnsubscribe = onSnapshot(q, (snapshot) => {
        setCurrentMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Milestone[]);
      });
    } else {
      setCurrentMilestones([]); // Clear milestones if no goal is expanded
    }

    return () => {
      if (milestoneUnsubscribe) milestoneUnsubscribe();
    };
  }, [user, expandedGoalId]);

  const handleSaveMilestone = async (name: string, deadline: string, goalId: string) => {
    if (!user) return;
    const milestonesCollectionRef = collection(db, 'users', user.uid, 'goals', goalId, 'milestones');
    await addDoc(milestonesCollectionRef, {
      name,
      deadline: deadline || null,
      status: 'To Do',
      goalId,
    });
  };

  const handleToggleMilestoneStatus = async (milestoneId: string, currentStatus: 'To Do' | 'Complete') => {
    if (!user || !expandedGoalId) return;
    const milestoneDocRef = doc(db, 'users', user.uid, 'goals', expandedGoalId, 'milestones', milestoneId);
    await updateDoc(milestoneDocRef, { status: currentStatus === 'To Do' ? 'Complete' : 'To Do' });
  };
  
  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!user || !expandedGoalId) return;
    if (window.confirm("Are you sure you want to delete this milestone?")) {
        const milestoneDocRef = doc(db, 'users', user.uid, 'goals', expandedGoalId, 'milestones', milestoneId);
        await deleteDoc(milestoneDocRef);
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

  // const handleAdjustPomodoros = async (taskId: string, amount: number) => {
  //   if (!user) return;
  //   const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
  //   const taskToAdjust = tasks.find(t => t.id === taskId);
  //   if (taskToAdjust) {
  //     const newCount = taskToAdjust.pomodorosCompleted + amount;
  //     await updateDoc(taskDocRef, {
  //       pomodorosCompleted: newCount >= 0 ? newCount : 0,
  //       updatedAt: new Date().toISOString(),
  //     });
  //   }
  // };

  const handleStartEditing = (taskId: string) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
      setEditingTaskId(taskId);
      setTaskName(taskToEdit.name);
      setTaskCategory(taskToEdit.category);
      setTaskPriority(taskToEdit.priority);
      setTaskNotes(taskToEdit.notes || '');
      setTaskDeadline(taskToEdit.deadline || '');
      setSelectedTaskMilestoneId(taskToEdit.milestoneId || null);
      setEditingTaskId(taskId);
      setSubtaskParentId(null);
      setEstimatedPomos(taskToEdit.pomodorosEstimated || 1); // Load the saved estimate
      pomosManuallySet.current = true;
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, {
        status: task.status === 'Done' ? 'To Do' : 'Done',
        updatedAt: new Date().toISOString(),
      });
    }
  };
  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId);
    }
  };

  if (loading) {
    return <p className="flex min-h-screen items-center justify-center">Loading...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-gray-900 text-gray-200 font-sans">
      {user ? (
        <>
          <Header
            user={user}
            streak={streak}
            onOpenReport={() => setIsReportOpen(true)}
            onOpenGoalManager={() => setIsGoalManagerOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onSignOut={() => signOut(auth)}
          />
            {
              isGoalManagerOpen && (
                <GoalManager
                  goals={goals}
                  activeGoalMilestones={currentMilestones}
                  progressByGoal={Object.keys(milestonesByGoal).reduce((acc, goalId) => {
                  const milestones = milestonesByGoal[goalId];
                  acc[goalId] = milestones?.length > 0 ? (milestones.filter(m => m.status === 'Complete').length / milestones.length) * 100 : 0;
                  return acc;
                }, {} as Record<string, number>)}
                  expandedGoalId={expandedGoalId}
                  onGoalSave={handleGoalSave}
                  onGoalDelete={handleDeleteGoal}
                  onMilestoneSave={handleSaveMilestone}
                  onMilestoneToggle={handleToggleMilestoneStatus}
                  onMilestoneDelete={handleDeleteMilestone}
                  onExpandGoal={setExpandedGoalId}
                  onClose={() => {
                    setIsGoalManagerOpen(false);
                    setExpandedGoalId(null);
                  }}
                />
              )
            }
            {
              isProfileOpen && user && (
                <UserProfile
                  user={user}
                  topStreaks={topStreaks}
                  onClose={() => setIsProfileOpen(false)} />
              )
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
            {
              isReportOpen && (
                <ProgressReport 
                  data={weeklyReportData}
                  onClose={() => setIsReportOpen(false)}
                />
              )
            }
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-start mt-4">
            <ControlPanel
              goals={goals}
              selectedFocusGoalId={selectedFocusGoalId}
              onFocusGoalChange={setSelectedFocusGoalId}
              dailyMission={dailyMission}
              onMissionChange={setDailyMission}
              milestonesForFocusGoal={milestonesByGoal[selectedFocusGoalId || ''] || []}
              selectedMilestoneId={selectedTaskMilestoneId}
              onMilestoneChange={setSelectedTaskMilestoneId}
              minutes={minutes}
              seconds={seconds}
              timerIsActive={isActive}
              onToggleTimer={toggleTimer}
              onResetTimer={resetTimer}
              focusDuration={focusDuration}
              onFocusDurationChange={setFocusDuration}
              breakDuration={breakDuration}
              onBreakDurationChange={setBreakDuration}
              tasks={tasks}
              taskName={taskName}
              onTaskNameChange={setTaskName}
              taskCategory={taskCategory}
              onTaskCategoryChange={handleCategoryChange}
              taskPriority={taskPriority}
              onTaskPriorityChange={setTaskPriority}
              taskNotes={taskNotes}
              onTaskNotesChange={setTaskNotes}
              taskDeadline={taskDeadline}
              onTaskDeadlineChange={setTaskDeadline}
              editingTaskId={editingTaskId}
              subtaskParentId={subtaskParentId}
              estimatedPomos={estimatedPomos}
              onEstimatedPomosChange={handleEstimatedPomosChange}
              aiPrediction={aiPrediction}
              aiSuggestion={aiSuggestion}
              isEstimating={isEstimating}
              onGetAiEstimate={handleGetAiEstimate}
              onFormSubmit={handleSubmit}
              onCancelEdit={resetFormState}
            />
              <div className="lg:col-span-1">
              <h2 className="text-xl font-bold mb-4">Today&apos;s Tasks</h2>
              <TaskList
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                timerIsActive={isActive}
                onTaskClick={setSelectedTaskId}
                onAddSubtask={handleAddSubtask}
                onDelete={handleDeleteTask}
                onToggleStatus={handleToggleStatus}
                onEdit={handleStartEditing}
                onAdjustPomodoros={
                  (taskId, amount) => {
                    const task = tasks.find(t => t.id === taskId);
                    if(task) updateTask(
                      taskId, {
                        pomodorosCompleted: Math.max(0, task.pomodorosCompleted + amount)
                      }
                    )
                  }
                }
                />
                <button
                  className="text-xs bg-purple-600/50 hover:bg-purple-600 px-2 py-1 rounded-md"
                  onClick={handleTrainModel}>
                  Train Task Estimation Model
                </button>
                </div>
              </div>
          </>
          ) : (
            <Auth />
          )}
      </main>
  );
}
