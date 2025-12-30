import { useState, useEffect } from 'react';

interface UseTimerProps {
  timeLimit: number | null;
  isRunning: boolean;
  onTimeUp: () => void;
}

export const useTimer = ({ timeLimit, isRunning, onTimeUp }: UseTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimit);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft !== null) {
        if (timeLeft <= 0) {
            onTimeUp();
        } else {
            interval = setInterval(() => {
                setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return {
    timeLeft,
    setTimeLeft,
    formatTime
  };
};

