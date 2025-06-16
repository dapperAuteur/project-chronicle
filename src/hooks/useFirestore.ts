'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
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
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Goal } from "@/types/goal";
import { Task } from "@/types/task";
import { Milestone } from "@/types/milestone";

export function useFirestore(user: User | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streak, setStreak] = useState(0);
  const [topStreaks, setTopStreaks] = useState<number[]>([]);

  useEffect(() => {
    if (!user) {
      // Clear all data if user logs out
      setTasks([]);
      setGoals([]);
      setStreak(0);
      setTopStreaks([]);
      return;
    }

    const unsubscribers: Unsubscribe[] = [];
    
    // Listener for TASKS collection
    const tasksQuery = query(collection(db, 'users', user.uid, 'tasks'));
    unsubscribers.push(onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Task));
    }));

    // Listener for GOALS collection
    const goalsQuery = query(collection(db, 'users', user.uid, 'goals'));
    unsubscribers.push(onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Goal));
    }));

    // Listener for STATS document
    const statsDocRef = doc(db, 'users', user.uid, 'stats', 'user_stats');
    unsubscribers.push(onSnapshot(statsDocRef, (doc) => {
        const data = doc.data();
        setStreak(data?.reflectionStreak || 0);
        setTopStreaks(data?.topStreaks || []);
    }));

    // Cleanup all listeners when the user changes or component unmounts
    return () => unsubscribers.forEach(unsub => unsub());
  }, [user]); // This effect re-runs when the user object changes

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'tasks'), taskData);
  };
  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), taskData);
  };
  const deleteTask = async (taskId: string) => {
    if (!user) return;
    // Add recursive delete for sub-tasks if needed
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
  };
  
  const addGoal = async (goalData: Omit<Goal, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'goals'), goalData);
  };
  const updateGoal = async (goalId: string, goalData: Partial<Goal>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'goals', goalId), goalData);
  };
  const deleteGoal = async (goalId: string) => {
    if (!user) return;
    const goalDocRef = doc(db, 'users', user.uid, 'goals', goalId);
    await deleteDoc(goalDocRef);
  };
  const archiveGoal = async (goalId: string) => {
    if (!user) return;
    const goalDocRef = doc(db, 'users', user.uid, 'goals', goalId);
    await updateDoc(goalDocRef, { isArchived: true });
  };
  const unarchiveGoal = async (goalId: string) => {console.log('goalId :>> ', goalId);
    if (!user) return;
    const goalDocRef = doc(db, 'users', user.uid, 'goals', goalId);
    await updateDoc(goalDocRef, { isArchived: false });
  };

  const moveMilestone = async (milestoneId: string, oldGoalId: string, newGoalId: string) => {
    if (!user) return;
    if (!user || !milestoneId || !oldGoalId || !newGoalId || oldGoalId === newGoalId) {
      console.error("Invalid parameters for moveMilestone or oldGoalId is the same as newGoalId.");
      return;
    }

    const oldMilestoneDocRef = doc(db, 'users', user.uid, 'goals', oldGoalId, 'milestones', milestoneId);
    // The new milestone will reside in the milestones subcollection of the newGoalId
    const newMilestoneDocRef = doc(db, 'users', user.uid, 'goals', newGoalId, 'milestones', milestoneId);

    try {
      const milestoneSnap = await getDoc(oldMilestoneDocRef);

      if (!milestoneSnap.exists()) {
        console.error(`Milestone with ID ${milestoneId} not found in goal ${oldGoalId}. Cannot move.`);
        return;
      }

      const milestoneData = milestoneSnap.data();
      
      // Prepare the data for the new milestone document, ensuring its internal goalId field is updated.
      const newMilestoneData = {
        ...milestoneData,
        goalId: newGoalId 
      };

      // Write the document to the new location
      await setDoc(newMilestoneDocRef, newMilestoneData);

      // Delete the document from the old location
      await deleteDoc(oldMilestoneDocRef);

    } catch (error) {
      console.error("Error moving milestone:", error);
    }
  };

  const updateMilestone = async (goalId: string, milestoneId: string, data: Partial<Milestone>) => {
    if (!user) return;
    const milestoneRef = doc(db, 'users', user.uid, 'goals', goalId, 'milestones', milestoneId);
    await updateDoc(milestoneRef, data);
  };

  const saveReflection = async (reflectionText: string, todayStr: string) => {
    if (!user) return;
    const statsDocRef = doc(db, 'users', user.uid, 'stats', 'user_stats');
    const statsDoc = await getDoc(statsDocRef);
    let { reflectionStreak: cs = 0, lastReflectionDate: ld = '', topStreaks: ts = [] } = statsDoc.data() || {};
    // ... streak logic ...
    await setDoc(doc(db, 'users', user.uid, 'daily_reflection', todayStr), { text: reflectionText, date: todayStr }, { merge: true });
    await setDoc(statsDocRef, { reflectionStreak: cs, lastReflectionDate: todayStr, topStreaks: ts }, { merge: true });
  };
  
  // Return both the data and the functions to modify it
  return { 
    tasks, goals, streak, topStreaks,
    addTask, updateTask, deleteTask,
    addGoal, updateGoal, deleteGoal,
    saveReflection, archiveGoal, unarchiveGoal,
    moveMilestone, updateMilestone,
  };
}
