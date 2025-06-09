'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseTimerProps {
  initialFocusDuration: number;
  initialBreakDuration: number;
  onSessionComplete: (completedMode: 'focus' | 'break') => void;
}

export function useTimer({
  initialFocusDuration,
  initialBreakDuration,
  onSessionComplete,
}: UseTimerProps) {
  const [focusDuration, setFocusDuration] = useState(initialFocusDuration);
  const [breakDuration, setBreakDuration] = useState(initialBreakDuration);
  const [timeRemaining, setTimeRemaining] = useState(focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  // Effect to handle the countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isActive) {
      // Announce session completion and switch modes
      new Audio('/sounds/its_time.wav').play();
      onSessionComplete(mode);
      
      const newMode = mode === 'focus' ? 'break' : 'focus';
      setMode(newMode);
      setTimeRemaining(newMode === 'focus' ? focusDuration * 60 : breakDuration * 60);
      setIsActive(newMode === 'break'); // Auto-start breaks
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining, mode, focusDuration, breakDuration, onSessionComplete]);

  // Effect to update timer if duration settings change while paused
  useEffect(() => {
    if (!isActive) {
      setTimeRemaining(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    }
  }, [focusDuration, breakDuration, mode, isActive]);

  const toggleTimer = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMode('focus');
    setTimeRemaining(focusDuration * 60);
  }, [focusDuration]);
  
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return {
    minutes,
    seconds,
    isActive,
    mode,
    toggleTimer,
    resetTimer,
    focusDuration,
    setFocusDuration,
    breakDuration,
    setBreakDuration,
  };
}
