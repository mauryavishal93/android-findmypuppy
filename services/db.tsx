// ------------------------------------------------------------------
// AUTH SERVICE - Client Side
// ------------------------------------------------------------------

// API Base URL Configuration:
// - For production: Use the production server URL
// - For local development: Use empty string to leverage Vite proxy (recommended)
//   OR use "http://localhost:5774" for direct backend connection
// - For Android Emulator: "http://10.0.2.2:5774"
// - For Physical Device: your computer's local IP (e.g., "http://192.168.1.100:5774")

// Use production server for DB writes, or empty string to use Vite proxy in development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                            (import.meta.env.DEV ? "" : "https://findmypuppydb.onrender.com");

// Helper function to safely read JSON responses and handle non-JSON errors
async function readJsonOrThrow(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    const snippet = text.slice(0, 160).replace(/\s+/g, ' ').trim();
    throw new Error(
      `Server returned non-JSON response (HTTP ${response.status}). ` +
      `This usually means the API base URL is wrong or the server is down. Response starts with: "${snippet}"`
    );
  }
  return response.json();
}

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
}

export const db = {
  login: async (username: string, password: string, email?: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Login failed. Please check your credentials." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Login Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Please try again later." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

  signup: async (username: string, email: string, password: string, referralCode?: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, referralCode }),
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Signup failed. Username or email may already be taken." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Signup Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Please try again later." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

  updateHints: async (username: string, hints: number): Promise<{ success: boolean; message?: string; hints?: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/update-hints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, hints }),
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to update hints. Please try again." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Update Hints Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Your hints may not have been saved." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },


  updatePoints: async (username: string, points: number): Promise<{ success: boolean; message?: string; points?: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/update-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, points }),
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to update points. Please try again." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Update Points Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Your points may not have been saved." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

  updatePremium: async (username: string, premium: boolean): Promise<{ success: boolean; message?: string; premium?: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/update-premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, premium }),
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to update premium status. Please try again." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Update Premium Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Premium status may not have been updated." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

  updateLevelPassed: async (username: string, difficulty: string, levelPassed: number): Promise<{ success: boolean; message?: string; levelPassedEasy?: number; levelPassedMedium?: number; levelPassedHard?: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/update-level-passed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, difficulty, levelPassed }),
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to save your progress. Please try again." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Update Level Passed Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Your progress may not have been saved." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
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
      const response = await fetch(`${API_BASE_URL}/api/purchase-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, amount, purchaseType, pack, purchaseMode }),
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to record purchase. Please contact support if you were charged." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Create Purchase History Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Purchase may not have been recorded." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

  getPurchaseHistory: async (username: string): Promise<{ success: boolean; message?: string; purchases?: PurchaseHistory[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchase-history/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to load purchase history. Please try again." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Get Purchase History Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Unable to load purchase history." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

  getUser: async (username: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to load user data. Please try again." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Get User Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Unable to load user data." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

  getPriceOffer: async (): Promise<{ success: boolean; message?: string; offer?: PriceOffer }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/price-offer`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to load pricing. Please try again." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Get Price Offer Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Unable to load pricing information." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

  signInWithGoogle: async (idToken: string, referralCode?: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, referralCode }),
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Google sign in failed. Please try again." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Google Sign In Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Please try again later." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to send password reset email. Please check your email address." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Forgot Password Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Please try again later." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to reset password. The link may have expired." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Reset Password Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Please try again later." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
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
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/daily-checkin/status/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to load check-in status. Please try again." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Get Daily Check-In Status Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Unable to load check-in status." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
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
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/daily-checkin/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to complete check-in. Please try again." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Complete Daily Check-In Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Check-in may not have been recorded." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

  getLeaderboard: async (currentUsername?: string): Promise<{
    success: boolean;
    message?: string;
    leaderboard?: Array<{ username: string; rank: number; points: number }>;
    currentUser?: { username: string; rank: number; points: number } | null;
  }> => {
    try {
      // Add username as query parameter if provided
      const url = currentUsername 
        ? `${API_BASE_URL}/api/leaderboard?username=${encodeURIComponent(currentUsername)}`
        : `${API_BASE_URL}/api/leaderboard`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await readJsonOrThrow(response);
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to load leaderboard. Please try again." };
      }
      return data;
    } catch (error: any) {
      console.error("DB Get Leaderboard Error:", error);
      if (error.message && error.message.includes('non-JSON response')) {
        return { success: false, message: "Server error. Unable to load leaderboard." };
      }
      return { success: false, message: "Connection error. Please check your internet connection." };
    }
  },

};