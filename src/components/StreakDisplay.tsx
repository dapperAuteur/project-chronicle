'use client';

interface StreakDisplayProps {
  count: number;
}

export default function StreakDisplay({ count }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
      <span className="text-2xl" role="img" aria-label="flame emoji">🔥</span>
      <div>
        <p className="font-bold text-xl">{count}</p>
        <p className="text-xs text-gray-400">Day Streak</p>
      </div>
    </div>
  );
}