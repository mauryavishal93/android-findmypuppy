import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { DailyCheckInData } from '../types/dailyCheckIn';

interface UseDailyCheckInProps {
  username: string | null;
  onPointsUpdated?: (newPoints: number) => void;
  onHintsUpdated?: (newHints: number) => void;
}

export const useDailyCheckIn = ({ username, onPointsUpdated, onHintsUpdated }: UseDailyCheckInProps) => {
  const [checkInData, setCheckInData] = useState<DailyCheckInData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!username) return;
    
    setLoading(true);
    try {
      const response = await db.getDailyCheckInStatus(username);
      if (response.success) {
        setCheckInData({
          lastCheckInDate: response.lastCheckInDate || null,
          checkInStreak: response.checkInStreak || 0,
          totalCheckIns: response.totalCheckIns || 0,
          hasCheckedInToday: response.hasCheckedInToday || false,
          puppyAge: response.puppyAge || 0,
          puppySize: response.puppySize || 1.0
        });
      }
    } catch (error) {
      console.error('Failed to load daily check-in status:', error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const completeCheckIn = useCallback(async (): Promise<{ 
    success: boolean; 
    hintsEarned?: number; 
    pointsEarned?: number;
    puppyAge?: number;
    puppySize?: number;
    milestone?: '7days' | '30days' | '1year' | null;
  }> => {
    if (!username) return { success: false };

    setLoading(true);
    try {
      const response = await db.completeDailyCheckIn(username);
      if (response.success) {
        // Reload status
        await loadStatus();
        
        // Notify parent about points/hints updates
        if (onPointsUpdated && response.totalPoints !== undefined) {
          onPointsUpdated(response.totalPoints);
        }
        if (onHintsUpdated && response.totalHints !== undefined) {
          onHintsUpdated(response.totalHints);
        }

        return {
          success: true,
          hintsEarned: response.hintsEarned,
          pointsEarned: response.pointsEarned,
          puppyAge: response.puppyAge,
          puppySize: response.puppySize,
          milestone: response.milestone
        };
      }
      return { success: false };
    } catch (error) {
      console.error('Failed to complete daily check-in:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [username, loadStatus, onPointsUpdated, onHintsUpdated]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  return {
    checkInData,
    loading,
    loadStatus,
    completeCheckIn
  };
};
