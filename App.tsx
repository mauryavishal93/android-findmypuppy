
import { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, UserProgress, ThemeType } from './types';
import { THEME_CONFIGS } from './constants/themeConfig';
import { LevelSelector } from './components/LevelSelector';
import { InfoModal } from './components/modals/InfoModal';
import { ExplorerGuide } from './components/ExplorerGuide';
import { LeaderboardModal } from './components/modals/LeaderboardModal';
import { ThemeModal } from './components/modals/ThemeModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { PaymentResultModal } from './components/modals/PaymentResultModal';
import { PurchaseHistoryModal } from './components/modals/PurchaseHistoryModal';
import { ReferFriendModal } from './components/modals/ReferFriendModal';
import { AchievementsModal } from './components/modals/AchievementsModal';
import { ForgotPasswordModal } from './components/modals/ForgotPasswordModal';
import { ResetPasswordModal } from './components/modals/ResetPasswordModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { Button } from './components/ui/Button';
import { LoginView } from './views/LoginView';
import { HomeView } from './views/HomeView';
import { GameView } from './views/GameView';
import { DeleteAccountView } from './views/DeleteAccountView';
import { useGameState } from './hooks/useGameState';
import { useTimer } from './hooks/useTimer';
import { usePayment } from './hooks/usePayment';
import { useHints } from './hooks/useHints';
import { useAudio } from './hooks/useAudio';
import { db, PriceOffer, GameConfig } from './services/db';
import { initializeGoogleAuth } from './services/googleAuthConfig';
import { triggerHaptic, setHapticIntensity } from './utils/haptics';
import { initializeNotifications, setupNotificationListeners } from './services/notifications';

function getInitialView(): 'LOGIN' | 'HOME' | 'LEVEL_SELECT' | 'GAME' | 'WIN' | 'GAME_OVER' | 'GAME_LOST' | 'DELETE_ACCOUNT' {
  // Always start with HOME screen - users can navigate to login via the login button
  return 'HOME';
}

export default function App() {
  const [view, setView] = useState<'LOGIN' | 'HOME' | 'LEVEL_SELECT' | 'GAME' | 'WIN' | 'GAME_OVER' | 'GAME_LOST' | 'DELETE_ACCOUNT'>(getInitialView);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [loginName, setLoginName] = useState('');
  const loginNameRef = useRef('');
  // Separate audio controls
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState(() => {
    const saved = localStorage.getItem('findMyPuppy_backgroundMusic');
    return saved ? JSON.parse(saved) : true;
  });
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(() => {
    const saved = localStorage.getItem('findMyPuppy_soundEffects');
    return saved ? JSON.parse(saved) : true;
  });
  const [hapticsEnabled, setHapticsEnabled] = useState(() => {
    const saved = localStorage.getItem('findMyPuppy_hapticsEnabled');
    return saved ? JSON.parse(saved) : true;
  });
  const [hapticIntensity, setHapticIntensityState] = useState(() => {
    const saved = localStorage.getItem('findMyPuppy_hapticIntensity');
    const v = saved ? parseFloat(saved) : 0.7;
    return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.7;
  });
  
  // Sync haptic intensity to haptics util on load and when it changes
  useEffect(() => {
    setHapticIntensity(hapticIntensity);
  }, [hapticIntensity]);
  
  // Legacy isMuted for backward compatibility (both disabled = muted)
  const isMuted = !backgroundMusicEnabled && !soundEffectsEnabled;
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  
  // Info Modal State
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Explorer Guide State
  const [showExplorerGuide, setShowExplorerGuide] = useState(false);

  // Leaderboard Modal State
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Theme Modal State
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  // Purchase History Modal State
  const [showPurchaseHistoryModal, setShowPurchaseHistoryModal] = useState(false);

  // Refer a Friend Modal State
  const [showReferModal, setShowReferModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  
  // Reset Password Modal State
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null);

  // Track last processed payment ID to avoid duplicate history entries
  const lastProcessedPaymentIdRef = useRef<string | null>(null);

  // Price Offer State
  const [priceOffer, setPriceOffer] = useState<PriceOffer | null>(null);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState<{ enabled: boolean; message: string | null } | null>(null);
  const [levelOfDay, setLevelOfDay] = useState<{ levelId: number; difficulty: string } | null>(null);
  const [showFirstTimeLoginPrompt, setShowFirstTimeLoginPrompt] = useState(false);
  const hasShownFirstTimeLoginPromptRef = useRef(false);
  const [showUnlockCelebration, setShowUnlockCelebration] = useState<Difficulty | null>(null);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<string[]>([]);

  // Quit Confirmation State
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('findMyPuppy_progress');
    const defaultProgress = {
      playerName: '',
      clearedLevels: {},
      totalScore: 0,
      unlockedDifficulties: [Difficulty.EASY],
      premiumHints: 0,
      selectedTheme: 'night' as ThemeType,
      puppyRunHighScore: 0,
      unlockedThemes: ['sunny', 'night'] as ThemeType[] // First 2 themes unlocked by default
    };
    const parsed = saved ? JSON.parse(saved) : {};
    // Ensure unlockedThemes exists and includes at least first 2
    if (!parsed.unlockedThemes || parsed.unlockedThemes.length < 2) {
      parsed.unlockedThemes = ['sunny', 'night'];
    }
    return { ...defaultProgress, ...parsed };
  });

  // Ensure we always have a valid theme, fallback to 'night' if invalid
  const selectedTheme = progress.selectedTheme || 'night';
  const activeTheme = THEME_CONFIGS[selectedTheme as ThemeType] || THEME_CONFIGS['night'];

  // Google Auth: initialize once at startup
  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  // Notifications: initialize once at startup
  useEffect(() => {
    initializeNotifications();
    setupNotificationListeners(() => {
      // When notification is clicked, bring app to foreground
      // The app will already be on HOME screen by default
      setView('HOME');
    });
  }, []);

  // Custom Hooks
  const { ambientAudioRef, playSfx: playAudioSfx } = useAudio({ view, backgroundMusicEnabled, soundEffectsEnabled });
  
  // Enhanced SFX handler with Haptics
  const playSfx = useCallback((type: 'found' | 'clear' | 'hint' | 'pay' | 'fail', enabled: boolean) => {
    // 1. Play Audio
    playAudioSfx(type, enabled);
    
    // 2. Trigger Haptic (if enabled globally)
    if (hapticsEnabled) {
      switch (type) {
        case 'found':
          triggerHaptic('SUCCESS');
          break;
        case 'clear':
          triggerHaptic('SUCCESS');
          break;
        case 'fail':
          triggerHaptic('ERROR');
          break;
        case 'hint':
        case 'pay':
          triggerHaptic('MEDIUM');
          break;
      }
    }
  }, [playAudioSfx, hapticsEnabled]);

  const { gameState, initLevel, updatePuppy } = useGameState();
  
  const handleGameOver = useCallback(() => {
    setIsTimerRunning(false);
    playSfx('fail', soundEffectsEnabled);
    setView('GAME_OVER');
  }, [playSfx, soundEffectsEnabled]);

  const wrongTapLimit = gameConfig?.wrongTapLimit ?? 3;
  const handleWrongClick = useCallback(() => {
    playSfx('fail', soundEffectsEnabled);
    setWrongAttempts(prev => {
      const newAttempts = prev + 1;
      if (newAttempts >= wrongTapLimit) {
        setIsTimerRunning(false);
        setView('GAME_LOST');
      }
      return newAttempts;
    });
  }, [playSfx, soundEffectsEnabled, wrongTapLimit]);

  const { timeLeft, setTimeLeft, formatTime, resetTimer } = useTimer({
    timeLimit,
    isRunning: isTimerRunning,
    onTimeUp: handleGameOver
  });

  // --- DATA SYNCHRONIZATION HELPERS ---

  // Fetch game config and price offer (used so admin changes reflect for all users)
  const fetchGameConfig = useCallback(async () => {
    try {
      const response = await db.getGameConfig();
      if (response.success) {
        if (response.maintenance) setMaintenanceMode(response.maintenance);
        if (response.maintenance?.enabled) return;
        if (response.gameConfig) setGameConfig(response.gameConfig);
        if (response.priceOffer) setPriceOffer(response.priceOffer);
      }
      if (!response.success || !response.priceOffer) {
        setPriceOffer({
          hintPack: '100 Hints Pack',
          marketPrice: 99,
          offerPrice: 9,
          hintCount: 100
        });
      }
    } catch (error) {
      console.error("Failed to fetch game config:", error);
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
            email: user.email,
            totalScore: user.points || 0,
            points: user.points || 0,
            premiumHints: user.hints || 0,
            clearedLevels: newClearedLevels,
            puppyRunHighScore: user.puppyRunHighScore || 0,
            unlockedThemes: (user.unlockedThemes ? user.unlockedThemes.filter((t): t is ThemeType => 
              Object.keys(THEME_CONFIGS).includes(t)
            ) : ['sunny', 'night']) as ThemeType[]
            // Preserve theme as it might be local pref or we could sync it if DB supported it
          };
        });
      }
    } catch (error) {
      console.error("Failed to sync user data:", error);
    }
  }, []);

  const handlePaymentSuccess = useCallback((hints: number, paymentId: string, amount: number) => {
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
    paymentResult,
    handlePayment,
    handleCancelPayment,
    openPaymentModal,
    closePaymentModal,
    closePaymentResult
  } = usePayment({
    onPaymentSuccess: handlePaymentSuccess,
    playSfx: (type) => playSfx(type, soundEffectsEnabled),
    priceOffer: priceOffer,
    playerName: progress.playerName || 'Player',
    playerEmail: progress.email || '' 
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
    totalHintsRemaining,
    currentHintType,
    currentHintCount,
    hasHints,
    hasPremiumHints
  } = useHints({
    progress,
    setProgress,
    playSfx: (type) => playSfx(type, soundEffectsEnabled),
    onOutOfHints: handleOutOfHints
  });

  // --- EFFECTS ---

  // Fetch price offer on mount
  useEffect(() => {
    fetchGameConfig();
  }, [fetchGameConfig]);

  // Fetch price offer when returning to HOME (refresh offers/config)
  useEffect(() => {
    if (view === 'HOME') {
      fetchGameConfig();
    }
  }, [view, fetchGameConfig]);

  // Fetch level of the day when entering level select or game
  useEffect(() => {
    if (view === 'LEVEL_SELECT' || view === 'GAME') {
      db.getLevelOfDay().then((res) => {
        if (res.success && res.levelId != null && res.difficulty) {
          setLevelOfDay({ levelId: res.levelId, difficulty: res.difficulty });
        }
      });
    }
  }, [view]);

  // Check for reset password token in URL on app load (e.g. user opened link from email)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetPasswordToken(token);
      setShowResetPasswordModal(true);
      window.history.replaceState({}, '', window.location.pathname || '/');
    }
  }, []);

  // Also handle token when already on LOGIN view (e.g. in-app navigation with ?token=)
  useEffect(() => {
    if (view !== 'LOGIN') return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetPasswordToken(token);
      setShowResetPasswordModal(true);
      window.history.replaceState({}, '', window.location.pathname || '/');
    }
  }, [view]);

  // Restore session: if a playerName is present, sync data from server (HOME is already default)
  useEffect(() => {
    if (progress.playerName) {
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

  const handleLogin = async (userData?: { username: string; email?: string; hints?: number; points?: number; levelPassedEasy?: number; levelPassedMedium?: number; levelPassedHard?: number; puppyRunHighScore?: number }) => {
    // Use ref value first (updated immediately), fallback to state (for regular login)
    const usernameToUse = (userData?.username || loginNameRef.current.trim() || loginName.trim());
    if (!usernameToUse) return;
    const username = usernameToUse;

    // Apply user data from auth response immediately (points, hints, levels) if provided
    if (userData) {
      setProgress(prev => {
        const newClearedLevels = { ...prev.clearedLevels };
        const easyCount = userData.levelPassedEasy ?? 0;
        for (let i = 1; i <= easyCount; i++) newClearedLevels[`${Difficulty.EASY}_${i}`] = true;
        const mediumCount = userData.levelPassedMedium ?? 0;
        for (let i = 1; i <= mediumCount; i++) newClearedLevels[`${Difficulty.MEDIUM}_${i}`] = true;
        const hardCount = userData.levelPassedHard ?? 0;
        for (let i = 1; i <= hardCount; i++) newClearedLevels[`${Difficulty.HARD}_${i}`] = true;
        return {
          ...prev,
          playerName: userData.username,
          email: userData.email ?? prev.email,
          totalScore: userData.points ?? prev.totalScore,
          premiumHints: userData.hints ?? prev.premiumHints,
          clearedLevels: newClearedLevels,
          puppyRunHighScore: userData.puppyRunHighScore ?? prev.puppyRunHighScore,
          unlockedThemes: prev.unlockedThemes || ['sunny', 'night']
        };
      });
    }

    // Sync full user data from DB (points, hints, clearedLevels) before showing HOME
    await syncUserData(username);

    db.checkAchievements(username).then((r) => {
      if (r.success && r.newlyUnlocked && r.newlyUnlocked.length > 0) {
        setNewlyUnlockedAchievements(r.newlyUnlocked);
      }
    });

    setView('HOME');

    if (ambientAudioRef.current && !isMuted) {
      ambientAudioRef.current.play().catch(() => {});
    }
  };

  const handleLogout = () => {
    // Clear user data and stay on HOME (difficulty selector)
    setProgress({
      playerName: '',
      clearedLevels: {},
      totalScore: 0,
      unlockedDifficulties: [Difficulty.EASY],
      premiumHints: 0,
      selectedTheme: 'night' as ThemeType,
      unlockedThemes: ['sunny', 'night'] as ThemeType[]
    });
    localStorage.removeItem('findMyPuppy_progress');
    setLoginName('');
    setView('HOME');
        setBackgroundMusicEnabled(true);
        setSoundEffectsEnabled(true);
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
    }
  };

  const handleAccountDeleted = () => {
    handleLogout();
  };

  const handleThemeChange = (theme: ThemeType) => {
    setProgress(prev => ({ ...prev, selectedTheme: theme }));
    setShowThemeModal(false);
  };

  const handleInitLevel = useCallback(async (level: number, diff: Difficulty) => {
    // Stop timer first to prevent it from continuing
    setIsTimerRunning(false);
    resetHints();
    setWrongAttempts(0); // Reset wrong attempts for new level
    
    const result = await initLevel(level, diff, gameConfig ?? undefined);
    
    // Always reset timer to the full time limit for a fresh start
    // Set timeLimit first, then reset timer to ensure fresh start
    if (result.timeLimit !== null) {
      setTimeLimit(result.timeLimit);
      // Reset timer to full time limit - this ensures fresh start even for same level
      setTimeLeft(result.timeLimit);
      resetTimer(); // Force reset using resetKey
    } else {
      setTimeLimit(null);
      setTimeLeft(null);
    }
    
    // Ensure timer is stopped until image loads
    setIsTimerRunning(false);
  }, [initLevel, resetHints, setTimeLeft, resetTimer, gameConfig]);

  const handleLevelSelect = (levelId: number) => {
    setCurrentLevelId(levelId);
    setView('GAME');
    handleInitLevel(levelId, selectedDifficulty);
  };

  const handleLevelClear = useCallback(async () => {
    playSfx('clear', soundEffectsEnabled);
    const levelKey = `${selectedDifficulty}_${currentLevelId}`;
    const isFirstClear = !progress.clearedLevels[levelKey];
    let pointsAwarded = 0;
    
    if (isFirstClear && gameConfig) {
      if (selectedDifficulty === Difficulty.EASY) pointsAwarded = gameConfig.pointsPerLevelEasy ?? 5;
      if (selectedDifficulty === Difficulty.MEDIUM) pointsAwarded = gameConfig.pointsPerLevelMedium ?? 10;
      if (selectedDifficulty === Difficulty.HARD) pointsAwarded = gameConfig.pointsPerLevelHard ?? 15;
    } else if (isFirstClear) {
      if (selectedDifficulty === Difficulty.EASY) pointsAwarded = 5;
      if (selectedDifficulty === Difficulty.MEDIUM) pointsAwarded = 10;
      if (selectedDifficulty === Difficulty.HARD) pointsAwarded = 15;
    }

    const isLevelOfDay = levelOfDay && levelOfDay.levelId === currentLevelId && levelOfDay.difficulty === selectedDifficulty;
    if (isFirstClear && isLevelOfDay) pointsAwarded *= 2;

    setProgress(prev => {
      const newTotalScore = prev.totalScore + pointsAwarded;
      const updatedClearedLevels = { ...prev.clearedLevels, [levelKey]: true };
      
      const countLevelsPassed = (difficulty: Difficulty) => {
        return Object.keys(updatedClearedLevels).filter(key => {
          const [diff] = key.split('_');
          return diff === difficulty && updatedClearedLevels[key];
        }).length;
      };
      
      const levelPassedEasy = countLevelsPassed(Difficulty.EASY);
      const levelPassedMedium = countLevelsPassed(Difficulty.MEDIUM);
      const levelPassedHard = countLevelsPassed(Difficulty.HARD);
      
      // Calculate total completed games (all difficulties combined)
      const totalCompletedGames = levelPassedEasy + levelPassedMedium + levelPassedHard;
      
      // Check for theme unlock (every 10 games, starting from game 10)
      let newlyUnlockedTheme: ThemeType | null = null;
      if (isFirstClear && prev.playerName && totalCompletedGames > 0 && totalCompletedGames % 10 === 0) {
        // Get all themes and find the next locked one
        const allThemes = Object.keys(THEME_CONFIGS) as ThemeType[];
        const currentUnlocked = prev.unlockedThemes || ['sunny', 'night'];
        const nextLockedTheme = allThemes.find(theme => !currentUnlocked.includes(theme));
        
        if (nextLockedTheme) {
          newlyUnlockedTheme = nextLockedTheme;
          // Unlock via games method
          db.unlockTheme(prev.playerName, nextLockedTheme, 'games').then((result) => {
            if (result.success && result.unlockedThemes) {
              setProgress(p => ({
                ...p,
                unlockedThemes: result.unlockedThemes as ThemeType[]
              }));
            }
          }).catch(err => {
            console.error('Failed to unlock theme:', err);
          });
        }
      }
      
      if (prev.playerName) {
        if (pointsAwarded > 0) {
          db.updatePoints(prev.playerName, newTotalScore).catch(err => {
            console.error('Failed to update points in database:', err);
          });
        }
        db.updateLevelPassed(prev.playerName, selectedDifficulty, 
          selectedDifficulty === Difficulty.EASY ? levelPassedEasy :
          selectedDifficulty === Difficulty.MEDIUM ? levelPassedMedium :
          levelPassedHard
        ).catch(err => {
          console.error('Failed to update level passed count in database:', err);
        });
        db.checkAchievements(prev.playerName).then((r) => {
          if (r.success && r.newlyUnlocked && r.newlyUnlocked.length > 0) {
            setNewlyUnlockedAchievements(r.newlyUnlocked);
          }
        });
      }
      
      if (levelPassedEasy === 10 && selectedDifficulty === Difficulty.EASY) setShowUnlockCelebration(Difficulty.MEDIUM);
      else if (levelPassedMedium === 10 && selectedDifficulty === Difficulty.MEDIUM) setShowUnlockCelebration(Difficulty.HARD);
      
      return {
        ...prev,
        clearedLevels: updatedClearedLevels,
        totalScore: newTotalScore,
        unlockedThemes: newlyUnlockedTheme 
          ? [...(prev.unlockedThemes || ['sunny', 'night']), newlyUnlockedTheme]
          : prev.unlockedThemes
      };
    });

    setView('WIN');
    if (!progress.playerName && !hasShownFirstTimeLoginPromptRef.current) {
      hasShownFirstTimeLoginPromptRef.current = true;
      setShowFirstTimeLoginPrompt(true);
    }
  }, [playSfx, soundEffectsEnabled, selectedDifficulty, currentLevelId, progress.clearedLevels, progress.playerName, gameConfig, levelOfDay]);

  const handlePuppyFound = useCallback((id: string) => {
    playSfx('found', soundEffectsEnabled);

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
  }, [playSfx, soundEffectsEnabled, updatePuppy, gameState.puppies, handleLevelClear]);
  
  const handleRetry = () => {
    handleInitLevel(currentLevelId, selectedDifficulty);
    setView('GAME');
  };

  const handleQuitGame = () => {
    setShowQuitConfirm(false);
    setIsTimerRunning(false);
    // Reset timer for next time
    if (timeLimit !== null) {
      setTimeLeft(timeLimit);
      resetTimer();
    } else {
      setTimeLeft(null);
    }
    setView('LEVEL_SELECT');
  };

  const openHintShop = () => {
    if (!progress.playerName) {
      setView('LOGIN');
      return;
    }
    openPaymentModal({
      title: 'Hint Shop',
      description: 'Stock up on hints for the harder levels!'
    });
  };

  const handlePayWithPoints = () => {
    if (progress.totalScore >= 10) {
      playSfx('pay', soundEffectsEnabled);
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

  // Toggle functions for audio controls
  const toggleBackgroundMusic = () => {
    const newValue = !backgroundMusicEnabled;
    setBackgroundMusicEnabled(newValue);
    localStorage.setItem('findMyPuppy_backgroundMusic', JSON.stringify(newValue));
  };
  
  const toggleSoundEffects = () => {
    const newValue = !soundEffectsEnabled;
    setSoundEffectsEnabled(newValue);
    localStorage.setItem('findMyPuppy_soundEffects', JSON.stringify(newValue));
  };

  const toggleHaptics = () => {
    const newValue = !hapticsEnabled;
    setHapticsEnabled(newValue);
    localStorage.setItem('findMyPuppy_hapticsEnabled', JSON.stringify(newValue));
    if (newValue) triggerHaptic('MEDIUM'); // Feedback when enabling
  };
  
  // Legacy toggle for backward compatibility
  const toggleMute = () => {
    const newValue = !isMuted;
    setBackgroundMusicEnabled(newValue);
    setSoundEffectsEnabled(newValue);
    localStorage.setItem('findMyPuppy_backgroundMusic', JSON.stringify(newValue));
    localStorage.setItem('findMyPuppy_soundEffects', JSON.stringify(newValue));
  };

  const handleBack = useCallback(() => {
    // 1. If any modal is open, close it and ensure we are on HOME (Select Difficulty)
    if (showInfoModal || showThemeModal || showPurchaseHistoryModal || showPaymentModal || showLeaderboard || showSettingsModal) {
      setShowInfoModal(false);
      setShowLeaderboard(false);
      setShowThemeModal(false);
      setShowPurchaseHistoryModal(false);
      setShowSettingsModal(false);
      closePaymentModal();
      setView('HOME');
      return;
    }

    // 2. If quit confirmation is open, just close it
    if (showQuitConfirm) {
      setShowQuitConfirm(false);
      return;
    }

    // 3. Handle View-specific back logic
    switch (view) {
      case 'GAME':
        // Show confirmation pop-up, timer keeps running
        setShowQuitConfirm(true);
        break;
      case 'LEVEL_SELECT':
      case 'WIN':
      case 'GAME_OVER':
        setView('HOME');
        break;
      case 'HOME':
        // Base screen - natural back behavior handled by history stack
        break;
      case 'LOGIN':
      case 'DELETE_ACCOUNT':
        setView('HOME');
        break;
      default:
        break;
    }
  }, [
    view, 
    showInfoModal, 
    showThemeModal, 
    showPurchaseHistoryModal, 
    showPaymentModal, 
    showQuitConfirm, 
    showSettingsModal,
    closePaymentModal
  ]);

  // Sync history state to intercept hardware back button on Android/Mobile
  useEffect(() => {
    // Base screen: HOME (Select Difficulty) only; LOGIN and DELETE_ACCOUNT are sub-screens that back navigates from
    const isBaseScreen = view === 'HOME' && 
                         !showInfoModal && !showThemeModal && 
                         !showPurchaseHistoryModal && !showPaymentModal && 
                         !showQuitConfirm && !showLeaderboard && !showSettingsModal;

    if (!isBaseScreen) {
      // If we are not on a base screen, ensure there is a history entry to "pop"
      // This prevents the hardware back button from closing the app immediately.
      if (window.history.state?.page !== 'sub-screen') {
        window.history.pushState({ page: 'sub-screen' }, '');
      }
    }

    const onPopState = () => {
      // If the back button was pressed and we are in a sub-screen/modal,
      // intercept it and run our custom back logic.
      if (!isBaseScreen) {
        handleBack();
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [view, showInfoModal, showThemeModal, showPurchaseHistoryModal, showPaymentModal, showQuitConfirm, showLeaderboard, showSettingsModal, handleBack]);

  if (maintenanceMode?.enabled) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Under maintenance</h1>
        <p className="text-slate-300 max-w-md">{maintenanceMode.message || 'Please try again later.'}</p>
      </div>
    );
  }

  return (
    <div className="mobile-app-container">
      
      {/* PC Background Decorations (Web Only) */}
      <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden hidden sm:block">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-black"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
      </div>

      {/* Physical Phone Frame Container */}
      <div className={`mobile-phone-frame shadow-2xl ${activeTheme.background} transition-colors duration-500`}>
         
        {view === 'LOGIN' && (
          <LoginView 
            loginName={loginName}
            setLoginName={(name) => {
              loginNameRef.current = name;
              setLoginName(name);
            }}
            onLogin={handleLogin}
            onForgotPassword={() => setShowForgotPasswordModal(true)}
            onPlayAsGuest={() => setView('HOME')}
          />
        )}

        {view === 'DELETE_ACCOUNT' && (
          <DeleteAccountView
            onBack={() => setView('HOME')}
            onAccountDeleted={handleAccountDeleted}
          />
        )}

        {view === 'HOME' && (
          <HomeView
            progress={progress}
            activeTheme={activeTheme}
            isActiveView={view === 'HOME'}
            onSelectDifficulty={(diff) => {
              setSelectedDifficulty(diff);
              setView('LEVEL_SELECT');
            }}
            onToggleMute={toggleMute}
            isMuted={isMuted}
            backgroundMusicEnabled={backgroundMusicEnabled}
            soundEffectsEnabled={soundEffectsEnabled}
            onToggleBackgroundMusic={toggleBackgroundMusic}
            onToggleSoundEffects={toggleSoundEffects}
            onOpenThemeModal={() => setShowThemeModal(true)}
            onOpenInfoModal={() => setShowInfoModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenHintShop={openHintShop}
            onOpenPurchaseHistory={() => setShowPurchaseHistoryModal(true)}
            onOpenReferModal={() => setShowReferModal(true)}
            onOpenAchievements={() => setShowAchievementsModal(true)}
            onLogout={handleLogout}
            onOpenLogin={() => setView('LOGIN')}
            priceOffer={priceOffer}
            onHintsUpdated={(newHints) => {
              setProgress(prev => ({ ...prev, premiumHints: newHints }));
              // Also sync to database
              if (progress.playerName) {
                db.updateHints(progress.playerName, newHints).catch(err => {
                  console.error('Failed to update hints in database:', err);
                });
              }
            }}
            onPointsUpdated={(newPoints) => {
              setProgress(prev => ({ ...prev, totalScore: newPoints, points: newPoints }));
              // Sync points to database
              if (progress.playerName) {
                db.updatePoints(progress.playerName, newPoints).catch(err => {
                  console.error('Failed to update points in database:', err);
                });
              }
            }}
          />
        )}
        
        {view === 'LEVEL_SELECT' && (
          <LevelSelector 
            difficulty={selectedDifficulty}
            clearedLevels={progress.clearedLevels}
            onSelectLevel={handleLevelSelect}
            onBack={handleBack}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            backgroundMusicEnabled={backgroundMusicEnabled}
            soundEffectsEnabled={soundEffectsEnabled}
            onToggleBackgroundMusic={toggleBackgroundMusic}
            onToggleSoundEffects={toggleSoundEffects}
            currentTheme={progress.selectedTheme || 'night'}
            levelOfDay={levelOfDay}
          />
        )}

        {/* Render Game Underneath Modals for better UX */}
        {(view === 'GAME' || view === 'WIN' || view === 'GAME_OVER' || view === 'GAME_LOST') && (
          <GameView
            gameState={gameState}
            selectedDifficulty={selectedDifficulty}
            currentLevelId={currentLevelId}
            timeLeft={timeLeft}
            formatTime={formatTime}
            showHints={showHints}
            freeHintsRemaining={freeHintsRemaining}
            totalHintsRemaining={totalHintsRemaining}
            currentHintType={currentHintType}
            currentHintCount={currentHintCount}
            hasHints={hasHints}
            hasPremiumHints={hasPremiumHints}
            isMuted={isMuted}
            backgroundMusicEnabled={backgroundMusicEnabled}
            soundEffectsEnabled={soundEffectsEnabled}
            onPuppyFound={handlePuppyFound}
            onImageLoaded={handleImageLoaded}
            onUseHint={handleUseHint}
            onToggleMute={toggleMute}
            onToggleBackgroundMusic={toggleBackgroundMusic}
            onToggleSoundEffects={toggleSoundEffects}
            onBack={handleBack}
            onWrongClick={handleWrongClick}
            wrongAttempts={wrongAttempts}
            wrongTapLimit={wrongTapLimit}
            currentTheme={progress.selectedTheme || 'night'}
          />
        )}

        {view === 'WIN' && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl relative border-4 border-white">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-bounce-short">
                <i className="fas fa-trophy text-6xl text-yellow-500 drop-shadow-sm"></i>
              </div>
              
              <h2 className="text-3xl font-black text-slate-800 mt-12 mb-2">Level Clear!</h2>
              <p className="text-slate-500 font-medium mb-6">
                Fantastic job finding all the pups!
                {levelOfDay && levelOfDay.levelId === currentLevelId && levelOfDay.difficulty === selectedDifficulty && (
                  <span className="block mt-2 text-amber-600 font-bold">🎉 2× Points Bonus!</span>
                )}
              </p>
              
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
            
            {/* First-time login prompt (guest after first clear) */}
            {showFirstTimeLoginPrompt && (
              <div className="absolute inset-0 z-[60] bg-black/70 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl p-6 max-w-sm text-center shadow-2xl border-4 border-brand/30">
                  <p className="text-lg font-bold text-slate-800 mb-2">Save your progress?</p>
                  <p className="text-slate-600 text-sm mb-4">Log in to sync scores, hints, and unlock the leaderboard!</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => { setShowFirstTimeLoginPrompt(false); setView('LOGIN'); }} className="bg-brand text-white px-4 py-2 rounded-xl font-bold">
                      Log in
                    </Button>
                    <button onClick={() => setShowFirstTimeLoginPrompt(false)} className="text-slate-500 font-bold px-4 py-2 hover:text-slate-700">
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Difficulty unlock celebration */}
            {showUnlockCelebration && (
              <div className="absolute inset-0 z-[60] bg-black/70 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-gradient-to-br from-amber-100 to-yellow-200 rounded-2xl p-6 max-w-sm text-center shadow-2xl border-4 border-amber-400">
                  <p className="text-4xl mb-2">🎉</p>
                  <p className="text-xl font-black text-slate-800 mb-1">{showUnlockCelebration} Unlocked!</p>
                  <p className="text-slate-600 text-sm mb-4">You can now play {showUnlockCelebration} levels from the map.</p>
                  <Button onClick={() => setShowUnlockCelebration(null)} className="bg-amber-500 text-white px-6 py-2 rounded-xl font-bold">
                    Awesome!
                  </Button>
                </div>
              </div>
            )}
            
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

        {view === 'GAME_LOST' && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl relative border-4 border-red-200 overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="absolute animate-pulse" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    fontSize: `${10 + Math.random() * 20}px`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}>
                    <i className="fas fa-times text-red-500"></i>
                  </div>
                ))}
              </div>

              <div className="relative z-10 flex flex-col items-center">
                {/* Crying Icon - Top Center */}
                <div className="w-28 h-28 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white animate-bounce-short mb-6">
                  <i className="fas fa-sad-tear text-6xl text-white drop-shadow-lg"></i>
                </div>
                
                {/* Text Content Below Icon */}
                <h2 className="text-4xl font-black text-slate-800 mb-3 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Oops! You Lost!
                </h2>
                
                <div className="mb-6 space-y-2 w-full">
                  <p className="text-slate-600 font-bold text-lg">
                    🐾 Too Many Wrong Guesses! 🐾
                  </p>
                  <p className="text-slate-500 text-sm font-medium">
                    Those sneaky puppies are still hiding! You tapped {wrongTapLimit} wrong spots.
                  </p>
                  <p className="text-slate-400 text-xs italic mt-3">
                    "The best detectives take their time and look carefully!"
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <Button onClick={handleRetry} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all">
                    <i className="fas fa-redo mr-2"></i> Try Again
                  </Button>
                  <button onClick={() => setView('LEVEL_SELECT')} className="text-slate-400 font-bold hover:text-slate-600 transition-colors py-2">
                    <i className="fas fa-map mr-2"></i> Back to Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showThemeModal && (
          <ThemeModal 
            onClose={() => setShowThemeModal(false)}
            onSelect={handleThemeChange}
            currentTheme={progress.selectedTheme || 'night'}
            unlockedThemes={progress.unlockedThemes || ['sunny', 'night']}
            points={progress.points || progress.totalScore || 0}
            username={progress.playerName}
            onThemeUnlocked={(themes, newPoints) => {
              setProgress(prev => ({
                ...prev,
                unlockedThemes: themes,
                points: newPoints !== undefined ? newPoints : prev.points,
                totalScore: newPoints !== undefined ? newPoints : prev.totalScore
              }));
            }}
          />
        )}

        {showInfoModal && (
          <InfoModal 
            onClose={() => setShowInfoModal(false)}
            onOpenExplorerGuide={() => setShowExplorerGuide(true)}
            onOpenLeaderboard={() => {
              setShowInfoModal(false);
              setShowLeaderboard(true);
            }}
            onNavigateToDeleteAccount={() => {
              setShowInfoModal(false);
              setView('DELETE_ACCOUNT');
            }}
          />
        )}

        {showSettingsModal && (
          <SettingsModal
            onClose={() => setShowSettingsModal(false)}
            backgroundMusicEnabled={backgroundMusicEnabled}
            soundEffectsEnabled={soundEffectsEnabled}
            hapticsEnabled={hapticsEnabled}
            hapticIntensity={hapticIntensity}
            onToggleBackgroundMusic={toggleBackgroundMusic}
            onToggleSoundEffects={toggleSoundEffects}
            onToggleHaptics={toggleHaptics}
            onHapticIntensityChange={(value) => {
              setHapticIntensityState(value);
              setHapticIntensity(value);
              localStorage.setItem('findMyPuppy_hapticIntensity', String(value));
            }}
          />
        )}

        {showLeaderboard && (
          <LeaderboardModal
            isOpen={showLeaderboard}
            onClose={() => setShowLeaderboard(false)}
            activeTheme={THEME_CONFIGS[progress.selectedTheme || 'night']}
            currentUsername={progress.playerName}
          />
        )}

        {showExplorerGuide && (
          <ExplorerGuide
            activeTheme={activeTheme}
            onClose={() => setShowExplorerGuide(false)}
          />
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

        {paymentResult.type && (
          <PaymentResultModal
            result={paymentResult.type}
            message={paymentResult.message}
            errorCode={paymentResult.errorCode}
            onClose={closePaymentResult}
          />
        )}

        {showPurchaseHistoryModal && (
          <PurchaseHistoryModal
            onClose={() => setShowPurchaseHistoryModal(false)}
            username={progress.playerName}
            activeTheme={activeTheme}
          />
        )}

        {showAchievementsModal && (
          <AchievementsModal
            isOpen={showAchievementsModal}
            onClose={() => setShowAchievementsModal(false)}
            activeTheme={THEME_CONFIGS[progress.selectedTheme || 'night']}
            username={progress.playerName || null}
          />
        )}

        {showReferModal && (
          <ReferFriendModal
            isOpen={showReferModal}
            onClose={() => setShowReferModal(false)}
            activeTheme={activeTheme}
            playerName={progress.playerName}
          />
        )}

        {showForgotPasswordModal && (
          <ForgotPasswordModal
            isOpen={showForgotPasswordModal}
            onClose={() => setShowForgotPasswordModal(false)}
            activeTheme={activeTheme}
          />
        )}

        {showResetPasswordModal && resetPasswordToken && (
          <ResetPasswordModal
            isOpen={showResetPasswordModal}
            onClose={() => {
              setShowResetPasswordModal(false);
              setResetPasswordToken(null);
            }}
            activeTheme={activeTheme}
            token={resetPasswordToken}
            onSuccess={() => {
              setShowResetPasswordModal(false);
              setResetPasswordToken(null);
              setView('LOGIN');
            }}
          />
        )}

        {/* New achievements unlocked overlay */}
        {newlyUnlockedAchievements.length > 0 && (
          <div className="absolute inset-0 z-[190] bg-black/60 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-sm text-center shadow-2xl border-4 border-amber-300">
              <p className="text-2xl mb-2">🏅</p>
              <p className="text-lg font-black text-slate-800 mb-2">Achievements Unlocked!</p>
              <ul className="text-sm text-slate-600 mb-4 space-y-1">
                {newlyUnlockedAchievements.map((id) => (
                  <li key={id} className="font-bold capitalize">{id.replace(/_/g, ' ')}</li>
                ))}
              </ul>
              <Button onClick={() => setNewlyUnlockedAchievements([])} className="bg-amber-500 text-white px-6 py-2 rounded-xl font-bold">
                Cool!
              </Button>
            </div>
          </div>
        )}

        {showQuitConfirm && (
          <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className={`bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl relative border-4 ${activeTheme.id === 'night' ? 'border-indigo-500/30' : 'border-white'}`}>
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-sign-out-alt text-2xl text-red-500"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-800">Quit Game?</h2>
                <p className="text-slate-500 font-medium mt-2">Are you sure you want to quit? Your current level progress will be lost.</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleQuitGame}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200"
                >
                  Quit Game
                </Button>
                <button 
                  onClick={() => setShowQuitConfirm(false)}
                  className="py-3 px-6 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
