// ------------------------------------------------------------------
// AUTH SERVICE - Client Side
// Network calls use a secure layer so URLs and endpoints are not
// visible in errors or console to end users.
// ------------------------------------------------------------------

import { secureFetch, parseJsonResponse, NETWORK_ERROR_MESSAGE } from './network';

// API base: not exposed in errors or logs. Export for config only (e.g. Razorpay callback).
const getApiBase = (): string =>
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '' : 'https://findmypuppydb.onrender.com');

export const API_BASE_URL = getApiBase();

export interface User {
  username: string;
  email: string;
  hints?: number;
  points?: number;
  premium?: boolean;
  levelPassedEasy?: number;
  levelPassedMedium?: number;
  levelPassedHard?: number;
  referredBy?: string | null;
  lastPlayedAt?: string | null;
  comebackBonusClaimed?: boolean;
  achievements?: string[];
  puppyRunHighScore?: number;
  unlockedThemes?: string[];
}

export interface PurchaseHistory {
  purchaseId: string;
  purchaseDate: Date | string;
  amount: number;
  purchaseType: 'Premium' | 'Hints';
  pack: string;
  purchaseMode?: 'Money' | 'Points'; // Money (₹) or Points (Pts)
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface PriceOffer {
  hintPack: string;
  marketPrice: number;
  offerPrice: number;
  hintCount: number;
  offerReason?: string;
}

export interface GameConfig {
  puppyCountEasy: number;
  puppyCountMedium: number;
  puppyCountHard: number;
  timerMediumSeconds: number;
  timerHardSeconds: number;
  wrongTapLimit: number;
  pointsPerLevelEasy: number;
  pointsPerLevelMedium: number;
  pointsPerLevelHard: number;
  levelsEnabled: boolean;
  timerEnabled: boolean;
}

export const db = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<AuthResponse>(response);
      if (!ok) return { success: false, message: userMessage || 'Login failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  signup: async (username: string, email: string, password: string, referralCode?: string): Promise<AuthResponse> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, referralCode }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<AuthResponse>(response);
      if (!ok) return { success: false, message: userMessage || 'Signup failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  updateHints: async (username: string, hints: number): Promise<{ success: boolean; message?: string; hints?: number }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/user/update-hints', {
        method: 'POST',
        body: JSON.stringify({ username, hints }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string; hints?: number }>(response);
      if (!ok) return { success: false, message: userMessage || 'Update failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },


  updatePoints: async (username: string, points: number): Promise<{ success: boolean; message?: string; points?: number }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/user/update-points', {
        method: 'POST',
        body: JSON.stringify({ username, points }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string; points?: number }>(response);
      if (!ok) return { success: false, message: userMessage || 'Update failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  updatePremium: async (username: string, premium: boolean): Promise<{ success: boolean; message?: string; premium?: boolean }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/user/update-premium', {
        method: 'POST',
        body: JSON.stringify({ username, premium }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string; premium?: boolean }>(response);
      if (!ok) return { success: false, message: userMessage || 'Update failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  updateLevelPassed: async (username: string, difficulty: string, levelPassed: number): Promise<{ success: boolean; message?: string; levelPassedEasy?: number; levelPassedMedium?: number; levelPassedHard?: number }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/user/update-level-passed', {
        method: 'POST',
        body: JSON.stringify({ username, difficulty, levelPassed }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string; levelPassedEasy?: number; levelPassedMedium?: number; levelPassedHard?: number }>(response);
      if (!ok) return { success: false, message: userMessage || 'Update failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  createPurchaseHistory: async (
    username: string,
    amount: number,
    purchaseType: 'Premium' | 'Hints',
    pack: string,
    purchaseMode: 'Money' | 'Points' = 'Money'
  ): Promise<{ success: boolean; message?: string; purchase?: PurchaseHistory }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/purchase-history', {
        method: 'POST',
        body: JSON.stringify({ username, amount, purchaseType, pack, purchaseMode }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string; purchase?: PurchaseHistory }>(response);
      if (!ok) return { success: false, message: userMessage || 'Save failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  getPurchaseHistory: async (username: string): Promise<{ success: boolean; message?: string; purchases?: PurchaseHistory[] }> => {
    try {
      const response = await secureFetch(getApiBase(), `/api/purchase-history/${username}`, { method: 'GET' });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string; purchases?: PurchaseHistory[] }>(response);
      if (!ok) return { success: false, message: userMessage || 'Load failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  getUser: async (username: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const response = await secureFetch(getApiBase(), `/api/user/${username}`, { method: 'GET' });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string; user?: User }>(response);
      if (!ok) return { success: false, message: userMessage || 'Load failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  getPriceOffer: async (): Promise<{ success: boolean; message?: string; offer?: PriceOffer }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/price-offer', { method: 'GET' });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string; offer?: PriceOffer }>(response);
      if (!ok) return { success: false, message: userMessage || 'Load failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  getGameConfig: async (): Promise<{
    success: boolean;
    message?: string;
    gameConfig?: GameConfig | null;
    priceOffer?: PriceOffer | null;
    maintenance?: { enabled: boolean; message: string | null };
  }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/game-config', { method: 'GET' });
      const { ok, data, userMessage } = await parseJsonResponse<{
        success: boolean;
        message?: string;
        gameConfig?: GameConfig | null;
        priceOffer?: PriceOffer | null;
        maintenance?: { enabled: boolean; message: string | null };
      }>(response);
      if (!ok) return { success: false, message: userMessage || 'Load failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  signInWithGoogle: async (idToken: string, referralCode?: string): Promise<AuthResponse> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/auth/google/signin', {
        method: 'POST',
        body: JSON.stringify({ idToken, referralCode }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<AuthResponse>(response);
      if (!ok) return { success: false, message: userMessage || 'Sign in failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string }>(response);
      if (!ok) return { success: false, message: userMessage || 'Request failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string }>(response);
      if (!ok) return { success: false, message: userMessage || 'Reset failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  deleteAccount: async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/auth/delete-account', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string }>(response);
      if (!ok) return { success: false, message: userMessage || 'Failed to delete account' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  deleteAccountWithGoogle: async (idToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/auth/delete-account-google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string }>(response);
      if (!ok) return { success: false, message: userMessage || 'Failed to delete account' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  getDailyCheckInStatus: async (username: string): Promise<{
    success: boolean;
    message?: string;
    lastCheckInDate?: string | null;
    checkInStreak?: number;
    totalCheckIns?: number;
    hasCheckedInToday?: boolean;
    puppyAge?: number;
    puppySize?: number;
    hasUsedFreezeThisWeek?: boolean;
    streakFreezeAvailable?: boolean;
  }> => {
    try {
      const response = await secureFetch(getApiBase(), `/api/daily-checkin/status/${username}`, { method: 'GET' });
      const { ok, data, userMessage } = await parseJsonResponse<{
        success: boolean;
        message?: string;
        lastCheckInDate?: string | null;
        checkInStreak?: number;
        totalCheckIns?: number;
        hasCheckedInToday?: boolean;
        puppyAge?: number;
        puppySize?: number;
        hasUsedFreezeThisWeek?: boolean;
        streakFreezeAvailable?: boolean;
      }>(response);
      if (!ok) return { success: false, message: userMessage || 'Load failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  completeDailyCheckIn: async (
    username: string
  ): Promise<{
    success: boolean;
    message?: string;
    hintsEarned?: number;
    pointsEarned?: number;
    totalHints?: number;
    totalPoints?: number;
    puppyAge?: number;
    puppySize?: number;
    checkInStreak?: number;
    milestone?: '7days' | '30days' | '1year' | null;
    usedStreakFreeze?: boolean;
  }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/daily-checkin/complete', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{
        success: boolean;
        message?: string;
        hintsEarned?: number;
        pointsEarned?: number;
        totalHints?: number;
        totalPoints?: number;
        puppyAge?: number;
        puppySize?: number;
        checkInStreak?: number;
        milestone?: '7days' | '30days' | '1year' | null;
        usedStreakFreeze?: boolean;
      }>(response);
      if (!ok) return { success: false, message: userMessage || 'Request failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  getDailyPuzzleStatus: async (username: string): Promise<{ success: boolean; hasCompletedToday?: boolean; lastCompletedDate?: string | null }> => {
    try {
      const response = await secureFetch(getApiBase(), `/api/daily-puzzle/status/${username}`, { method: 'GET' });
      const { ok, data } = await parseJsonResponse<{ success: boolean; hasCompletedToday?: boolean; lastCompletedDate?: string | null }>(response);
      if (!ok) return { success: false };
      return data;
    } catch {
      return { success: false };
    }
  },

  completeDailyPuzzle: async (username: string, puzzleId: string, score: number): Promise<{ success: boolean; message?: string; hintsEarned?: number; totalHints?: number; highScore?: number }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/daily-puzzle/complete', {
        method: 'POST',
        body: JSON.stringify({ username, puzzleId, score }),
      });
      const { ok, data } = await parseJsonResponse<{ success: boolean; message?: string; hintsEarned?: number; totalHints?: number; highScore?: number }>(response);
      if (!ok) return { success: false };
      return data;
    } catch {
      return { success: false };
    }
  },

  getLeaderboardReferrals: async (): Promise<{ success: boolean; leaderboard?: Array<{ username: string; rank: number; referredCount: number }> }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/leaderboard/referrals', { method: 'GET' });
      const { ok, data } = await parseJsonResponse<{ success: boolean; leaderboard?: Array<{ username: string; rank: number; referredCount: number }> }>(response);
      if (!ok) return { success: false };
      return data;
    } catch {
      return { success: false };
    }
  },

  getLevelOfDay: async (): Promise<{ success: boolean; levelId?: number; difficulty?: string; date?: string }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/level-of-day', { method: 'GET' });
      const { ok, data } = await parseJsonResponse<{ success: boolean; levelId?: number; difficulty?: string; date?: string }>(response);
      if (!ok) return { success: false };
      return data;
    } catch {
      return { success: false };
    }
  },

  getAchievements: async (): Promise<{ success: boolean; achievements?: Array<{ id: string; name: string; desc: string; icon: string }> }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/achievements', { method: 'GET' });
      const { ok, data } = await parseJsonResponse<{ success: boolean; achievements?: Array<{ id: string; name: string; desc: string; icon: string }> }>(response);
      if (!ok) return { success: false };
      return data;
    } catch {
      return { success: false };
    }
  },

  checkAchievements: async (username: string): Promise<{ success: boolean; achievements?: string[]; newlyUnlocked?: string[] }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/achievements/check', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      const { ok, data } = await parseJsonResponse<{ success: boolean; achievements?: string[]; newlyUnlocked?: string[] }>(response);
      if (!ok) return { success: false };
      return data;
    } catch {
      return { success: false };
    }
  },

  getWeeklyChallenge: async (username?: string): Promise<{
    success: boolean;
    week?: string;
    target?: { total: number };
    progress?: { easy: number; medium: number; hard: number };
    totalProgress?: number;
    claimed?: boolean;
  }> => {
    try {
      const path = username ? `/api/weekly-challenge?username=${encodeURIComponent(username)}` : '/api/weekly-challenge';
      const response = await secureFetch(getApiBase(), path, { method: 'GET' });
      const { ok, data } = await parseJsonResponse<{
        success: boolean;
        week?: string;
        target?: { total: number };
        progress?: { easy: number; medium: number; hard: number };
        totalProgress?: number;
        claimed?: boolean;
      }>(response);
      if (!ok) return { success: false };
      return data;
    } catch {
      return { success: false };
    }
  },

  claimWeeklyChallenge: async (username: string): Promise<{ success: boolean; message?: string; hintsEarned?: number; totalHints?: number }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/weekly-challenge/claim', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      const { ok, data } = await parseJsonResponse<{ success: boolean; message?: string; hintsEarned?: number; totalHints?: number }>(response);
      if (!ok) return { success: false };
      return data;
    } catch {
      return { success: false };
    }
  },

  getComebackBonusEligibility: async (username: string): Promise<{ success: boolean; eligible?: boolean }> => {
    try {
      const response = await secureFetch(getApiBase(), `/api/comeback-bonus/eligibility/${username}`, { method: 'GET' });
      const { ok, data } = await parseJsonResponse<{ success: boolean; eligible?: boolean }>(response);
      if (!ok) return { success: false };
      return data;
    } catch {
      return { success: false };
    }
  },

  claimComebackBonus: async (username: string): Promise<{ success: boolean; message?: string; hintsEarned?: number; totalHints?: number }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/comeback-bonus/claim', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      const { ok, data } = await parseJsonResponse<{ success: boolean; message?: string; hintsEarned?: number; totalHints?: number }>(response);
      if (!ok) return { success: false };
      return data;
    } catch {
      return { success: false };
    }
  },

  getLeaderboard: async (currentUsername?: string): Promise<{
    success: boolean;
    message?: string;
    leaderboard?: Array<{ username: string; rank: number; points: number }>;
    currentUser?: { username: string; rank: number; points: number } | null;
  }> => {
    try {
      const path = currentUsername
        ? `/api/leaderboard?username=${encodeURIComponent(currentUsername)}`
        : '/api/leaderboard';
      const response = await secureFetch(getApiBase(), path, { method: 'GET' });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string; leaderboard?: Array<{ username: string; rank: number; points: number }>; currentUser?: { username: string; rank: number; points: number } | null }>(response);
      if (!ok) return { success: false, message: userMessage || 'Load failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  createRazorpayOrder: async (amount: number, receipt: string): Promise<{ success: boolean; message?: string; order?: { id: string; amount: number; currency: string } }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/razorpay/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount, receipt }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string; order?: { id: string; amount: number; currency: string } }>(response);
      if (!ok) return { success: false, message: userMessage || 'Failed' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  verifyRazorpayPayment: async (params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    username: string;
    pack: string;
    hintsToAdd: number;
    amount: number;
  }): Promise<{ success: boolean; message?: string; errorCode?: string }> => {
    try {
      const response = await secureFetch(getApiBase(), '/api/razorpay/verify-payment', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; message?: string; errorCode?: string }>(response);
      if (!ok) return { success: false, message: userMessage || 'Verification failed', errorCode: (data as { errorCode?: string })?.errorCode };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  getUnlockedThemes: async (username: string): Promise<{ success: boolean; unlockedThemes?: string[]; message?: string }> => {
    try {
      const response = await secureFetch(getApiBase(), `/api/user/${username}/themes`, {
        method: 'GET',
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; unlockedThemes?: string[]; message?: string }>(response);
      if (!ok) return { success: false, message: userMessage || 'Failed to fetch themes' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  unlockTheme: async (username: string, theme: string, unlockMethod: 'games' | 'points'): Promise<{ success: boolean; unlockedThemes?: string[]; points?: number; message?: string }> => {
    try {
      const response = await secureFetch(getApiBase(), `/api/user/${username}/unlock-theme`, {
        method: 'POST',
        body: JSON.stringify({ theme, unlockMethod }),
      });
      const { ok, data, userMessage } = await parseJsonResponse<{ success: boolean; unlockedThemes?: string[]; points?: number; message?: string }>(response);
      if (!ok) return { success: false, message: userMessage || 'Failed to unlock theme' };
      return data;
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

};