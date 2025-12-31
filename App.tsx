
import { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, UserProgress, ThemeType } from './types';
import { THEME_CONFIGS } from './constants/themeConfig';
import { LevelSelector } from './components/LevelSelector';
import { InfoModal } from './components/modals/InfoModal';
import { ThemeModal } from './components/modals/ThemeModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { PurchaseHistoryModal } from './components/modals/PurchaseHistoryModal';
import { Button } from './components/ui/Button';
import { LoginView } from './views/LoginView';
import { HomeView } from './views/HomeView';
import { GameView } from './views/GameView';
import { useGameState } from './hooks/useGameState';
import { useTimer } from './hooks/useTimer';
import { usePayment } from './hooks/usePayment';
import { useHints } from './hooks/useHints';
import { useAudio } from './hooks/useAudio';
import { db, PriceOffer } from './services/db';

export default function App() {
  const [view, setView] = useState<'LOGIN' | 'HOME' | 'LEVEL_SELECT' | 'GAME' | 'WIN' | 'GAME_OVER'>('LOGIN');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [loginName, setLoginName] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  
  // Info Modal State
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Theme Modal State
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  // Purchase History Modal State
  const [showPurchaseHistoryModal, setShowPurchaseHistoryModal] = useState(false);

  // Track last processed payment ID to avoid duplicate history entries
  const lastProcessedPaymentIdRef = useRef<number | null>(null);

  // Price Offer State
  const [priceOffer, setPriceOffer] = useState<PriceOffer | null>(null);

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('findMyPuppy_progress');
    const defaultProgress = {
      playerName: '',
      clearedLevels: {},
      totalScore: 0,
      unlockedDifficulties: [Difficulty.EASY],
      premiumHints: 0,
      selectedTheme: 'sunny' as ThemeType
    };
    return saved ? { ...defaultProgress, ...JSON.parse(saved) } : defaultProgress;
  });

  // Ensure we always have a valid theme, fallback to 'sunny' if invalid
  const selectedTheme = progress.selectedTheme || 'sunny';
  const activeTheme = THEME_CONFIGS[selectedTheme as ThemeType] || THEME_CONFIGS['sunny'];

  // Custom Hooks
  const { ambientAudioRef, playSfx } = useAudio({ view, isMuted });
  const { gameState, initLevel, updatePuppy } = useGameState();
  
  const handleGameOver = useCallback(() => {
    setIsTimerRunning(false);
    playSfx('fail', isMuted);
    setView('GAME_OVER');
  }, [playSfx, isMuted]);

  const { timeLeft, setTimeLeft, formatTime } = useTimer({
    timeLimit,
    isRunning: isTimerRunning,
    onTimeUp: handleGameOver
  });

  // --- DATA SYNCHRONIZATION HELPERS ---

  // Fetch price offer from database
  const fetchPriceOffer = useCallback(async () => {
    try {
      const response = await db.getPriceOffer();
      if (response.success && response.offer) {
        setPriceOffer(response.offer);
      } else {
        // Fallback to default if fetch fails
        setPriceOffer({
          hintPack: '100 Hints Pack',
          marketPrice: 99,
          offerPrice: 9,
          hintCount: 100
        });
      }
    } catch (error) {
      console.error("Failed to fetch price offer:", error);
      // Fallback to default on error
      setPriceOffer({
        hintPack: '100 Hints Pack',
        marketPrice: 99,
        offerPrice: 9,
        hintCount: 100
      });
    }
  }, []);

  const syncUserData = useCallback(async (username: string) => {
    if (!username) return;
    try {
      const response = await db.getUser(username);
      if (response.success && response.user) {
        const user = response.user;
        
        setProgress(prev => {
          const newClearedLevels = { ...prev.clearedLevels };
          
          // Reconstruct cleared levels from DB counters
          // Easy
          const easyCount = user.levelPassedEasy || 0;
          for (let i = 1; i <= easyCount; i++) {
             newClearedLevels[`${Difficulty.EASY}_${i}`] = true;
          }
          // Medium
          const mediumCount = user.levelPassedMedium || 0;
          for (let i = 1; i <= mediumCount; i++) {
             newClearedLevels[`${Difficulty.MEDIUM}_${i}`] = true;
          }
          // Hard
          const hardCount = user.levelPassedHard || 0;
          for (let i = 1; i <= hardCount; i++) {
             newClearedLevels[`${Difficulty.HARD}_${i}`] = true;
          }

          return {
            ...prev,
            playerName: user.username, // Ensure casing matches DB
            totalScore: user.points || 0,
            premiumHints: user.hints || 0,
            clearedLevels: newClearedLevels
            // Preserve theme as it might be local pref or we could sync it if DB supported it
          };
        });
      }
    } catch (error) {
      console.error("Failed to sync user data:", error);
    }
  }, []);

  const handlePaymentSuccess = useCallback((hints: number, paymentId: number, amount: number) => {
    // Deduplicate by paymentId: if we've already processed this, ignore
    if (lastProcessedPaymentIdRef.current === paymentId) {
      return;
    }
    lastProcessedPaymentIdRef.current = paymentId;

    // Always add purchased hints on top of existing hints
    setProgress(prev => {
      const newHints = (prev.premiumHints || 0) + hints;

      // Sync hints to database and create ONE purchase entry per pack
      if (prev.playerName && hints > 0) {
        db.updateHints(prev.playerName, newHints).catch(err => {
          console.error('Failed to update hints in database:', err);
        });

        // Use amount passed from payment success (which uses offerPrice from DB)
        db.createPurchaseHistory(
          prev.playerName,
          amount,
          'Hints',
          `${hints} Hints Pack`,
          'Money'
        ).catch(err => {
          console.error('Failed to save purchase history:', err);
        });
      }

      return { ...prev, premiumHints: newHints };
    });
  }, [priceOffer]);

  const {
    paymentStatus,
    showPaymentModal,
    paymentModalConfig,
    handlePayment,
    handleCancelPayment,
    openPaymentModal,
    closePaymentModal
  } = usePayment({
    onPaymentSuccess: handlePaymentSuccess,
    playSfx: (type) => playSfx(type, isMuted),
    priceOffer: priceOffer
  });

  const handleOutOfHints = useCallback(() => {
    openPaymentModal({
      title: "Need a Hint?",
      description: "You're out of free hints for this level."
    });
  }, [openPaymentModal]);

  const {
    showHints,
    handleUseHint,
    resetHints,
    freeHintsRemaining,
    hasPremiumHints
  } = useHints({
    progress,
    setProgress,
    playSfx: (type) => playSfx(type, isMuted),
    onOutOfHints: handleOutOfHints
  });

  // --- EFFECTS ---

  // Fetch price offer on mount
  useEffect(() => {
    fetchPriceOffer();
  }, [fetchPriceOffer]);

  // Fetch price offer when view changes (app load, refresh, open game, come back from game)
  useEffect(() => {
    fetchPriceOffer();
  }, [view, fetchPriceOffer]);

  // Restore session: if a playerName is present, stay logged in and sync data
  useEffect(() => {
    if (progress.playerName) {
      setView('HOME');
      syncUserData(progress.playerName);
    }
  }, []); // Run once on mount

  // Sync data whenever returning to HOME screen
  useEffect(() => {
    if (view === 'HOME' && progress.playerName) {
      syncUserData(progress.playerName);
    }
  }, [view, progress.playerName, syncUserData]);

  useEffect(() => {
    localStorage.setItem('findMyPuppy_progress', JSON.stringify(progress));
  }, [progress]);

  const handleLogin = async () => {
    if (!loginName.trim()) return;
    const username = loginName.trim();
    
    // Set view immediately for better UX
    setView('HOME');
    
    // Sync data from DB
    await syncUserData(username);
    
    // Ensure local name is set even if sync fails (offline mode support)
    setProgress(prev => {
        if (prev.playerName !== username) {
            return { ...prev, playerName: username };
        }
        return prev;
    });

    if (ambientAudioRef.current && !isMuted) {
      ambientAudioRef.current.play().catch(() => {});
    }
  };

  const handleLogout = () => {
    // Clear progress and reset to login
    setProgress({
      playerName: '',
      clearedLevels: {},
      totalScore: 0,
      unlockedDifficulties: [Difficulty.EASY],
      premiumHints: 0,
      selectedTheme: 'sunny' as ThemeType
    });
    localStorage.removeItem('findMyPuppy_progress');
    setLoginName('');
    setView('LOGIN');
    setIsMuted(false);
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
    }
  };

  const handleThemeChange = (theme: ThemeType) => {
    setProgress(prev => ({ ...prev, selectedTheme: theme }));
    setShowThemeModal(false);
  };

  const handleInitLevel = useCallback(async (level: number, diff: Difficulty) => {
    resetHints();
    const result = await initLevel(level, diff);
    setTimeLimit(result.timeLimit);
    if (result.timeLimit !== null) {
      setTimeLeft(result.timeLimit);
    }
    setIsTimerRunning(false);
  }, [initLevel, resetHints, setTimeLeft]);

  const handleLevelSelect = (levelId: number) => {
    setCurrentLevelId(levelId);
    setView('GAME');
    handleInitLevel(levelId, selectedDifficulty);
  };

  const handleLevelClear = useCallback(async () => {
    playSfx('clear', isMuted);
    const levelKey = `${selectedDifficulty}_${currentLevelId}`;
    const isFirstClear = !progress.clearedLevels[levelKey];
    let pointsAwarded = 0;
    
    if (isFirstClear) {
      if (selectedDifficulty === Difficulty.EASY) pointsAwarded = 5;
      if (selectedDifficulty === Difficulty.MEDIUM) pointsAwarded = 10;
      if (selectedDifficulty === Difficulty.HARD) pointsAwarded = 15;
    }

    setProgress(prev => {
      const newTotalScore = prev.totalScore + pointsAwarded;
      const updatedClearedLevels = { ...prev.clearedLevels, [levelKey]: true };
      
      // Count levels passed for each difficulty
      const countLevelsPassed = (difficulty: Difficulty) => {
        return Object.keys(updatedClearedLevels).filter(key => {
          const [diff] = key.split('_');
          return diff === difficulty && updatedClearedLevels[key];
        }).length;
      };
      
      const levelPassedEasy = countLevelsPassed(Difficulty.EASY);
      const levelPassedMedium = countLevelsPassed(Difficulty.MEDIUM);
      const levelPassedHard = countLevelsPassed(Difficulty.HARD);
      
      // Sync points and level passed counts to database if user is logged in
      if (prev.playerName) {
        if (pointsAwarded > 0) {
          db.updatePoints(prev.playerName, newTotalScore).catch(err => {
            console.error('Failed to update points in database:', err);
          });
        }
        
        // Sync level passed count for the current difficulty
        db.updateLevelPassed(prev.playerName, selectedDifficulty, 
          selectedDifficulty === Difficulty.EASY ? levelPassedEasy :
          selectedDifficulty === Difficulty.MEDIUM ? levelPassedMedium :
          levelPassedHard
        ).catch(err => {
          console.error('Failed to update level passed count in database:', err);
        });
      }
      
      return {
        ...prev,
        clearedLevels: updatedClearedLevels,
        totalScore: newTotalScore
      };
    });

    setView('WIN');
  }, [playSfx, isMuted, selectedDifficulty, currentLevelId, progress.clearedLevels, progress.playerName]);

  const handlePuppyFound = useCallback((id: string) => {
    playSfx('found', isMuted);

    // Calculate updated puppies before state update
    const updatedPuppies = gameState.puppies.map(p => 
      p.id === id ? { ...p, isFound: true } : p
    );
    
    // Update the puppy state
    updatePuppy(id, { isFound: true });
    
    // Check if all puppies are found
    const allFound = updatedPuppies.every(p => p.isFound);
    if (allFound) {
      setIsTimerRunning(false);
      setTimeout(() => handleLevelClear(), 800);
    }
  }, [playSfx, isMuted, updatePuppy, gameState.puppies, handleLevelClear]);
  
  const handleRetry = () => {
    handleInitLevel(currentLevelId, selectedDifficulty);
    setView('GAME');
  };

  const openHintShop = () => {
    openPaymentModal({
      title: 'Hint Shop',
      description: 'Stock up on hints for the harder levels!'
    });
  };

  const handlePayWithPoints = () => {
    if (progress.totalScore >= 10) {
      playSfx('pay', isMuted);
      setProgress(prev => {
        const newTotalScore = prev.totalScore - 10;
        const newHints = (prev.premiumHints || 0) + 2;

        // Sync both points and hints to database and create ONE purchase entry
        if (prev.playerName) {
          db.updatePoints(prev.playerName, newTotalScore).catch(err => {
            console.error('Failed to update points in database:', err);
          });
          db.updateHints(prev.playerName, newHints).catch(err => {
            console.error('Failed to update hints in database:', err);
          });

          db.createPurchaseHistory(
            prev.playerName,
            10, // Points spent
            'Hints',
            '2 Hints Pack (Points)',
            'Points'
          ).catch(err => {
            console.error('Failed to save purchase history:', err);
          });
        }

        return {
          ...prev,
          totalScore: newTotalScore,
          premiumHints: newHints
        };
      });
      closePaymentModal();
    }
  };

  const nextLevel = () => {
    if (currentLevelId < 100) {
      handleLevelSelect(currentLevelId + 1);
    } else {
      setView('HOME');
    }
  };

  const handleImageLoaded = useCallback(() => {
     setIsTimerRunning(true);
  }, []);

  const toggleMute = () => setIsMuted(prev => !prev);

  return (
    <div className="h-screen w-screen bg-slate-200 flex items-center justify-center overflow-hidden font-sans select-none relative">
      
      {/* PC Background (blurred pattern) */}
      <div className="absolute inset-0 z-0 bg-slate-300 opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200 via-slate-200 to-slate-300">
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
      </div>

      {/* Phone Frame Container */}
      <div className="w-full h-full sm:w-[400px] sm:h-[850px] sm:max-h-[90vh] bg-slate-50 relative sm:rounded-[2.5rem] sm:border-[8px] sm:border-slate-800 sm:shadow-2xl overflow-hidden z-10 flex flex-col">
         
        {view === 'LOGIN' && (
          <LoginView 
            loginName={loginName}
            setLoginName={setLoginName}
            onLogin={handleLogin}
          />
        )}

        {view === 'HOME' && (
          <HomeView
            progress={progress}
            activeTheme={activeTheme}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={(diff) => {
              setSelectedDifficulty(diff);
              setView('LEVEL_SELECT');
            }}
            onToggleMute={toggleMute}
            isMuted={isMuted}
            onOpenThemeModal={() => setShowThemeModal(true)}
            onOpenInfoModal={() => setShowInfoModal(true)}
            onOpenHintShop={openHintShop}
            onOpenPurchaseHistory={() => setShowPurchaseHistoryModal(true)}
            onLogout={handleLogout}
            priceOffer={priceOffer}
          />
        )}
        
        {view === 'LEVEL_SELECT' && (
          <LevelSelector 
            difficulty={selectedDifficulty}
            clearedLevels={progress.clearedLevels}
            onSelectLevel={handleLevelSelect}
            onBack={() => setView('HOME')}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            currentTheme={progress.selectedTheme || 'sunny'}
          />
        )}

        {/* Render Game Underneath Modals for better UX */}
        {(view === 'GAME' || view === 'WIN' || view === 'GAME_OVER') && (
          <GameView
            gameState={gameState}
            selectedDifficulty={selectedDifficulty}
            currentLevelId={currentLevelId}
            timeLeft={timeLeft}
            formatTime={formatTime}
            showHints={showHints}
            freeHintsRemaining={freeHintsRemaining}
            hasPremiumHints={hasPremiumHints}
            premiumHints={progress.premiumHints || 0}
            isMuted={isMuted}
            onPuppyFound={handlePuppyFound}
            onImageLoaded={handleImageLoaded}
            onUseHint={handleUseHint}
            onToggleMute={toggleMute}
            onBack={() => setView('LEVEL_SELECT')}
          />
        )}

        {view === 'WIN' && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl relative border-4 border-white">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-bounce-short">
                <i className="fas fa-trophy text-6xl text-yellow-500 drop-shadow-sm"></i>
              </div>
              
              <h2 className="text-3xl font-black text-slate-800 mt-12 mb-2">Level Clear!</h2>
              <p className="text-slate-500 font-medium mb-6">Fantastic job finding all the pups!</p>
              
              <div className="flex justify-center gap-4 mb-8">
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex flex-col items-center w-24">
                    <span className="text-xs font-bold text-yellow-600 uppercase">Score</span>
                    <span className="text-2xl font-black text-yellow-500">{progress.totalScore}</span>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex flex-col items-center w-24">
                    <span className="text-xs font-bold text-blue-600 uppercase">Level</span>
                    <span className="text-2xl font-black text-blue-500">{currentLevelId}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={nextLevel} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg shadow-emerald-200">
                  Next Level <i className="fas fa-arrow-right ml-2"></i>
                </Button>
                <button onClick={() => setView('LEVEL_SELECT')} className="text-slate-400 font-bold hover:text-slate-600 transition-colors py-2">
                  Back to Map
                </button>
              </div>
            </div>
            
            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                  <div key={i} className="absolute animate-fall" style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                    animationDelay: `${Math.random() * 2}s`
                  }}>
                    <i className={`fas fa-square text-xs transform rotate-45 text-${['red','yellow','blue','green','pink'][Math.floor(Math.random()*5)]}-400`}></i>
                  </div>
              ))}
            </div>
          </div>
        )}
        
        {view === 'GAME_OVER' && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl relative border-4 border-red-100">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-red-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <i className="fas fa-times text-5xl text-red-500"></i>
              </div>
              
              <h2 className="text-3xl font-black text-slate-800 mt-10 mb-2">Time's Up!</h2>
              <p className="text-slate-500 font-medium mb-6">Those puppies were too good at hiding.</p>

              <div className="flex flex-col gap-3">
                <Button onClick={handleRetry} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg shadow-blue-200">
                  <i className="fas fa-redo mr-2"></i> Try Again
                </Button>
                <button onClick={() => setView('LEVEL_SELECT')} className="text-slate-400 font-bold hover:text-slate-600 transition-colors py-2">
                  Give Up
                </button>
              </div>
            </div>
          </div>
        )}

        {showThemeModal && (
          <ThemeModal 
            onClose={() => setShowThemeModal(false)}
            onSelect={handleThemeChange}
            currentTheme={progress.selectedTheme || 'sunny'}
          />
        )}

        {showInfoModal && (
          <InfoModal onClose={() => setShowInfoModal(false)} />
        )}

        {showPaymentModal && (
          <PaymentModal 
            onClose={closePaymentModal}
            onPay={handlePayment}
            onPayWithPoints={handlePayWithPoints}
            currentPoints={progress.totalScore}
            paymentStatus={paymentStatus}
            onCancelPayment={handleCancelPayment}
            title={paymentModalConfig.title}
            description={paymentModalConfig.description}
            priceOffer={priceOffer}
          />
        )}

        {showPurchaseHistoryModal && (
          <PurchaseHistoryModal
            onClose={() => setShowPurchaseHistoryModal(false)}
            username={progress.playerName}
            activeTheme={activeTheme}
          />
        )}
      </div>
    </div>
  );
}
