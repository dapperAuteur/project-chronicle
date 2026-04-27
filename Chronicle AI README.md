# Chronicle AI: The Mindful Achievement System

**Chronicle AI is not just another to-do list—it's an intelligent, privacy-first system designed to connect your daily actions to your long-term ambitions.** By integrating goal setting, project management, and focused work sessions, it transforms everyday tasks into meaningful progress towards what matters most.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://your-live-demo-link.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

![Chronicle AI Screenshot](https://placehold.co/1200x600/111827/E5E7EB?text=Chronicle+AI+App+Screenshot)
*(Add a high-quality screenshot or GIF of the application here)*

---

## ✨ Core Philosophy

In a world of constant distraction, Chronicle AI is built on a simple premise: **intentional work is effective work.** The application is architected around a powerful core loop designed to foster mindful productivity:

1.  **Set High-Level Goals:** Define your life's big ambitions.
2.  **Break Them Down:** Create tangible **Milestones** for each goal.
3.  **Plan Your Day:** Set a **Daily Focus** by choosing a goal to work towards.
4.  **Execute with Focus:** Create tasks and link them to milestones. Use the integrated **Pomodoro Timer** to perform deep, uninterrupted work.
5.  **Reflect and Grow:** At the end of the day, use the **AI-assisted Daily Reflection** to understand your progress and build momentum.

---

## 🚀 Key Features

Chronicle AI is packed with features designed for a complete project and life management experience.

* **Hierarchical Planning:**
    * **Goals:** Define up to 3 major life goals with deadlines.
    * **Milestones:** Break down goals into manageable project phases with progress bars.
    * **Tasks & Sub-tasks:** Create a nested hierarchy of tasks and link them to specific milestones.

* **Intelligent Task Management:**
    * Full CRUD (Create, Read, Update, Delete) functionality for all tasks.
    * Drag-and-drop functionality (Future Feature).
    * Assign priority, categories, notes, and deadlines to each task.

* **Focus & Time Management:**
    * Integrated, adjustable **Pomodoro Timer** to encourage focused work sessions.
    * Automatically track completed Pomodoros against estimated work for each task.

* **AI-Powered Insights:**
    * **On-Device AI:**
        * **Category Suggestion:** Automatically suggests a task category based on keywords as you type.
        * **Pomodoro Estimation:** Predicts the number of Pomodoros a task will take based on its name.
    * **Cloud AI (Google Gemini):**
        * **AI-Drafted Reflections:** Generates an encouraging one-sentence summary of your day's accomplishments to kickstart your daily reflection.

* **Gamification & Motivation:**
    * **Daily Streaks:** Tracks your consistency for completing daily reflections.
    * **Top 5 High Scores:** Saves your longest streaks to provide a personal best to aim for.
    * **Weekly Progress Reports:** A visual dashboard with charts summarizing your productivity, including total focus time, work breakdown by category, and your most productive days.

* **Secure User Experience:**
    * Full user authentication (Sign Up, Log In, Sign Out).
    * Secure user profile management, including password and email changes.
    * **Real-time & Offline:** All data is synced in real-time with Firestore and is fully accessible offline, with changes automatically synced upon reconnection.

---

## 🛠️ Tech Stack & Architecture

This project was built using a modern, scalable, and type-safe technology stack, demonstrating best practices in web development.

| Category      | Technology / Service                                      |
| :------------ | :-------------------------------------------------------- |
| **Frontend** | `Next.js` (App Router), `React`, `TypeScript`, `Tailwind CSS` |
| **Backend** | `Firebase` (Authentication, Firestore Real-time Database) |
| **API Layer** | `Next.js API Routes` (for secure server-side AI calls)    |
| **Deployment**| `Vercel`                                                  |
| **AI** | `Google Gemini API` (Cloud), `Keyword-based models` (On-Device) |

### Architectural Highlights

* **Component-Based Architecture:** The UI is composed of small, reusable React components.
* **Custom Hooks:** Logic is decoupled from the UI through custom hooks (`useAuth`, `useFirestore`, `useTimer`, `usePrediction`), making the codebase clean and maintainable.
* **Real-time Data Synchronization:** Leverages Firestore's `onSnapshot` listener to ensure the UI is always up-to-date across all devices, instantly.
* **Offline-First:** Implements Firestore's offline persistence, caching data locally in IndexedDB to provide a seamless user experience even without an internet connection.
* **Secure API Design:** The Google Gemini API key is securely stored in environment variables and only accessed via a dedicated Next.js API route, never exposing it to the client.

---

## 📦 Getting Started

To run this project locally, follow these steps:

### Prerequisites

* Node.js (v18 or later)
* npm or yarn
* A Firebase account

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/dapperAuteur/project-chronicle.git](https://github.com/dapperAuteur/project-chronicle.git)
    cd project-chronicle
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your Firebase project:**
    * Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    * Enable **Authentication** (Email/Password provider).
    * Create a **Firestore Database**.

4.  **Set up Environment Variables:**
    * Create a file named `.env.local` in the root of the project.
    * In your Firebase project settings, find your web app's configuration keys and add them to the file.
    * Create a [Google AI Studio API key](https://aistudio.google.com/app/apikey) and add it.

    ```
    # .env.local

    # Firebase Keys
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...

    # Google AI Key
    GEMINI_API_KEY=AIza...
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 👤 Contact

[Brand Anthony McDonald] – [Portfolio Site](https://i.brandanthonymcdonald.com/portfolio) – [bam@awews.com]

[Link to your LinkedIn Profile](https://l.awews.com/brand-am-linkedin)

