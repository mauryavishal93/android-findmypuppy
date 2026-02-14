import React from 'react';
import { ThemeConfig } from '../types';
import { DailyCheckInData } from '../types/dailyCheckIn';

interface DailyCheckInButtonProps {
  checkInData: DailyCheckInData | null;
  loading: boolean;
  onClick: () => void;
  activeTheme: ThemeConfig;
}

export const DailyCheckInButton: React.FC<DailyCheckInButtonProps> = ({
  checkInData,
  loading,
  onClick,
  activeTheme
}) => {
  const hasCheckedInToday = checkInData?.hasCheckedInToday || false;
  const streak = checkInData?.checkInStreak || 0;

  const getButtonText = () => {
    if (hasCheckedInToday) {
      return "✓ Checked In Today!";
    }
    return "🎁 Daily Check-In";
  };

  const getStreakText = () => {
    if (streak > 0) {
      return `🔥 ${streak} Day Streak!`;
    }
    return "Start Your Streak!";
  };

  const streakFreezeAvailable = (checkInData as { streakFreezeAvailable?: boolean })?.streakFreezeAvailable;
  const hasUsedFreezeThisWeek = (checkInData as { hasUsedFreezeThisWeek?: boolean })?.hasUsedFreezeThisWeek;

  return (
    <button
      onClick={onClick}
      disabled={hasCheckedInToday || loading}
      className={`
        w-full relative overflow-hidden rounded-lg p-2 border-2 transition-all duration-300
        ${hasCheckedInToday 
          ? `${activeTheme.accent}/30 border-${activeTheme.accent}/50 cursor-not-allowed opacity-60` 
          : `${activeTheme.button} border-${activeTheme.accent} hover:scale-105 hover:shadow-xl cursor-pointer`
        }
        ${loading ? 'opacity-50 cursor-wait' : ''}
      `}
      style={{
        background: hasCheckedInToday 
          ? `linear-gradient(135deg, ${activeTheme.cardBg} 0%, ${activeTheme.accent}/20 100%)`
          : `linear-gradient(135deg, ${activeTheme.accent} 0%, ${activeTheme.button} 100%)`,
        boxShadow: hasCheckedInToday 
          ? 'none'
          : `0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`
      }}
    >
      {/* Background Pattern - Reduced */}
      <div className="absolute inset-0 opacity-8">
        <div className="absolute top-1 left-1 text-lg">🐕</div>
        <div className="absolute bottom-1 right-1 text-base">🎁</div>
      </div>

      {/* Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className={`text-sm font-black ${activeTheme.text} text-center`}>
          {loading ? '⏳ Loading...' : getButtonText()}
        </div>
        <div className={`text-xs font-bold ${activeTheme.subText} text-center mt-0.5`}>
          {getStreakText()}
        </div>
        {checkInData && checkInData.totalCheckIns > 0 && (
          <div className={`text-[10px] mt-0.5 ${activeTheme.subText} text-center`}>
            Total: {checkInData.totalCheckIns} check-ins
          </div>
        )}
        {streakFreezeAvailable && !hasUsedFreezeThisWeek && streak > 0 && (
          <div className="text-[9px] mt-0.5 text-amber-600 dark:text-amber-400 font-bold text-center">🧊 1 freeze this week</div>
        )}
      </div>

      {/* Streak Badge - Positioned */}
      {streak > 0 && !hasCheckedInToday && (
        <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black animate-pulse">
          {streak}
        </div>
      )}

      {/* Checkmark - Positioned */}
      {hasCheckedInToday && (
        <div className="absolute top-1 right-1 text-xl animate-bounce">✓</div>
      )}
    </button>
  );
};
