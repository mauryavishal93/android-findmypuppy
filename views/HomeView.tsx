import React, { useState, useEffect } from 'react';
import { Difficulty, UserProgress, ThemeConfig } from '../types';
import { DifficultyCard } from '../components/ui/DifficultyCard';
import { GameLogo } from '../components/GameLogo';
import { renderThemeBackground } from '../utils/themeBackground';
import { UserDropdown } from '../components/ui/UserDropdown';
import { db, PriceOffer } from '../services/db';
import { useDailyCheckIn } from '../hooks/useDailyCheckIn';
import { useDailyPuzzle } from '../hooks/useDailyPuzzle';
import { DailyCheckInButton } from '../components/DailyCheckInButton';
import { PuppyFeeding } from '../components/PuppyFeeding';
import { PuppyEndlessGame } from '../components/PuppyEndlessGame';
import { LeaderboardModal } from '../components/modals/LeaderboardModal';

interface HomeViewProps {
  progress: UserProgress;
  activeTheme: ThemeConfig;
  onSelectDifficulty: (diff: Difficulty) => void;
  onOpenThemeModal: () => void;
  onOpenInfoModal: () => void;
  onOpenHintShop: () => void;
  onOpenPurchaseHistory: () => void;
  onOpenReferModal: () => void;
  onOpenAchievements?: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  priceOffer: PriceOffer | null;
  onHintsUpdated?: (newHints: number) => void;
  onPointsUpdated?: (newPoints: number) => void;
  isActiveView?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  progress,
  activeTheme,
  onSelectDifficulty,
  onOpenThemeModal,
  onOpenInfoModal,
  onOpenHintShop,
  onOpenPurchaseHistory,
  onOpenReferModal,
  onOpenAchievements,
  onOpenSettings,
  onLogout,
  onOpenLogin,
  priceOffer,
  onHintsUpdated,
  onPointsUpdated,
  isActiveView = true
}) => {
  // Use price offer values if available, otherwise fallback to defaults
  const marketPrice = priceOffer?.marketPrice || 99;
  const offerPrice = priceOffer?.offerPrice || 9;
  const offerReason = priceOffer?.offerReason || 'Special Offer';
  const hasOffer = marketPrice !== offerPrice;
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [currentDifficultyIndex, setCurrentDifficultyIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [showPuppyFeeding, setShowPuppyFeeding] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDailyPuzzle, setShowDailyPuzzle] = useState(false);
  const [comebackEligible, setComebackEligible] = useState(false);
  const [claimingComeback, setClaimingComeback] = useState(false);
  const [weeklyChallenge, setWeeklyChallenge] = useState<{ totalProgress: number; target: number; claimed: boolean } | null>(null);
  const [claimingWeekly, setClaimingWeekly] = useState(false);
  
  const difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD];

  // Daily Puzzle Hook
  const { hasCompletedToday: dailyPuzzleCompletedToday, statusLoaded: puzzleStatusLoaded, loading: dailyPuzzleLoading, completePuzzle, loadStatus: reloadPuzzle } = useDailyPuzzle(progress.playerName || null);

  // Daily Check-In Hook
  const {
    checkInData,
    loading: checkInLoading,
    completeCheckIn,
    loadStatus: reloadCheckIn
  } = useDailyCheckIn({
    username: progress.playerName || null,
    onPointsUpdated,
    onHintsUpdated
  });

  const handleDailyCheckInClick = () => {
    // Always open so user can view their puppy even after checking in
    setShowPuppyFeeding(true);
  };

  const handleFeedPuppy = async () => {
    return await completeCheckIn();
  };

  const handleDailyGameComplete = async (gameId: string, score: number) => {
    const res = await completePuzzle(gameId, score);
    if (res.success && res.totalHints !== undefined && onHintsUpdated) onHintsUpdated(res.totalHints);
    return res;
  };

  // Re-fetch daily status every time the home view becomes active or player changes.
  // This ensures buttons are never stuck in "completed" state from a previous session.
  useEffect(() => {
    if (!progress.playerName || !isActiveView) return;
    reloadCheckIn();
    reloadPuzzle();
  }, [progress.playerName, isActiveView]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (progress.playerName) {
      // Parallelize requests for faster loading
      Promise.all([
        db.getComebackBonusEligibility(progress.playerName),
        db.getWeeklyChallenge(progress.playerName)
      ]).then(([comebackRes, weeklyRes]) => {
        if (comebackRes.success && comebackRes.eligible) {
          setComebackEligible(true);
        }
        
        if (weeklyRes.success && weeklyRes.target) {
          setWeeklyChallenge({
            totalProgress: weeklyRes.totalProgress ?? 0,
            target: weeklyRes.target.total ?? 5,
            claimed: weeklyRes.claimed ?? false
          });
        }
      }).catch(err => console.error("Error fetching dashboard data:", err));
    } else {
      setWeeklyChallenge(null);
      setComebackEligible(false);
    }
  }, [progress.playerName, isActiveView]);

  const handleClaimComeback = async () => {
    if (!progress.playerName) return;
    setClaimingComeback(true);
    try {
      const res = await db.claimComebackBonus(progress.playerName);
      if (res.success && res.totalHints !== undefined && onHintsUpdated) {
        onHintsUpdated(res.totalHints);
        setComebackEligible(false);
      }
    } finally {
      setClaimingComeback(false);
    }
  };

  const handleClaimWeekly = async () => {
    if (!progress.playerName) return;
    setClaimingWeekly(true);
    try {
      const res = await db.claimWeeklyChallenge(progress.playerName);
      if (res.success && res.totalHints !== undefined && onHintsUpdated) {
        onHintsUpdated(res.totalHints);
        setWeeklyChallenge((prev) => prev ? { ...prev, claimed: true } : null);
      }
    } finally {
      setClaimingWeekly(false);
    }
  };

  
  const handleNextDifficulty = () => {
    setPrevIndex(currentDifficultyIndex);
    setSwipeDirection('right');
    setCurrentDifficultyIndex((prev) => (prev + 1) % difficulties.length);
  };
  
  const handlePrevDifficulty = () => {
    setPrevIndex(currentDifficultyIndex);
    setSwipeDirection('left');
    setCurrentDifficultyIndex((prev) => (prev - 1 + difficulties.length) % difficulties.length);
  };
  
  const handleDifficultySelect = () => {
    onSelectDifficulty(difficulties[currentDifficultyIndex]);
  };
  
  // Reset swipe direction and prev index after animation completes
  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => {
        setSwipeDirection(null);
        setPrevIndex(null);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [swipeDirection, currentDifficultyIndex]);
  
  // Simple smooth swipe handlers - uses same logic as arrow buttons
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Use the same handlers as arrow buttons for consistent animation
    if (isLeftSwipe) {
      handleNextDifficulty(); // Same as clicking right arrow
    } else if (isRightSwipe) {
      handlePrevDifficulty(); // Same as clicking left arrow
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className={`flex flex-col h-full ${activeTheme.background} relative overflow-hidden transition-colors duration-500`}>
      
      {/* Decorative Landscape Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {renderThemeBackground(activeTheme.id)}
      </div>

      {/* Reduced Floating Puppy Decorations - Less Clutter */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
        {/* Minimal Animated Paw Prints */}
        <div className="absolute top-16 left-4 text-xl opacity-15 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0s' }}>
          🐾
        </div>
        <div className="absolute bottom-32 right-8 text-lg opacity-12 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
          🐾
        </div>
        
        {/* Minimal Happy Puppies */}
        <div className="absolute top-32 right-12 text-lg opacity-15 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1.5s' }}>
          🐕
        </div>
      </div>

      <header className={`mobile-header ${activeTheme.headerBg} backdrop-blur-xl shadow-sm flex justify-between z-[100] sticky top-0 border-b border-white/10 shrink-0 relative transition-all duration-500 py-2 px-3`}>
        <div className="flex items-center gap-2 relative shrink-0">
          {progress.playerName ? (
            <>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 bg-white/90 hover:bg-white backdrop-blur-md pl-1 pr-2 py-1 rounded-full shadow-sm border border-white/50 transition-all active:scale-95 group max-w-[140px] sm:max-w-none"
              >
                <div className={`bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-inner shrink-0`}>
                  {progress.playerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className={`text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5 hidden sm:block`}>
                    Player
                  </span>
                  <span className={`text-xs font-black leading-none text-slate-800 truncate w-full text-left`}>{progress.playerName}</span>
                </div>
                <i className="fas fa-chevron-down text-[10px] text-slate-400 ml-0.5 group-hover:translate-y-0.5 transition-transform"></i>
              </button>
              
              <UserDropdown
                isOpen={isUserDropdownOpen}
                onClose={() => setIsUserDropdownOpen(false)}
                activeTheme={activeTheme}
                onInfoClick={onOpenInfoModal}
                onThemeClick={onOpenThemeModal}
                onPurchaseHistoryClick={onOpenPurchaseHistory}
                onReferClick={onOpenReferModal}
                onAchievementsClick={onOpenAchievements}
                onLogout={onLogout}
              />
            </>
          ) : (
            <button
              onClick={onOpenLogin}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-slate-900 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all`}
            >
              Login
            </button>
          )}
        </div>
          <div className="flex items-center gap-1.5 shrink-0">
          {/* Settings Button */}
          <button 
            onClick={onOpenSettings}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/80 hover:bg-white text-slate-600 shadow-sm border border-white/50 active:scale-95 hover:rotate-90`}
            title="Settings"
          >
            <i className={`fas fa-cog text-xs`}></i>
          </button>

          <button
            onClick={() => setShowLeaderboard(true)}
            className={`pl-2 pr-1 py-1 rounded-full font-bold flex items-center gap-1.5 border border-amber-200/50 shadow-sm bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 hover:scale-105 transition-transform cursor-pointer`}
          >
            <span className="text-[10px] uppercase tracking-wide opacity-60 hidden sm:inline">Score</span>
            <span className="text-xs sm:hidden">🏆</span>
            <span className="bg-white px-1.5 py-0.5 rounded-full text-xs font-black shadow-sm text-amber-600">{progress.totalScore}</span>
          </button>
        </div>
      </header>
      
      <main className="mobile-main-content flex-1 px-2 pt-2 pb-6 overflow-hidden flex flex-col items-center z-10 w-full relative">
        <div className="w-full max-w-sm flex flex-col h-full">
          
          {/* Top Section: Welcome & Banners - Compact & Flexible */}
          <div className="flex flex-col gap-2 shrink-0">
            {/* Welcome Card with Logo - Compact Design */}
            <div className={`flex flex-row items-center justify-center text-center p-2 rounded-xl backdrop-blur-md shadow-lg border-2 relative overflow-hidden w-full ${activeTheme.cardBg} transition-all duration-300 shrink-0`}
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.2)',
              }}
            >
               {/* Animated Rainbow Border */}
               <div 
                 className="absolute top-0 left-0 w-full h-1 opacity-60 animate-pulse"
                 style={{
                   background: 'linear-gradient(to right, #f472b6, #fbbf24, #34d399, #60a5fa, #a78bfa)',
                 }}
               ></div>
               
               {/* Logo Section */}
               <div className="flex-shrink-0 mr-2">
                 <GameLogo className="w-10 h-10 drop-shadow-lg" />
               </div>
               
               {/* Text Section */}
               <div className="relative z-10 text-center">
                 <h2 className={`text-sm font-black tracking-tight ${activeTheme.text} mb-0.5 flex items-center justify-center gap-1`}>
                   <span className="text-xs">🐕</span>
                   <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                     Find My Puppy
                   </span>
                 </h2>
                 <p className={`font-semibold text-[9px] ${activeTheme.subText} flex items-center justify-center gap-0.5`}>
                   <span className="text-[10px]">🔍</span>
                   <span>Find hidden puppies!</span>
                 </p>
               </div>
            </div>
            
            {/* Comeback bonus banner */}
            {progress.playerName && comebackEligible && (
              <div className="w-full shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-2 text-white shadow-lg border-2 border-amber-300 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">Welcome back! 🎉</p>
                  <p className="text-[10px] opacity-95">Claim 5 free hints.</p>
                </div>
                <button
                  onClick={handleClaimComeback}
                  disabled={claimingComeback}
                  className="bg-white text-amber-700 px-3 py-1 rounded-lg font-bold text-xs hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {claimingComeback ? '...' : 'Claim'}
                </button>
              </div>
            )}

            {/* Weekly challenge */}
            {progress.playerName && weeklyChallenge && !weeklyChallenge.claimed && (
              <div className={`w-full shrink-0 rounded-xl p-2 border-2 ${activeTheme.cardBg} ${activeTheme.text} border-indigo-400/50 flex items-center justify-between`}>
                <div>
                  <p className="text-xs font-bold flex items-center gap-1">
                    <span>📅</span> Weekly: Clear 5 levels
                  </p>
                  <p className="text-[10px] mt-0.5 opacity-90">
                    Progress: {weeklyChallenge.totalProgress}/{weeklyChallenge.target}
                  </p>
                </div>
                {weeklyChallenge.totalProgress >= weeklyChallenge.target && (
                  <button
                    onClick={handleClaimWeekly}
                    disabled={claimingWeekly}
                    className="ml-2 bg-green-500 text-white px-2 py-1 rounded font-bold text-xs"
                  >
                    {claimingWeekly ? '...' : 'Claim'}
                  </button>
                )}
              </div>
            )}

            {/* Daily Buttons Row */}
            {progress.playerName && (
              <div className="grid grid-cols-2 gap-2 h-12 w-full shrink-0">

                {/* ── Daily Check-In button ── */}
                <div className="relative h-full">
                  <DailyCheckInButton
                    checkInData={checkInData}
                    loading={checkInLoading}
                    onClick={handleDailyCheckInClick}
                    activeTheme={activeTheme}
                  />
                  {/* pointer-events-none: badge must never intercept taps */}
                  {!checkInData?.hasCheckedInToday && (
                    <div className="pointer-events-none absolute -top-1 -right-1 z-20 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-yellow-200 animate-bounce">
                      <span className="text-xs">💡</span>
                    </div>
                  )}
                </div>

                {/* ── Puppy Jump / Daily Puzzle button ── */}
                <div className="relative h-full">
                  <button
                    type="button"
                    onClick={() => {
                      // Only open if status is loaded AND game not yet played today
                      if (puzzleStatusLoaded && !dailyPuzzleCompletedToday && !dailyPuzzleLoading) {
                        setShowDailyPuzzle(true);
                      }
                    }}
                    className={`
                      w-full h-full rounded-xl p-1 border
                      flex flex-col items-center justify-center
                      transition-all duration-200 select-none touch-manipulation
                      ${dailyPuzzleCompletedToday
                        ? 'opacity-60 border-purple-200 bg-purple-50 text-purple-800 cursor-not-allowed'
                        : !puzzleStatusLoaded || dailyPuzzleLoading
                        ? 'opacity-50 border-purple-200 bg-purple-100 text-purple-400 cursor-wait'
                        : 'border-purple-300/50 bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md cursor-pointer active:scale-95'
                      }
                    `}
                    style={{ WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
                  >
                    <span className="pointer-events-none text-xs font-bold leading-none block mb-0.5">
                      {!puzzleStatusLoaded || dailyPuzzleLoading
                        ? '⏳ Loading...'
                        : dailyPuzzleCompletedToday
                        ? '✓ Jump Done'
                        : '🐕 Puppy Jump'}
                    </span>
                    <span className="pointer-events-none text-[9px] opacity-90 leading-none">
                      {dailyPuzzleCompletedToday ? 'Done for today' : (!puzzleStatusLoaded ? '' : 'Play & Earn')}
                    </span>
                  </button>
                  {/* badge only shown when game is available to play */}
                  {puzzleStatusLoaded && !dailyPuzzleCompletedToday && !dailyPuzzleLoading && (
                    <div className="pointer-events-none absolute -top-1 -right-1 z-20 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-yellow-200 animate-bounce">
                      <span className="text-xs">💡</span>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Middle Section: Difficulty Carousel - Takes remaining space */}
          <div className="flex-1 min-h-0 flex flex-col justify-center relative py-2">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-white/30 blur-3xl rounded-full scale-75 opacity-50"></div>

            <div className="relative w-full overflow-visible z-10 mt-6">
              {/* Left Arrow - Enhanced */}
              <button
                onClick={handlePrevDifficulty}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-20 w-8 h-8 rounded-full bg-white text-slate-400 shadow-lg border-2 border-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all hover:text-brand"
                aria-label="Previous difficulty"
              >
                <i className="fas fa-chevron-left text-xs"></i>
              </button>

              {/* Difficulty Card Carousel - Responsive Height */}
              <div className="relative overflow-visible w-full px-1">
                <div 
                  className="relative w-full" 
                  style={{ 
                    aspectRatio: '1.6', 
                    maxHeight: '200px',
                    touchAction: 'pan-x',
                  }}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {difficulties.map((difficulty, index) => {
                    const getDifficultyConfig = () => {
                      switch (difficulty) {
                        case Difficulty.EASY:
                          return {
                            color: "bg-gradient-to-br from-emerald-400 to-teal-500",
                            points: 5,
                            description: "100 Levels"
                          };
                        case Difficulty.MEDIUM:
                          return {
                            color: "bg-gradient-to-br from-blue-400 to-indigo-500",
                            points: 10,
                            description: "100 Levels"
                          };
                        case Difficulty.HARD:
                          return {
                            color: "bg-gradient-to-br from-rose-500 to-pink-600",
                            points: 15,
                            description: "100 Levels"
                          };
                      }
                    };
                    const config = getDifficultyConfig();
                    const isActive = index === currentDifficultyIndex;
                    const wasPrevActive = prevIndex !== null && index === prevIndex;
                    
                    const getCompletedLevels = () => {
                      if (progress.clearedLevels && typeof progress.clearedLevels === 'object') {
                        const difficultyPrefix = `${difficulty}_`;
                        const matchingKeys = Object.keys(progress.clearedLevels).filter(
                          key => key.startsWith(difficultyPrefix) && progress.clearedLevels[key] === true
                        );
                        return matchingKeys.length;
                      }
                      return 0;
                    };
                    const completedLevels = getCompletedLevels();
                    const totalLevels = 100;
                    
                    let animationClass = '';
                    let transformStyle: React.CSSProperties = {};
                    
                    if (isActive) {
                      animationClass = 'opacity-100 z-10 scale-100';
                      if (swipeDirection === 'right') transformStyle = { transform: 'translateX(100%) scale(0.9) rotate(5deg)' };
                      else if (swipeDirection === 'left') transformStyle = { transform: 'translateX(-100%) scale(0.9) rotate(-5deg)' };
                    } else if (wasPrevActive) {
                      animationClass = `opacity-0 z-0 scale-90 ${swipeDirection === 'right' ? '-translate-x-full rotate-[-5deg]' : 'translate-x-full rotate-[5deg]'}`;
                    } else {
                      animationClass = `opacity-0 z-0 scale-90 ${index < currentDifficultyIndex ? '-translate-x-full' : 'translate-x-full'}`;
                    }

                    return (
                      <div
                        key={`${difficulty}-${currentDifficultyIndex}`}
                        className={`absolute inset-0 overflow-visible ${animationClass}`}
                        style={{
                          ...transformStyle,
                          transition: swipeDirection ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out' : 'none',
                        }}
                        ref={(el) => {
                          if (el && isActive && swipeDirection) {
                            requestAnimationFrame(() => { el.style.transform = ''; });
                          }
                        }}
                      >
                        <DifficultyCard 
                          difficulty={difficulty} 
                          points={config.points} 
                          color={config.color}
                          description={config.description} 
                          onClick={handleDifficultySelect}
                          completedLevels={completedLevels}
                          totalLevels={totalLevels}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Arrow - Enhanced */}
              <button
                onClick={handleNextDifficulty}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-20 w-8 h-8 rounded-full bg-white text-slate-400 shadow-lg border-2 border-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all hover:text-brand"
                aria-label="Next difficulty"
              >
                <i className="fas fa-chevron-right text-xs"></i>
              </button>

              {/* Dots Indicator - Clean Pill */}
              <div className="flex justify-center mt-3">
                <div className="bg-black/10 backdrop-blur-sm rounded-full p-1 flex gap-1.5">
                  {difficulties.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentDifficultyIndex(index)}
                      className={`transition-all duration-300 rounded-full h-1.5 ${index === currentDifficultyIndex ? 'w-5 bg-white shadow-sm' : 'w-1.5 bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Actions - Pinned to bottom */}
          <div className="shrink-0 flex flex-col gap-2 mt-auto pb-1">
            {/* Hint Shop Button - Compact */}
            <div 
              onClick={onOpenHintShop}
              className="text-white p-2 rounded-xl shadow-lg cursor-pointer transition-all relative overflow-hidden group flex items-center justify-between w-[342px] max-w-full mx-auto hover:shadow-xl hover:-translate-y-0.5 border-2 border-yellow-300/90 hover:border-yellow-200 shrink-0 h-[60px]"
              style={{
                background: 'linear-gradient(to right, #facc15, #fb923c, #f472b6, #fb923c)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)',
              }}
            >
              {/* 3D Effect Layers */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent rounded-xl"></div>
              
              <div className="z-10 flex flex-col pl-2 flex-1 justify-center">
                <h3 className="text-xs font-black leading-tight drop-shadow-lg flex items-center gap-1">
                  <span className="text-sm">🛒</span>
                  <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                    Hint Shop
                  </span>
                </h3>
                {/* Current Hint Count - Below text */}
                <div className="mt-0.5">
                  <span className="bg-white/40 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[9px] font-black text-slate-800 border border-white/50 shadow-sm">
                    💡 {progress.premiumHints ?? 0}
                  </span>
                </div>
              </div>

              <div className="z-10 flex flex-col items-end pr-2 justify-center">
                {hasOffer && offerReason && (
                  <span className="text-[7px] mb-0.5 opacity-95 uppercase font-bold tracking-wider drop-shadow-sm">
                    {offerReason}
                  </span>
                )}
                <div className="flex items-center gap-1 bg-white/30 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-md border border-white/40">
                  {hasOffer ? (
                    <>
                      <span className="text-[8px] line-through opacity-70 font-medium">₹{marketPrice}</span>
                      <span className="font-black text-[10px]">₹{offerPrice}</span>
                    </>
                  ) : (
                    <span className="font-black text-[10px]">₹{offerPrice}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Puppy Endless Run (Daily Game) Modal */}
      {showDailyPuzzle && progress.playerName && (
        <PuppyEndlessGame
          onComplete={handleDailyGameComplete}
          onClose={() => setShowDailyPuzzle(false)}
          activeTheme={activeTheme}
          username={progress.playerName}
          highScore={progress.puppyRunHighScore}
        />
      )}

      {/* Daily Check-In Puppy Feeding Modal */}
        {showPuppyFeeding && checkInData && (
          <PuppyFeeding
            onFeed={handleFeedPuppy}
            onClose={() => setShowPuppyFeeding(false)}
            activeTheme={activeTheme}
            puppyAge={checkInData.puppyAge}
            puppySize={checkInData.puppySize}
            streak={checkInData.checkInStreak}
            hasCheckedInToday={checkInData.hasCheckedInToday}
          />
        )}

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        activeTheme={activeTheme}
        currentUsername={progress.playerName}
      />
    </div>
  );
};
