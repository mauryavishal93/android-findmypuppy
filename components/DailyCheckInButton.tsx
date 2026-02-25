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
  // While checkInData is null the server hasn't responded yet — treat as not completed
  const dataLoaded = checkInData !== null;
  const hasCheckedInToday = dataLoaded ? (checkInData?.hasCheckedInToday ?? false) : false;
  const streak = checkInData?.checkInStreak || 0;

  const getButtonText = () => {
    if (!dataLoaded || loading) return "⏳ Loading...";
    if (hasCheckedInToday) return "✓ Checked In Today!";
    return "🎁 Daily Check-In";
  };

  const getStreakText = () => {
    if (!dataLoaded) return "";
    if (streak > 0) return `🔥 ${streak} Day Streak!`;
    return "Start Your Streak!";
  };

  const streakFreezeAvailable = (checkInData as { streakFreezeAvailable?: boolean })?.streakFreezeAvailable;
  const hasUsedFreezeThisWeek = (checkInData as { hasUsedFreezeThisWeek?: boolean })?.hasUsedFreezeThisWeek;

  return (
    <button
      // Always clickable — never disabled — so the puppy modal opens even after check-in
      onClick={onClick}
      type="button"
      className={`
        w-full h-full relative overflow-hidden rounded-lg p-2 border-2
        transition-all duration-200 select-none
        active:scale-95 touch-manipulation
        ${hasCheckedInToday
          ? 'cursor-pointer opacity-80'
          : 'cursor-pointer hover:scale-105 hover:shadow-xl'
        }
        ${loading ? 'opacity-50 cursor-wait' : ''}
      `}
      style={{
        background: hasCheckedInToday
          ? 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(217,119,6,0.15) 100%)'
          : `linear-gradient(135deg, ${activeTheme.accent} 0%, ${activeTheme.button} 100%)`,
        borderColor: hasCheckedInToday ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.3)',
        boxShadow: hasCheckedInToday
          ? 'none'
          : '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
        // Ensure the entire button surface is tappable
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* Content — pointer-events:none so child elements never block the button tap */}
      <div className="pointer-events-none flex flex-col items-center justify-center w-full h-full">
        <div className={`text-sm font-black ${activeTheme.text} text-center leading-tight`}>
          {loading ? '⏳ Loading...' : getButtonText()}
        </div>
        <div className={`text-xs font-bold ${activeTheme.subText} text-center mt-0.5 leading-tight`}>
          {getStreakText()}
        </div>
        {checkInData && checkInData.totalCheckIns > 0 && (
          <div className={`text-[10px] mt-0.5 ${activeTheme.subText} text-center leading-tight`}>
            Total: {checkInData.totalCheckIns} check-ins
          </div>
        )}
        {streakFreezeAvailable && !hasUsedFreezeThisWeek && streak > 0 && (
          <div className="text-[9px] mt-0.5 text-amber-600 font-bold text-center">🧊 1 freeze this week</div>
        )}
      </div>

      {/* Streak badge */}
      {streak > 0 && !hasCheckedInToday && (
        <div className="pointer-events-none absolute top-1 right-1 bg-yellow-400 text-yellow-900 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">
          {streak}
        </div>
      )}

      {/* Checkmark */}
      {hasCheckedInToday && (
        <div className="pointer-events-none absolute top-1 right-1 text-base">✓</div>
      )}
    </button>
  );
};
