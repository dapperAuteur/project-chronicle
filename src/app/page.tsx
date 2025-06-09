 "use client";

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { useTimer } from '@/hooks/useTimer';
import { Goal } from "@/types/goal";
import { Task } from "@/types/task";
import { Milestone } from "@/types/milestone";

import Header from '@/components/Header';
import Auth from "@/components/Auth";
import UserProfile from "@/components/UserProfile";
import GoalManager from "@/components/GoalManager";
import DailyReflection from '@/components/DailyReflection';
import ControlPanel from '@/components/ControlPanel';
import TaskList from '@/components/TaskList';

export default function Home() {

  const { user, loading } = useAuth();
  const { tasks, goals, streak, topStreaks } = useFirestore(user);

  const [milestonesByGoal, setMilestonesByGoal] = useState<Record<string, Milestone[]>>({});
  const [currentMilestones, setCurrentMilestones] = useState<Milestone[]>([]);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGoalManagerOpen, setIsGoalManagerOpen] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);

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
  const categoryManuallySet = useRef(false);

  const handleSessionComplete = (completedMode: 'focus' | 'break') => {
    if (completedMode === 'focus' && selectedTaskId && user) {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', selectedTaskId);
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task) {
        updateDoc(taskDocRef, { 
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
      deadline: taskDeadline || null };
    if (editingTaskId) {
      await updateDoc(doc(db, 'users', user.uid, 'tasks', editingTaskId), taskData);
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
    const goalsCollectionRef = collection(db, 'users', user.uid, 'goals');

    const data = { name: goalName, deadline: deadline || null };

    if (goalId) { // Editing existing goal
      const goalDocRef = doc(db, 'users', user.uid, 'goals', goalId);
      await updateDoc(goalDocRef, data);
    } else { // Adding new goal
      await addDoc(goalsCollectionRef, data);
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

      await handleSaveReflection(data.summary);
      
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

  const handleAdjustPomodoros = async (taskId: string, amount: number) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
    const taskToAdjust = tasks.find(t => t.id === taskId);
    if (taskToAdjust) {
      const newCount = taskToAdjust.pomodorosCompleted + amount;
      await updateDoc(taskDocRef, {
        pomodorosCompleted: newCount >= 0 ? newCount : 0,
        updatedAt: new Date().toISOString(),
      });
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
      setTaskDeadline(taskToEdit.deadline || '');
      setSubtaskParentId(null);
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
    const taskToToggle = tasks.find(t => t.id === taskId);
    if (taskToToggle) {
      await updateDoc(taskDocRef, {
        status: taskToToggle.status === 'Done' ? 'To Do' : 'Done',
        updatedAt: new Date().toISOString(),
      });
    }
  };
  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await deleteDoc(taskDocRef);
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
            onOpenGoalManager={() => setIsGoalManagerOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onSignOut={handleSignOut}
          />
            {
              isGoalManagerOpen && (
                <GoalManager
                  goals={goals}
                  activeGoalMilestones={currentMilestones}
                  expandedGoalId={expandedGoalId}
                  onGoalSave={handleGoalSave}
                  onGoalDelete={handleDeleteGoal}
                  onMilestoneSave={handleSaveMilestone}
                  onMilestoneToggle={handleToggleMilestoneStatus}
                  onMilestoneDelete={handleDeleteMilestone}
                  onExpandGoal={setExpandedGoalId}
                  progressByGoal={streak}
                  onClose={() => {
                    setIsGoalManagerOpen(false);
                    setExpandedGoalId(null);
                  }}
                />
              )
            }
            {isProfileOpen && user && (
            <UserProfile user={user} topStreaks={topStreaks} onClose={() => setIsProfileOpen(false)} />
          )}
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
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-start mt-4">
            <ControlPanel
              goals={goals}
              selectedFocusGoalId={selectedFocusGoalId}
              onFocusGoalChange={setSelectedFocusGoalId}
              dailyMission={dailyMission}
              onMissionChange={setDailyMission}
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
              onFormSubmit={handleSubmit}
              onCancelEdit={resetFormState}
            />
              <div className="lg:col-span-1">
              <h2 className="text-xl font-bold mb-4">Today&quot;s Tasks</h2>
              <TaskList
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                timerIsActive={isActive}
                onTaskClick={setSelectedTaskId}
                onAddSubtask={handleAddSubtask}
                onDelete={handleDeleteTask}
                onToggleStatus={handleToggleStatus}
                onEdit={handleStartEditing}
                onAdjustPomodoros={handleAdjustPomodoros}
                />
                </div>
              </div>
          </>
          ) : (
            <Auth />
          )}
      </main>
  );
}
