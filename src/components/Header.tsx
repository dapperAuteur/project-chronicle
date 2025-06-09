'use client';

import { User } from 'firebase/auth';
import StreakDisplay from './StreakDisplay';

interface HeaderProps {
  user: User;
  streak: number;
  onOpenGoalManager: () => void;
  onOpenProfile: () => void;
  onOpenReport: () => void;
  onSignOut: () => void;
}

export default function Header({
  user,
  streak,
  onOpenReport,
  onOpenGoalManager,
  onOpenProfile,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="w-full">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-center mb-8 text-white">Project Chronicle</h1>
        <div className="w-full max-w-4xl mx-auto flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <p className="text-lg hidden sm:block">Welcome, {user.email}</p>
              <StreakDisplay count={streak} />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button onClick={onOpenGoalManager} className="bg-purple-600 hover:bg-purple-700 p-2 rounded-md font-bold text-white text-sm sm:text-base">
               🏆 Goals
              </button>
              <button onClick={onOpenReport} className="bg-green-600 hover:bg-green-700 p-2 rounded-md font-bold text-white text-sm sm:text-base">
               📈 Report
              </button>
              <button onClick={onOpenProfile} className="bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold text-sm sm:text-base">
               👤 Profile
              </button>
              <button onClick={onSignOut} className="bg-red-600 hover:bg-red-700 p-2 rounded-md font-bold text-sm sm:text-base">
                Sign Out
              </button>
            </div>
        </div>
    </header>
  );
}
