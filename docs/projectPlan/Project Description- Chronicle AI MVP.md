# Project Description: Chronicle AI (MVP)

## 1. Product Vision

To create a focused web application that helps users translate high-level ambitions into daily, actionable, and timed work sessions. The MVP validates the core loop of setting a goal-oriented daily intention, executing tasks using the Pomodoro technique, and reflecting on the progress made.

## 2. Core Philosophy (MVP)

- **Goal-Oriented:** Every day's work is framed in the context of a larger goal.
    
- **Focus-Driven:** The Pomodoro timer is the primary tool for executing tasks, emphasizing deep work and single-tasking.
    
- **Mindful Productivity:** The app guides the user through a daily cycle of setting an intention (Focus) and reviewing outcomes (Reflection).
    
- **Smart & Simple AI:** AI is used to provide immediate, helpful assistance (category suggestions) and to facilitate insight (reflection summaries), without adding complexity.
    

## 3. Key Features (MVP)

- **Goal Setting:**
    
    - Users can define, edit, and delete up to 3 primary, high-level goals.
        
- **Mindfulness Cycle:**
    
    - **Daily Focus:** At the start of the day, the user is prompted to select one of their primary goals as the day's main focus.
        
    - **Daily Reflection:** An end-of-day prompt encourages a brief written reflection on their progress.
        
- **Task Management:**
    
    - Users can add, edit, complete, and delete tasks for the current day.
        
    - Tasks are implicitly linked to the selected Daily Focus.
        
- **Time Management:**
    
    - An adjustable Pomodoro clock (defaulting to 25/5) is the central tool for working on tasks.
        
    - The user selects a task to work on before starting the timer.
        
    - The app tracks and displays the number of completed Pomodoro cycles for each task.
        
- **Simple AI Integration:**
    
    - **On-Device (Keyword-based):** Suggests a task category automatically based on words in the task name (e.g., "call," "design").
        
    - **Cloud-Based (Generative AI):** A "Draft Summary" button in the reflection view uses the day's completed tasks and focus to generate a one-sentence summary, providing a starting point for the user's reflection.