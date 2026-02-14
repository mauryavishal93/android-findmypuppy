import { useState, useCallback, useEffect } from 'react';
import { db } from '../services/db';

export function useDailyPuzzle(username: string | null) {
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await db.getDailyPuzzleStatus(username);
      if (res.success) setHasCompletedToday(res.hasCompletedToday ?? false);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const completePuzzle = useCallback(
    async (puzzleId: string, score: number): Promise<{ success: boolean; hintsEarned?: number; totalHints?: number; highScore?: number }> => {
      if (!username) return { success: false };
      setLoading(true);
      try {
        const res = await db.completeDailyPuzzle(username, puzzleId, score);
        if (res.success) setHasCompletedToday(true);
        return {
          success: res.success ?? false,
          hintsEarned: res.hintsEarned,
          totalHints: res.totalHints,
          highScore: res.highScore
        };
      } finally {
        setLoading(false);
      }
    },
    [username]
  );

  return { hasCompletedToday, loading, loadStatus, completePuzzle };
}
