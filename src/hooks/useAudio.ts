// In hooks/useAudio.ts
'use client';

import { useState, useEffect, useMemo } from 'react';

export const useAudio = (url: string) => {
  // useMemo ensures the Audio object is created only once
  const audio = useMemo(() => typeof Audio !== "undefined" ? new Audio(url) : undefined, [url]);
  
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    if (audio) {
      if (playing) {
        audio.play().catch(err => console.error("Audio play failed:", err));
      } else {
        audio.pause();
      }
    }
  }, [playing, audio]);

  useEffect(() => {
    if (audio) {
      const handleEnded = () => setPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audio]);
  
  // Return a function to manually trigger play
  const play = () => {
    if (audio) {
      audio.play().catch(err => console.error("Audio play failed:", err));
    }
  };

  return play;
};