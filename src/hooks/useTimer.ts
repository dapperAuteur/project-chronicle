'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [secondsLeft, setSecondsLeft] = useState(focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  // Store the exact timestamp when the timer should end.
  const endTimeRef = useRef<number | null>(null);

  // The intervalRef remains the same
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const switchMode = useCallback(() => {
  // The 'mode' variable here holds the value of the session that JUST finished.
  onSessionComplete(mode);

  const nextMode = mode === 'focus' ? 'break' : 'focus';
  const nextDurationInSeconds = (nextMode === 'focus' ? focusDuration : breakDuration) * 60;

  // Set up the state for the upcoming session.
  setMode(nextMode);
  setSecondsLeft(nextDurationInSeconds);
  
  // Set the end time for the new session, in case it starts right away.
  endTimeRef.current = Date.now() + nextDurationInSeconds * 1000;

  // --- THE FIX ---
  // Only automatically start the timer if we are transitioning from 'focus' to 'break'.
  if (mode === 'focus') {
    // We just finished a focus session, so automatically start the break.
    setIsActive(true);
  } else {
    // We just finished a break session, so PAUSE the timer.
    setIsActive(false);
  }
}, [mode, focusDuration, breakDuration, onSessionComplete]);

  // This function now just clears the interval
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  // This is the core timer loop
  useEffect(() => {
    if (isActive) {
      // Set the end time when the timer starts/resumes
      if (endTimeRef.current === null) {
        endTimeRef.current = Date.now() + secondsLeft * 1000;
      }

      intervalRef.current = setInterval(() => {
        const newSecondsLeft = Math.round((endTimeRef.current! - Date.now()) / 1000);
        
        if (newSecondsLeft <= 0) {
          stopTimer();
          switchMode();
        } else {
          setSecondsLeft(newSecondsLeft);
        }
      }, 1000);
    } else {
      stopTimer();
      // When paused, nullify the end time so it gets recalculated on resume
      endTimeRef.current = null;
    }

    return () => stopTimer();
  }, [isActive, switchMode, stopTimer]);
  
  // --- NEW: HANDLE PAGE VISIBILITY ---
  // This effect runs once to add an event listener.
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If the page is not visible or the timer isn't running, do nothing.
      if (document.hidden || !isActive || !endTimeRef.current) {
        return;
      }
      
      // When the page becomes visible again, recalculate the time left.
      const newSecondsLeft = Math.round((endTimeRef.current - Date.now()) / 1000);

      if (newSecondsLeft <= 0) {
        // If the timer finished while away, stop it and switch modes.
        stopTimer();
        switchMode();
      } else {
        // Otherwise, just update the state with the correct time.
        setSecondsLeft(newSecondsLeft);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, switchMode, stopTimer]);


  useEffect(() => {
    setSecondsLeft(focusDuration * 60);
  }, [focusDuration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    stopTimer();
    setIsActive(false);
    endTimeRef.current = null; // Reset end time
    setSecondsLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
  };

  return {
    minutes: Math.floor(secondsLeft / 60),
    seconds: secondsLeft % 60,
    isActive,
    toggleTimer,
    resetTimer,
    focusDuration,
    setFocusDuration,
    breakDuration,
    setBreakDuration,
  };
};