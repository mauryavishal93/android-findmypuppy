import React, { useState, useEffect, useRef } from 'react';
import { ThemeConfig } from '../types';

interface PuppyFeedingProps {
  onFeed: () => Promise<{
    success: boolean;
    hintsEarned?: number;
    pointsEarned?: number;
    puppyAge?: number;
    puppySize?: number;
    milestone?: '7days' | '30days' | '1year' | null;
    message?: string;
    usedStreakFreeze?: boolean;
  }>;
  onClose: () => void;
  activeTheme: ThemeConfig;
  puppyAge: number;
  puppySize: number;
  streak: number;
  hasCheckedInToday?: boolean;
}

// ── Puppy growth logic (UI hidden, logic kept) ────────────────────────────────
const GROWTH_STAGES = [
  { day: 1, emoji: '🐶', label: 'Newborn Pup',  scale: 0.65 },
  { day: 2, emoji: '🐶', label: 'Baby Pup',     scale: 0.80 },
  { day: 3, emoji: '🐕', label: 'Little Pup',   scale: 0.90 },
  { day: 4, emoji: '🐕', label: 'Medium Dog',   scale: 1.00 },
  { day: 5, emoji: '🐕‍🦺', label: 'Trained Dog', scale: 1.15 },
  { day: 6, emoji: '🦮', label: 'Big Dog',      scale: 1.30 },
  { day: 7, emoji: '🦮', label: 'Fully Grown',  scale: 1.50 },
];

interface BadgeStage {
  minDay: number;
  maxDay: number;
  badge: string;
  label: string;
  glowColor: string;
}

const BADGE_STAGES: BadgeStage[] = [
  { minDay: 8,   maxDay: 13,  badge: '🌟',      label: 'Star Dog',      glowColor: 'rgba(251,191,36,0.6)' },
  { minDay: 14,  maxDay: 20,  badge: '🏅',      label: 'Medalist',      glowColor: 'rgba(251,146,60,0.6)' },
  { minDay: 21,  maxDay: 29,  badge: '🥈',      label: 'Silver Pup',    glowColor: 'rgba(148,163,184,0.6)' },
  { minDay: 30,  maxDay: 30,  badge: '🥇',      label: 'Gold Champion', glowColor: 'rgba(234,179,8,0.7)' },
  { minDay: 31,  maxDay: 59,  badge: '🏆',      label: 'Trophy Dog',    glowColor: 'rgba(234,179,8,0.6)' },
  { minDay: 60,  maxDay: 89,  badge: '💎',      label: 'Diamond Dog',   glowColor: 'rgba(96,165,250,0.6)' },
  { minDay: 90,  maxDay: 179, badge: '👑',      label: 'Royal Dog',     glowColor: 'rgba(250,204,21,0.7)' },
  { minDay: 180, maxDay: 364, badge: '🌈',      label: 'Legend Dog',    glowColor: 'rgba(168,85,247,0.6)' },
  { minDay: 365, maxDay: Infinity, badge: '🌟👑🌟', label: 'Puppy Master', glowColor: 'rgba(255,215,0,0.8)' },
];

function getBadgeStage(streak: number): BadgeStage | null {
  return BADGE_STAGES.find(s => streak >= s.minDay && streak <= s.maxDay) || null;
}

function getGrowthStage(puppyAge: number) {
  return GROWTH_STAGES[Math.min(Math.max(puppyAge, 1), 7) - 1] || GROWTH_STAGES[6];
}

// ── Eating animation frames ───────────────────────────────────────────────────
// Alternates between puppy emoji and eating pose to simulate chewing
const EATING_FRAMES = ['😋', '🍖', '😋', '🍗', '😋', '🍖', '😋'];

// ── Component ─────────────────────────────────────────────────────────────────
export const PuppyFeeding: React.FC<PuppyFeedingProps> = ({
  onFeed,
  onClose,
  activeTheme,
  puppyAge,
  puppySize,
  streak,
  hasCheckedInToday = false,
}) => {
  const [isFeeding, setIsFeeding] = useState(false);
  const [isEating, setIsEating] = useState(false);
  const [eatFrame, setEatFrame] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [rewardHints, setRewardHints] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [rewardMilestone, setRewardMilestone] = useState<string | null>(null);
  const [rewardFroze, setRewardFroze] = useState(false);
  const eatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isBadgeStage = streak > 7;
  const growthStage = getGrowthStage(puppyAge);
  const badgeStage = getBadgeStage(streak);

  // Glow ring values
  const glowAlpha = isBadgeStage ? 0.6 : 0.1 + (puppyAge * 0.04);
  const glowRadius = isBadgeStage ? 32 : 8 + (puppyAge * 3);
  const glowColor = badgeStage?.glowColor || `rgba(251,191,36,${glowAlpha})`;

  // Puppy display emoji (idle)
  const idleEmoji = isBadgeStage ? '🦮' : growthStage.emoji;
  const puppyDisplaySize = Math.round(48 * (isBadgeStage ? 1.5 : growthStage.scale));

  // Clean up eating interval on unmount
  useEffect(() => {
    return () => {
      if (eatIntervalRef.current) clearInterval(eatIntervalRef.current);
    };
  }, []);

  const startEatingAnimation = () => {
    setIsEating(true);
    setEatFrame(0);
    let frame = 0;
    eatIntervalRef.current = setInterval(() => {
      frame += 1;
      setEatFrame(frame % EATING_FRAMES.length);
    }, 200); // flip every 200ms
  };

  const stopEatingAnimation = () => {
    if (eatIntervalRef.current) {
      clearInterval(eatIntervalRef.current);
      eatIntervalRef.current = null;
    }
    setIsEating(false);
    setEatFrame(0);
  };

  const handleFeed = async () => {
    setIsFeeding(true);
    startEatingAnimation();
    try {
      const result = await onFeed();
      stopEatingAnimation();
      if (result.success) {
        setRewardHints(result.hintsEarned || 0);
        setRewardPoints(result.pointsEarned || 0);
        setRewardMilestone(result.milestone || null);
        setRewardFroze(result.usedStreakFreeze || false);
        setRewardMessage(
          result.message ||
          (result.hintsEarned ? `Puppy fed! 🎉 +${result.hintsEarned} hints earned!` : 'Puppy fed! 🐕')
        );
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setTimeout(onClose, 500);
        }, 2500);
      }
    } catch {
      stopEatingAnimation();
    } finally {
      setIsFeeding(false);
    }
  };

  // Reward overlay icon
  const rewardIcon = rewardFroze ? '🧊' : rewardHints > 0 ? '🎁' : '🐕';

  // Current displayed emoji: eating frame or idle
  const currentEmoji = isEating ? EATING_FRAMES[eatFrame] : idleEmoji;
  const currentFontSize = isEating ? 56 : puppyDisplaySize;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-sm mx-4 ${activeTheme.cardBg} rounded-2xl border shadow-2xl overflow-hidden`}
        style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* ── Header ── */}
        <div className="flex justify-between items-center px-5 pt-5 pb-3 shrink-0">
          <h2 className={`text-xl font-black ${activeTheme.text}`}>🍖 Feed Your Puppy</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm hover:bg-red-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-5 pb-4 space-y-5">

          {/* ── Streak banner ── */}
          {streak > 0 && (
            <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              <span className="text-base">🔥</span>
              <span className="text-amber-700 font-black text-sm">{streak}-Day Streak!</span>
              <span className="text-base">🔥</span>
            </div>
          )}

          {/* ── Puppy display ── */}
          <div className="flex flex-col items-center gap-3">
            {/* Badge (Day 8+) */}
            {isBadgeStage && badgeStage && (
              <span
                className="text-3xl animate-bounce"
                style={{ filter: 'drop-shadow(0 0 8px rgba(234,179,8,0.8))' }}
              >
                {badgeStage.badge}
              </span>
            )}

            {/* Glow ring + puppy/eating emoji */}
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 130,
                height: 130,
                background: isEating
                  ? `radial-gradient(circle, rgba(251,191,36,0.7) 0%, transparent 70%)`
                  : `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                boxShadow: isEating
                  ? `0 0 32px 16px rgba(251,191,36,0.5)`
                  : `0 0 ${glowRadius}px ${glowRadius / 2}px ${glowColor}`,
                transition: 'box-shadow 0.2s ease, background 0.2s ease',
              }}
            >
              <span
                style={{
                  fontSize: currentFontSize,
                  lineHeight: 1,
                  transition: 'font-size 0.1s ease',
                  display: 'block',
                  // Wiggle when eating
                  animation: isEating ? 'none' : undefined,
                  transform: isEating && eatFrame % 2 === 0 ? 'rotate(-8deg) scale(1.1)' : isEating ? 'rotate(8deg) scale(1.05)' : 'none',
                }}
              >
                {currentEmoji}
              </span>
            </div>

            {/* Eating label */}
            {isEating && (
              <p className="text-amber-600 font-black text-sm animate-pulse">
                Nom nom nom... 😋
              </p>
            )}

            {/* Stage label (not eating) */}
            {!isEating && (
              <p className={`font-black text-sm ${activeTheme.text}`}>
                {isBadgeStage ? badgeStage?.label : growthStage.label}
              </p>
            )}

            {/* Streak info */}
            <p className={`text-xs ${activeTheme.subText}`}>
              {streak <= 7
                ? `Day ${puppyAge} / 7 · Streak: ${streak} days 🔥`
                : `Streak: ${streak} days 🔥`}
            </p>
          </div>

          {/* ── Streak Rewards only ── */}
          <div
            className={`rounded-xl border p-4 text-xs ${activeTheme.subText}`}
            style={{ borderColor: 'rgba(148,163,184,0.3)', background: 'rgba(148,163,184,0.06)' }}
          >
            <p className={`font-black text-[11px] mb-2 ${activeTheme.text}`}>🎁 Streak Rewards</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span>🎁</span>
                <span>7-day streak</span>
                <span className="ml-auto font-bold text-amber-600">+10 Hints</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎁</span>
                <span>30-day streak</span>
                <span className="ml-auto font-bold text-amber-600">+50 Hints</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎁</span>
                <span>365-day streak</span>
                <span className="ml-auto font-bold text-amber-600">+1000 Hints</span>
              </div>
              <div className="pt-1 border-t border-slate-200/50 text-[10px] opacity-60">
                +5 points every check-in
              </div>
            </div>
          </div>
        </div>

        {/* ── Feed button (sticky footer) ── */}
        <div className="px-5 pb-5 pt-2 shrink-0">
          {hasCheckedInToday ? (
            <div className="w-full py-4 rounded-xl text-center font-bold text-base bg-amber-50 border-2 border-amber-200 text-amber-600">
              ✅ Come back tomorrow!
            </div>
          ) : (
            <button
              onClick={handleFeed}
              disabled={isFeeding}
              className={`w-full py-4 rounded-xl font-black text-lg text-white transition-all duration-300 ${
                isFeeding ? 'opacity-70 cursor-wait scale-95' : 'hover:scale-105 hover:shadow-2xl cursor-pointer'
              }`}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 4px 15px rgba(217,119,6,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              {isFeeding ? '⏳ Feeding...' : '🍖 Feed Puppy'}
            </button>
          )}
        </div>

        {/* ── Reward overlay (shown after API returns) ── */}
        {showReward && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-2xl z-50">
            <div
              className={`${activeTheme.cardBg} rounded-2xl p-8 border-2 shadow-2xl text-center mx-6`}
              style={{ borderColor: glowColor }}
            >
              {rewardMilestone && badgeStage && (
                <div className="text-4xl mb-2 animate-bounce">{badgeStage.badge}</div>
              )}
              <div className="text-6xl mb-4 animate-bounce">{rewardIcon}</div>
              <h3 className={`text-xl font-black mb-3 ${activeTheme.text}`}>{rewardMessage}</h3>
              {rewardHints > 0 && (
                <p className="text-lg font-bold text-amber-500">+{rewardHints} Hints 🎁</p>
              )}
              {rewardPoints > 0 && (
                <p className={`text-sm mt-1 ${activeTheme.subText}`}>+{rewardPoints} Points</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
