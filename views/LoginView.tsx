
import React, { useState, useEffect, useRef } from 'react';
import { GameLogo } from '../components/GameLogo';
import { Button } from '../components/ui/Button';
import { db } from '../services/db';
import { Capacitor, registerPlugin } from '@capacitor/core';

// Google OAuth types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

interface LoginViewProps {
  loginName: string;
  setLoginName: (name: string) => void;
  onLogin: () => void;
  onForgotPassword?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ loginName, setLoginName, onLogin, onForgotPassword }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [googleClientIdConfigured, setGoogleClientIdConfigured] = useState(false);
  const [isNativeGoogleAvailable, setIsNativeGoogleAvailable] = useState(false);
  const googleSignInButtonRef = useRef<HTMLDivElement>(null);
  const googleSignUpButtonRef = useRef<HTMLDivElement>(null);

  // Native Google auth plugin (Android)
  interface NativeGoogleAuthPlugin {
    signIn(options?: { serverClientId?: string; forceAccountPicker?: boolean }): Promise<{ idToken: string; email?: string; name?: string; googleId?: string }>;
  }
  const NativeGoogleAuth = registerPlugin<NativeGoogleAuthPlugin>('NativeGoogleAuth');
  
  // Immediate check for client ID on mount (for Android)
  React.useEffect(() => {
    const checkClientId = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
                      (window as any).VITE_GOOGLE_CLIENT_ID || 
                      (window as any).googleClientId;
      if (clientId) {
        console.log('[Google OAuth] Client ID found on check:', clientId.substring(0, 20) + '...');
      } else {
        console.log('[Google OAuth] Client ID not injected yet, will use fallback or wait for injection');
      }
    };
    checkClientId();
    // Check again after a short delay
    setTimeout(checkClientId, 100);
  }, []);

  // Detect whether we're running inside a native Android container (Capacitor)
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform?.() ? Capacitor.isNativePlatform() : Capacitor.getPlatform() !== 'web';
    const isAndroid = Capacitor.getPlatform() === 'android';
    setIsNativeGoogleAvailable(Boolean(isNative && isAndroid));
  }, []);

  // Auto-detect referral code from URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      setIsSignup(true); // Automatically switch to signup if a referral code is present
    }
  }, []);

  // Handle Google OAuth callback
  const handleGoogleSignIn = React.useCallback(async (response: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      console.log('[Google OAuth] Callback received:', response);
      
      // Handle error notifications from Google OAuth
      if (response && response.error) {
        const errorObj = response.error;
        let errorMessage = "Google sign-in failed. Please try again.";
        
        if (typeof errorObj === 'string') {
          errorMessage = errorObj;
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.type) {
          errorMessage = `Google sign-in error: ${errorObj.type}`;
        }
        
        console.error("Google OAuth Error Details:", errorObj);
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Validate response structure
      if (!response || !response.credential) {
        const errorMsg = "Invalid Google response. Please try again.";
        console.error("[Google OAuth] No credential in response:", response);
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      const result = await db.signInWithGoogle(response.credential, referralCode.trim() || undefined);
      
      if (result.success && result.user?.username) {
        const username = result.user.username;
        setSuccessMsg(result.message || "Welcome back!");
        setLoginName(username);
        setTimeout(() => {
          onLogin();
        }, 800);
      } else {
        setError(result.message || "Google sign in failed. Please try again.");
        setIsLoading(false);
      }
    } catch (e: any) {
      console.error("Google Sign In catch error:", e);
      setError("Connection error during Google Sign-In. Please check your internet.");
      setIsLoading(false);
    }
  }, [referralCode, onLogin, setLoginName]);

  // Native Google Sign-In (Android) — fallback when GIS web button doesn't load in WebView
  const handleNativeGoogleSignIn = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Must be the Web Client ID to request idToken on Android.
      const FALLBACK_WEB_CLIENT_ID = '977430971765-k7csafri1sidju96oikgr74ab0l9j4kn.apps.googleusercontent.com';
      const serverClientId = (window as any).VITE_GOOGLE_CLIENT_ID || (window as any).googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || FALLBACK_WEB_CLIENT_ID;

      // forceAccountPicker=true ensures the user can select a Google account every time.
      const res = await NativeGoogleAuth.signIn({ serverClientId, forceAccountPicker: true });
      if (!res?.idToken) {
        throw new Error('Native Google Sign-In did not return an idToken');
      }

      const result = await db.signInWithGoogle(res.idToken, referralCode.trim() || undefined);
      if (result.success && result.user?.username) {
        const username = result.user.username;
        setSuccessMsg(result.message || 'Welcome!');
        setLoginName(username);
        setTimeout(() => onLogin(), 800);
        return;
      }

      setError(result.message || 'Google sign in failed. Please try again.');
      setIsLoading(false);
    } catch (e: any) {
      console.error('[Native Google OAuth] Error:', e);
      const msg =
        e?.message ||
        e?.toString?.() ||
        (typeof e === 'string' ? e : '') ||
        'Native Google Sign-In failed.';
      setError(`Google Sign-In failed on Android. ${msg}`);
      setIsLoading(false);
    }
  }, [NativeGoogleAuth, referralCode, onLogin, setLoginName]);

  // Initialize Google OAuth
  useEffect(() => {
    // On Android (Capacitor), use the native Google Sign-In button.
    // The GIS web button can be unreliable inside WebView and also clutters the UI.
    if (isNativeGoogleAvailable) {
      setGoogleClientIdConfigured(false);
      return;
    }

    let isInitialized = false;
    
    const initializeGoogleSignIn = () => {
      // Prevent multiple initializations
      if (isInitialized) {
        return;
      }

      if (!window.google?.accounts?.id) {
        console.log('[Google OAuth] Google Identity Services not loaded yet');
        return;
      }

      // Google Client ID - Check multiple sources
      // For Android, the client ID is injected via window.VITE_GOOGLE_CLIENT_ID
      // Fallback to the known Web Client ID if injection fails
      const FALLBACK_CLIENT_ID = '977430971765-k7csafri1sidju96oikgr74ab0l9j4kn.apps.googleusercontent.com';
      
      const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
                                (window as any).VITE_GOOGLE_CLIENT_ID || 
                                (window as any).googleClientId ||
                                FALLBACK_CLIENT_ID;
      
      console.log('[Google OAuth] Client ID check:', {
        fromEnv: import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'found' : 'not set',
        fromWindow: (window as any).VITE_GOOGLE_CLIENT_ID ? 'found' : 'not set',
        fromGoogleClientId: (window as any).googleClientId ? 'found' : 'not set',
        usingFallback: !((window as any).VITE_GOOGLE_CLIENT_ID || (window as any).googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID),
        final: GOOGLE_CLIENT_ID.substring(0, 20) + '...'
      });
      
      if (!GOOGLE_CLIENT_ID) {
        console.warn('[Google OAuth] Client ID not found, will keep checking...');
        setGoogleClientIdConfigured(false);
        return;
      }

      console.log('[Google OAuth] Initializing with Client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');
      setGoogleClientIdConfigured(true);
      isInitialized = true;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        });

        // Clear existing buttons
        if (googleSignInButtonRef.current) {
          googleSignInButtonRef.current.innerHTML = '';
        }
        if (googleSignUpButtonRef.current) {
          googleSignUpButtonRef.current.innerHTML = '';
        }

        // Render appropriate button based on mode
        if (!isSignup && googleSignInButtonRef.current) {
          window.google.accounts.id.renderButton(googleSignInButtonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: '100%',
          });
          console.log('[Google OAuth] Sign-In button rendered');
        } else if (isSignup && googleSignUpButtonRef.current) {
          window.google.accounts.id.renderButton(googleSignUpButtonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signup_with',
            width: '100%',
          });
          console.log('[Google OAuth] Sign-Up button rendered');
        }
      } catch (error) {
        console.error('[Google OAuth] Error initializing:', error);
        setGoogleClientIdConfigured(false);
        isInitialized = false;
      }
    };

    // Listen for Android client ID injection event
    const handleClientIdReady = (event: any) => {
      console.log('[Google OAuth] Client ID ready event received:', event.detail);
      isInitialized = false; // Reset to allow re-initialization
      setTimeout(() => {
        initializeGoogleSignIn();
      }, 300);
    };
    
    window.addEventListener('googleClientIdReady', handleClientIdReady as EventListener);

    // Polling mechanism to check for client ID periodically (for Android)
    let pollInterval: NodeJS.Timeout | null = null;
    let checkCount = 0;
    const maxChecks = 50; // Check for 5 seconds (50 * 100ms)
    
    const pollForClientId = () => {
      checkCount++;
      
      // Check if client ID is now available
      const hasClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
                          (window as any).VITE_GOOGLE_CLIENT_ID || 
                          (window as any).googleClientId;
      
      if (hasClientId && window.google?.accounts?.id && !isInitialized) {
        console.log('[Google OAuth] Client ID found via polling, initializing...');
        initializeGoogleSignIn();
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      } else if (checkCount >= maxChecks) {
        console.warn('[Google OAuth] Polling timeout, stopping checks');
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }
    };

    // Start polling if client ID is not immediately available
    const clientIdAvailable = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
                               (window as any).VITE_GOOGLE_CLIENT_ID || 
                               (window as any).googleClientId;
    
    if (!clientIdAvailable) {
      console.log('[Google OAuth] Client ID not immediately available, starting polling...');
      pollInterval = setInterval(pollForClientId, 100);
    }

    // Wait for Google script to load
    if (window.google?.accounts?.id) {
      // If Google is already loaded, try to initialize
      setTimeout(() => {
        initializeGoogleSignIn();
      }, 200);
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogle);
          // Give it a moment, then initialize
          setTimeout(() => {
            initializeGoogleSignIn();
          }, 300);
        }
      }, 100);

      return () => {
        clearInterval(checkGoogle);
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        window.removeEventListener('googleClientIdReady', handleClientIdReady as EventListener);
      };
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      window.removeEventListener('googleClientIdReady', handleClientIdReady as EventListener);
    };
  }, [isSignup, handleGoogleSignIn, isNativeGoogleAvailable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!loginName.trim()) {
      setError("Please enter a username");
      return;
    }
    if (isSignup && !email.trim()) {
      setError("Please enter an email");
      return;
    }
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    setIsLoading(true);

    try {
      let response;
      if (isSignup) {
        response = await db.signup(loginName, email, password, referralCode.trim() || undefined);
        
        // If signup fails because email exists, automatically try to login
        if (!response.success && response.message && (
          response.message.includes("email already exists") || 
          response.message.includes("Email already exists")
        )) {
          // Automatically attempt login with the provided email and password
          response = await db.login(loginName, password, email);
          
          // If login succeeds, show a friendly message
          if (response.success) {
            setSuccessMsg("Welcome back! You've been logged in automatically.");
          }
        }
      } else {
        // For login, try email if loginName looks like an email
        const isEmailFormat = loginName.includes('@');
        response = await db.login(loginName, password, isEmailFormat ? loginName : undefined);
      }

      if (response.success) {
        setSuccessMsg(response.message || "Success!");
        // Brief delay to show success message before transitioning
        setTimeout(() => {
          onLogin();
        }, 1000);
      } else {
        setError(response.message || "Authentication failed");
        setIsLoading(false);
      }
    } catch (e) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-main-content flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-100 via-white to-blue-100 relative overflow-hidden transition-colors duration-500">
      {/* Creative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-pink-200/40 blur-[80px] rounded-full animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-blue-200/40 blur-[80px] rounded-full animate-pulse delay-700"></div>
         
         <i className="fas fa-paw absolute top-20 left-10 text-6xl text-brand/10 -rotate-12 animate-bounce-short"></i>
         <i className="fas fa-paw absolute bottom-32 right-12 text-7xl text-blue-400/10 rotate-12"></i>
         <i className="fas fa-bone absolute top-1/2 right-8 text-5xl text-yellow-400/20 rotate-45"></i>
         <i className="fas fa-cloud absolute top-16 right-1/4 text-8xl text-white/60"></i>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm z-10 text-center border-4 border-white/50 relative overflow-y-auto overflow-x-hidden max-h-[90vh] hide-scrollbar">
        <div className="mx-auto mb-4 flex justify-center relative">
          <div className="absolute inset-0 bg-brand-light/30 blur-2xl rounded-full scale-150"></div>
          <GameLogo className="w-24 h-24 relative z-10 drop-shadow-lg" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">FindMyPuppy</h1>
        <p className="text-slate-500 mb-6 font-medium text-sm">Join the ultimate hide & seek adventure!</p>

        {/* Auth Tabs */}
        <div className="flex p-1 bg-slate-100/80 rounded-xl mb-6 relative">
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${isSignup ? 'left-[calc(50%+2px)]' : 'left-1'}`}
          ></div>
          <button 
            type="button"
            onClick={() => { setIsSignup(false); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold relative z-10 transition-colors ${!isSignup ? 'text-brand-dark' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => { setIsSignup(true); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold relative z-10 transition-colors ${isSignup ? 'text-brand-dark' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-3">
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Username"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-base font-bold text-slate-700 bg-white/50"
                maxLength={12}
                disabled={isLoading}
              />
            </div>
            
            {isSignup && (
              <div className="relative animate-fade-in">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="email" 
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-base font-bold text-slate-700 bg-white/50"
                  disabled={isLoading}
                />
              </div>
            )}

              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-base font-bold text-slate-700 bg-white/50"
                  disabled={isLoading}
                />
              </div>

              {isSignup && (
                <div className="relative animate-fade-in">
                  <i className="fas fa-ticket-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="text" 
                    placeholder="Referral Code (Optional)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-base font-bold text-slate-700 bg-white/50"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

          {error && (
            <div className="text-red-500 text-xs font-bold bg-red-50 py-2 px-3 rounded-lg border border-red-100 flex items-center gap-2 animate-pulse">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {successMsg && (
            <div className="text-green-600 text-xs font-bold bg-green-50 py-2 px-3 rounded-lg border border-green-100 flex items-center gap-2">
              <i className="fas fa-check-circle"></i> {successMsg}
            </div>
          )}

          <Button 
            type="submit"
            disabled={!loginName.trim() || !password.trim() || isLoading} 
            className="w-full bg-gradient-to-r from-brand to-brand-dark text-white shadow-brand/30 hover:shadow-brand/50 hover:scale-[1.02] mt-2 h-12 flex items-center justify-center"
          >
            {isLoading ? (
              <i className="fas fa-circle-notch animate-spin"></i>
            ) : (
              <>
                {isSignup ? 'Create Account' : 'Start Playing'}
                <i className="fas fa-arrow-right ml-2 text-sm opacity-80"></i>
              </>
            )}
          </Button>
        </form>

        {/* Forgot Password Link - Only show on Login tab */}
        {!isSignup && onForgotPassword && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-brand-dark hover:text-brand font-bold transition-colors"
            >
              <i className="fas fa-key mr-1"></i>
              Forgot Password?
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-slate-300"></div>
          <span className="px-4 text-xs text-slate-500 font-medium">OR</span>
          <div className="flex-1 border-t border-slate-300"></div>
        </div>

        {/* Native Google Sign-In for Android (Capacitor) */}
        {isNativeGoogleAvailable && (
          <button
            type="button"
            onClick={handleNativeGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {/* Standard full-color Google "G" icon */}
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.34 1.53 8.17 2.81l5.96-5.96C34.44 3.42 29.7 1.5 24 1.5 14.64 1.5 6.53 6.88 2.56 14.72l6.94 5.38C11.27 13.74 17.15 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.63-.14-3.2-.41-4.72H24v9.02h12.66c-.55 2.95-2.22 5.45-4.75 7.14l7.27 5.64C43.4 37.67 46.5 31.6 46.5 24.5z"/>
              <path fill="#FBBC05" d="M9.5 28.1c-.5-1.5-.78-3.1-.78-4.6s.28-3.1.78-4.6l-6.94-5.38C1.59 16.52 1 20.2 1 23.5c0 3.3.59 6.98 1.56 9.98l6.94-5.38z"/>
              <path fill="#34A853" d="M24 46.5c5.7 0 10.44-1.88 13.91-5.12l-7.27-5.64c-2.02 1.36-4.61 2.16-6.64 2.16-6.85 0-12.73-4.24-14.5-10.6l-6.94 5.38C6.53 41.12 14.64 46.5 24 46.5z"/>
            </svg>
            <span className="font-extrabold text-slate-700 text-sm">
              {isLoading ? 'Opening Google…' : (isSignup ? 'Sign up with Google' : 'Sign in with Google')}
            </span>
          </button>
        )}

        {/* Web Google Sign In/Up Buttons (GIS) - Only for non-native platforms */}
        {!isNativeGoogleAvailable && (
          <div className="w-full">
            {googleClientIdConfigured ? (
              <>
                <div 
                  ref={googleSignInButtonRef} 
                  className={`w-full flex justify-center min-h-[50px] ${isSignup ? 'hidden' : ''}`}
                ></div>
                <div 
                  ref={googleSignUpButtonRef} 
                  className={`w-full flex justify-center min-h-[50px] ${!isSignup ? 'hidden' : ''}`}
                ></div>
              </>
            ) : (
              <div className="w-full p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs text-slate-500 text-center animate-pulse">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <i className="fab fa-google text-slate-400"></i>
                  <span className="font-bold">Configuring Google Sign-In...</span>
                </div>
                <p className="opacity-70">This usually takes a moment. Please wait.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 text-brand font-bold underline px-2 py-1"
                >
                  Refresh App
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="absolute bottom-4 w-full text-center pointer-events-none z-10">
          <span className="text-[10px] text-slate-400/80 font-medium">© 2025-2026 MVTechnology</span>
      </div>
    </div>
  );
};
