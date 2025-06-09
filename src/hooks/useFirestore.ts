'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  query,
  onSnapshot,
  doc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Goal } from "@/types/goal";
import { Task } from "@/types/task";

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

  return { tasks, goals, streak, topStreaks };
}
