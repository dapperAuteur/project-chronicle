import { Task } from '@/types/task'; // Adjust the import path as needed

/**
 * Retrieves all completed tasks to be used as a dataset for model training.
 * For now, we'll simulate this with mock data. In the future, this will
 * read from your database (Firebase).
 *
 * @returns {Task[]} An array of completed task objects.
 */
export const getCompletedTasksForTraining = (): Task[] => {
  // --- IMPORTANT ---
  // In the future, you will replace this mock data with a real call
  // to Firebase to get all tasks where status === 'completed'.
  // For now, we use this mock data to build and test the AI logic.

  console.log("Fetching completed tasks for training...");

  const mockTasks: Task[] = [
    {
      id: '1',
      name: 'Draft project proposal',
      category: 'work',
      priority: 'High',
      notes: 'Initial draft for the Q3 project review.',
      status: 'Done',
      pomodorosCompleted: 55, // in minutes
      pomodorosEstimated: 60, // in minutes
      parentId: null,
      createdAt: '2025-06-01',
      updatedAt: '2025-06-01',
    },
    {
      id: '2',
      name: 'Research Next.js authentication libraries',
      category: 'development',
      priority: 'Medium',
      notes: 'Look into NextAuth.js and Lucia-auth.',
      status: 'Done',
      pomodorosCompleted: 75,
      pomodorosEstimated: 60, // in minutes
      parentId: null,
      createdAt: '2025-06-02',
      updatedAt: '2025-06-02',
    },
    {
      id: '3',
      name: 'Design the new dashboard UI',
      category: 'design',
      priority: 'High',
      notes: 'Focus on the main KPI widgets.',
      status: 'Done',
      pomodorosCompleted: 120,
      pomodorosEstimated: 60, // in minutes
      parentId: null,
      createdAt: '2025-06-03',
      updatedAt: '2025-06-03',
    },
    {
      id: '4',
      name: 'Call the accountant',
      category: 'finance',
      priority: 'Low',
      notes: '',
      status: 'Done',
      pomodorosCompleted: 15,
      pomodorosEstimated: 60, // in minutes
      parentId: null,
      createdAt: '2025-06-04',
      updatedAt: '2025-06-04',
    },
    {
      id: '5',
      name: 'Add Offline Mode to the app',
      category: 'Code',
      priority: 'High',
      notes: 'Use IndexedDB via Firebase to implement offline mode.',
      status: 'Done',
      pomodorosCompleted: 2,
      pomodorosEstimated: 2, // in minutes
      parentId: null,
      createdAt: '2025-06-04',
      updatedAt: '2025-06-04',
    },
    {
      id: '6',
      name: 'Add subtaks to Project Chronicles app',
      category: 'Code',
      priority: 'High',
      notes: 'Allow the user to add subtasks to existing tasks',
      status: 'Done',
      pomodorosCompleted: 4,
      pomodorosEstimated: 5, // in minutes
      parentId: null,
      createdAt: '2025-06-04',
      updatedAt: '2025-06-04',
    },
    {
      id: '7',
      name: 'Enhance UX & Add Initial On-Device AI',
      category: 'Code',
      priority: 'High',
      notes: 'Implement ARIA and accessibilty features to app. Add simple AI category predictor.',
      status: 'Done',
      pomodorosCompleted: 6,
      pomodorosEstimated: 10, // in minutes
      parentId: null,
      createdAt: '2025-06-04',
      updatedAt: '2025-06-04',
    },
    {
      id: '8',
      name: 'Add Cloud Sync and User Foundation to app',
      category: 'Code',
      priority: 'High',
      notes: 'enable the ability to sync on-device data with firebase firestore database and add user foundation',
      status: 'Done',
      pomodorosCompleted: 8,
      pomodorosEstimated: 10, // in minutes
      parentId: null,
      createdAt: '2025-06-04',
      updatedAt: '2025-06-04',
    },
    {
      id: '9',
      name: 'Stretch in Afternoon',
      category: 'Physical Fitness',
      priority: 'High',
      notes: 'do yoga stretches, find a short routine to do in the afternoon',
      status: 'Done',
      pomodorosCompleted: 1,
      pomodorosEstimated: 1, // in minutes
      parentId: null,
      createdAt: '2025-06-04',
      updatedAt: '2025-06-04',
    },
    {
      id: '10',
      name: 'Stretch in Morning',
      category: 'Physical Fitness',
      priority: 'High',
      notes: 'do yoga stretches, find a short routine to do in the morning',
      status: 'Done',
      pomodorosCompleted: 1,
      pomodorosEstimated: 1, // in minutes
      parentId: null,
      createdAt: '2025-06-04',
      updatedAt: '2025-06-04',
    },
    {
      id: '11',
      name: 'Implement Pomodoro Clock Feature and attach to task',
      category: 'Code',
      priority: 'High',
      notes: 'allow user to track how many pomodoro cycles each tack takes to be completed',
      status: 'Done',
      pomodorosCompleted: 16,
      pomodorosEstimated: 10, // in minutes
      parentId: null,
      createdAt: '2025-06-04',
      updatedAt: '2025-06-04',
    },
    // Add at least 6 more mock tasks to reach our minimum of 10
    // Try to vary the names, categories, and times spent
  ];

  return mockTasks;
};