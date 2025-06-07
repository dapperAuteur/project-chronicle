# Project Chronicle: Development Plan & Roadmap

## 1. Overview

This document outlines the phased development plan to build the "Project Chronicle" application. The approach is to start with a Minimum Viable Product (MVP) that delivers immediate value and then iteratively add features across subsequent phases, building towards the final vision.

## 2. Development Phases

---

### **Phase 1: The MVP - Core Task & Pomodoro Time Tracking**

* **Primary Goal:** To create a functional, single-user task tracker that works entirely on a single device, establishing the core data structure.
	* Single-user task tracker built around the Pomodoro Technique
* **Key Features & Deliverables:**
    - [ ] A form to create tasks with Name, Category, Priority, Notes, and Status.
    - [ ] A view to list all tasks for the current day.
    - [ ] **An adjustable Pomodoro clock (25/5 default) on the main UI.**
    - [ ] Ability to edit and delete tasks.
    - [ ] ~~A real-time start/stop timer on each task item.~~
    - [ ] - **Ability to assign the _active Pomodoro session_ to a specific task.**
	[ ] **When a focus session ends, the app logs one completed Pomodoro cycle to that task.**
    - [ ] An input field to manually set or override the time spent on a task.
    - [ ] A simple text field for a "Daily Focus."
    - [ ] All data persists on the user's device.
* **Technology Stack:**
    * **Framework:** Next.js
    * **Data Storage:** Browser Local Storage

---

### **Phase 2: Cloud Sync & User Foundation**

* **Primary Goal:** To enable multi-device access and secure data backup.
* **Key Features & Deliverables:**
    - [ ] User authentication system (e.g., email/password).
    - [ ] Set up a cloud database (e.g., Firestore).
    - [ ] Logic to sync task data between the local device and the cloud.
    - [ ] User profile page.
* **Technology Stack:**
    * **Backend:** Next.js API Routes
    * **Database:** Cloud Firestore or Supabase
    * **Auth:** Firebase Authentication or similar

---

### **Phase 3: Enhancing the UX & Initial On-Device AI**

* **Primary Goal:** To make the app more engaging and introduce the first layer of intelligence.
* **Key Features & Deliverables:**
    - [ ] Implement the full Daily, Weekly, and Monthly focus/reflection system.
    - [ ] Add push notifications for reminders (requires PWA configuration).
    - [ ] Introduce gamification: points and streaks.
    - [ ] **Integrate TensorFlow.js into the application.**
    - [ ] **Create the first on-device AI feature: A simple recurring task suggester.**
* **Technology Stack:**
    * **On-Device AI:** TensorFlow.js

---

### **Phase 4: Project Management Layer**

* **Primary Goal:** To evolve the app from a task tracker to a goal management tool.
* **Key Features & Deliverables:**
    - [ ] Data models for "Projects" that contain tasks.
    - [ ] UI to create and manage projects.
    - [ ] Ability to assign tasks to projects and create sub-tasks.
    - [ ] Basic progress visualization dashboards for projects.
* **Technology Stack:**
    * Frontend and Backend logic for new data structures.

---

### **Phase 5: Activating the Full Hybrid AI Engine**

* **Primary Goal:** To leverage the full power of the hybrid AI model for advanced insights and generative assistance.
* **Key Features & Deliverables:**
    - [ ] Build the Python backend service for heavy-duty model training.
    - [ ] Create the pipeline for the Python service to train new models and send them to the user's device.
    - [ ] Implement advanced predictive features (e.g., smarter time estimation).
    - [ ] Integrate Gemini Nano (via available APIs) for generative tasks like reflection summaries and sub-task suggestions.
* **Technology Stack:**
    * **Cloud AI:** Python (TensorFlow, scikit-learn)
    * **Generative AI:** Gemini Nano API
    * **Infrastructure:** Serverless functions or container service for the Python backend.