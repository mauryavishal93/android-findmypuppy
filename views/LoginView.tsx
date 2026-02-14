
import React, { useState, useEffect, useRef } from 'react';
import { GameLogo } from '../components/GameLogo';
import { Button } from '../components/ui/Button';
import { db } from '../services/db';
import {
  getIsAndroidNativeGoogleAvailable,
  isPluginNotImplementedError,
  signInWithGoogleNative,
} from '../services/nativeGoogleAuth';

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
  onLogin: (userData?: { username: string; email?: string; hints?: number; points?: number; levelPassedEasy?: number; levelPassedMedium?: number; levelPassedHard?: number; puppyRunHighScore?: number }) => void;
  onForgotPassword?: () => void;
  onPlayAsGuest?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ loginName, setLoginName, onLogin, onForgotPassword, onPlayAsGuest }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [googleClientIdConfigured, setGoogleClientIdConfigured] = useState(false);
  const [googleScriptLoading, setGoogleScriptLoading] = useState(true);
  const [androidUseWebFallback, setAndroidUseWebFallback] = useState(false); // if native plugin fails, show Web button on Android
  const googleSignInButtonRef = useRef<HTMLDivElement>(null);
  const googleSignUpButtonRef = useRef<HTMLDivElement>(null);

  // Auto-detect referral code from URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      setIsSignup(true); // Automatically switch to signup if a referral code is present
    }
  }, []);

  // Android native Google Sign-In (Capacitor)
  const handleAndroidGoogleSignIn = React.useCallback(async () => {
    console.log('[LoginView] handleAndroidGoogleSignIn called');
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      console.log('[LoginView] Calling signInWithGoogleNative...');
      const user = await signInWithGoogleNative();
      console.log('[LoginView] Google sign-in native result:', user);
      const { idToken } = user;
      const result = await db.signInWithGoogle(idToken, referralCode.trim() || undefined);
      if (result.success && result.user?.username) {
        const loggedInUser = result.user;
        setSuccessMsg(result.message || 'Success!');
        setLoginName(loggedInUser.username);
        onLogin({
          username: loggedInUser.username,
          email: loggedInUser.email,
          hints: loggedInUser.hints,
          points: loggedInUser.points,
          levelPassedEasy: loggedInUser.levelPassedEasy,
          levelPassedMedium: loggedInUser.levelPassedMedium,
          levelPassedHard: loggedInUser.levelPassedHard,
          puppyRunHighScore: loggedInUser.puppyRunHighScore,
        });
      } else {
        setError(result.message || 'Authentication failed');
      }
    } catch (e: unknown) {
      console.error('[LoginView] Google sign-in error:', JSON.stringify(e));
      if (e && typeof e === 'object' && 'code' in e) {
        console.error('[LoginView] native status code:', (e as { code: unknown }).code);
      }
      const message = e instanceof Error ? e.message : 'Google sign-in failed. Please try again.';
      setError(message);
      if (isPluginNotImplementedError(e)) setAndroidUseWebFallback(true); // show Web Google button instead
    } finally {
      setIsLoading(false);
    }
  }, [referralCode, onLogin, setLoginName]);

  // Handle Google OAuth callback (Web)
  const handleGoogleSignIn = React.useCallback(async (response: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
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
        } else if (typeof errorObj === 'object') {
          errorMessage = errorObj.toString?.() || JSON.stringify(errorObj);
        }
        
        console.error("Google OAuth Error:", errorObj);
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Validate response structure
      if (!response || !response.credential) {
        const errorMsg = "Invalid Google response. Please try again.";
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      const result = await db.signInWithGoogle(response.credential, referralCode.trim() || undefined);
      
      if (result.success && result.user?.username) {
        const user = result.user;
        setSuccessMsg(result.message || "Success!");
        setLoginName(user.username);
        // Pass user data (points, hints, levels) for immediate load
        setTimeout(() => {
          onLogin({
            username: user.username,
            email: user.email,
            hints: user.hints,
            points: user.points,
            levelPassedEasy: user.levelPassedEasy,
            levelPassedMedium: user.levelPassedMedium,
            levelPassedHard: user.levelPassedHard,
            puppyRunHighScore: user.puppyRunHighScore
          });
        }, 500);
      } else {
        // Extract error message properly
        const errorMsg = result.message || "Google sign in failed";
        setError(typeof errorMsg === 'string' ? errorMsg : "Google sign-in failed. Please try again.");
        setIsLoading(false);
      }
    } catch (e: any) {
      // Properly extract error message from error object
      let errorMessage = "An unexpected error occurred";
      if (e) {
        if (typeof e === 'string') {
          errorMessage = e;
        } else if (e.message) {
          errorMessage = e.message;
        } else if (e.error) {
          errorMessage = typeof e.error === 'string' ? e.error : (e.error.message || "Google sign-in error");
        } else if (typeof e === 'object') {
          // Try to extract meaningful error message
          errorMessage = e.toString?.() || JSON.stringify(e);
        }
      }
      console.error("Google Sign In Error:", e);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [referralCode, onLogin, setLoginName]);

  // Initialize Google OAuth — wait for GSI script, with programmatic load fallback for Render/production
  useEffect(() => {
    const GOOGLE_CLIENT_ID =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '896459680164-aa61o2u96qrscu10ia9g0l40agca0q6i.apps.googleusercontent.com';

    const initializeGoogleSignIn = () => {
      if (!window.google?.accounts?.id) return;
      if (!GOOGLE_CLIENT_ID) {
        setGoogleClientIdConfigured(false);
        setGoogleScriptLoading(false);
        return;
      }

      setGoogleClientIdConfigured(true);
      setGoogleScriptLoading(false);

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
      });

      // Clear and render the appropriate button based on current isSignup state
      if (googleSignInButtonRef.current) googleSignInButtonRef.current.innerHTML = '';
      if (googleSignUpButtonRef.current) googleSignUpButtonRef.current.innerHTML = '';

      if (!isSignup && googleSignInButtonRef.current) {
        window.google.accounts.id.renderButton(googleSignInButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: '100%',
        });
      } else if (isSignup && googleSignUpButtonRef.current) {
        window.google.accounts.id.renderButton(googleSignUpButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signup_with',
          width: '100%',
        });
      }
    };

    // Check if script is already loaded (optimistic check - most common case)
    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
      return () => {}; // Return empty cleanup
    }

    // If script not ready, poll for it

    // Poll for script (from index.html async load) - check frequently for fast response
    let attempts = 0;
    const maxAttempts = 50; // ~5s max wait
    const checkGoogle = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogle);
        initializeGoogleSignIn();
        return;
      }
      if (attempts >= maxAttempts) {
        clearInterval(checkGoogle);
        // Fallback: inject script programmatically (helps when index.html script is blocked or delayed on Render)
        if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            const retry = setInterval(() => {
              if (window.google?.accounts?.id) {
                clearInterval(retry);
                initializeGoogleSignIn();
              }
            }, 50); // Check more frequently
            setTimeout(() => {
              clearInterval(retry);
              if (!window.google?.accounts?.id) {
                setGoogleScriptLoading(false);
                setGoogleClientIdConfigured(false);
              }
            }, 3000);
          };
          script.onerror = () => {
            setGoogleScriptLoading(false);
            setGoogleClientIdConfigured(false);
          };
          document.head.appendChild(script);
        } else {
          // Script tag exists but not loaded yet - wait a bit more
          const finalCheck = setTimeout(() => {
            if (window.google?.accounts?.id) {
              initializeGoogleSignIn();
            } else {
              setGoogleScriptLoading(false);
              setGoogleClientIdConfigured(false);
            }
          }, 2000);
          return () => clearTimeout(finalCheck);
        }
      }
    }, 50); // Check every 50ms for faster response

    return () => clearInterval(checkGoogle);
  }, [isSignup, handleGoogleSignIn]);

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
      } else {
        response = await db.login(loginName, password);
      }

      if (response.success) {
        setSuccessMsg(response.message || "Success!");
        const user = response.user;
        setTimeout(() => {
          if (user) {
            onLogin({
              username: user.username,
              email: user.email,
              hints: user.hints,
              points: user.points,
              levelPassedEasy: user.levelPassedEasy,
              levelPassedMedium: user.levelPassedMedium,
              levelPassedHard: user.levelPassedHard,
              puppyRunHighScore: user.puppyRunHighScore
            });
          } else {
            onLogin();
          }
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
    <div className="mobile-main-content flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden transition-colors duration-500">
      {/* Soft Background Globs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-purple-200/30 blur-[100px] rounded-full mix-blend-multiply animate-pulse"></div>
         <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[50%] bg-pink-200/30 blur-[100px] rounded-full mix-blend-multiply animate-pulse delay-1000"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl w-full max-w-sm z-10 text-center border border-white/60 relative overflow-hidden transition-all duration-300 max-h-[90vh] flex flex-col">
        {/* Play as Guest / Back - when coming from HOME */}
        {onPlayAsGuest && (
          <button
            type="button"
            onClick={onPlayAsGuest}
            className="absolute top-4 left-4 flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs transition-colors z-20 group"
          >
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <i className="fas fa-arrow-left"></i>
            </div>
            <span>Guest</span>
          </button>
        )}
        
        <div className="mx-auto mb-4 flex flex-col items-center shrink-0">
          <div className="relative mb-2 transform hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full scale-110"></div>
            <GameLogo className="w-16 h-16 relative z-10 drop-shadow-md" />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">FindMyPuppy</h1>
          <p className="text-slate-500 font-semibold text-[10px] mt-0.5">The cutest hide & seek game!</p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar -mx-2 px-2">
          {/* Auth Tabs */}
          <div className="flex p-1 bg-slate-100/80 rounded-xl mb-4 relative shrink-0">
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${isSignup ? 'left-[calc(50%+2px)]' : 'left-1'}`}
            ></div>
            <button 
              type="button"
              onClick={() => { setIsSignup(false); setError(null); }}
              className={`flex-1 py-2 text-xs font-extrabold relative z-10 transition-colors ${!isSignup ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => { setIsSignup(true); setError(null); }}
              className={`flex-1 py-2 text-xs font-extrabold relative z-10 transition-colors ${isSignup ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 flex justify-center text-slate-400 group-focus-within:text-brand transition-colors">
                  <i className="fas fa-user text-xs"></i>
                </div>
                <input 
                  type="text" 
                  placeholder="Username"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand/30 focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-semibold"
                  maxLength={12}
                  disabled={isLoading}
                />
              </div>
              
              {isSignup && (
                <div className="relative group animate-fade-in">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 flex justify-center text-slate-400 group-focus-within:text-brand transition-colors">
                    <i className="fas fa-envelope text-xs"></i>
                  </div>
                  <input 
                    type="email" 
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand/30 focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-semibold"
                    disabled={isLoading}
                  />
                </div>
              )}

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 flex justify-center text-slate-400 group-focus-within:text-brand transition-colors">
                    <i className="fas fa-lock text-xs"></i>
                  </div>
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand/30 focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-semibold"
                    disabled={isLoading}
                  />
                </div>

                {isSignup && (
                  <div className="relative group animate-fade-in">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 flex justify-center text-slate-400 group-focus-within:text-brand transition-colors">
                      <i className="fas fa-ticket-alt text-xs"></i>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Referral Code (Optional)"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand/30 focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-semibold"
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>

            {error && (
              <div className="text-red-500 text-[10px] font-bold bg-red-50 py-2 px-3 rounded-lg border border-red-100 flex items-start gap-2 animate-shake">
                <i className="fas fa-exclamation-circle mt-0.5 shrink-0"></i>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="text-green-600 text-[10px] font-bold bg-green-50 py-2 px-3 rounded-lg border border-green-100 flex items-start gap-2 animate-pulse-fast">
                <i className="fas fa-check-circle mt-0.5 shrink-0"></i>
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            <Button 
              type="submit"
              disabled={!loginName.trim() || !password.trim() || isLoading} 
              className="w-full bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] mt-1 h-10 rounded-xl flex items-center justify-center font-black tracking-wide transition-all text-sm"
            >
              {isLoading ? (
                <i className="fas fa-circle-notch animate-spin text-sm"></i>
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Start Playing'}
                  <i className="fas fa-arrow-right ml-2 opacity-60 text-xs"></i>
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
                className="text-[10px] text-slate-400 hover:text-brand-dark font-bold transition-colors py-1 px-2"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center my-4 gap-3">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Or continue with</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Google Sign In/Up - Native on Android (or Web GIS if native unavailable / fallback) */}
          <div className="w-full min-h-[40px] flex items-center justify-center pb-2">
            {(() => {
              const isNativeAvailable = getIsAndroidNativeGoogleAvailable();
              console.log('[LoginView] Native Google Auth available:', isNativeAvailable, 'androidUseWebFallback:', androidUseWebFallback);
              return isNativeAvailable && !androidUseWebFallback;
            })() ? (
              <Button
                type="button"
                onClick={() => {
                  console.log('[LoginView] Google Sign-In button clicked');
                  handleAndroidGoogleSignIn();
                }}
                disabled={isLoading}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 h-10 flex items-center justify-center gap-2 rounded-xl"
              >
                {isLoading ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  <>
                    <i className="fab fa-google text-lg"></i>
                    {isSignup ? 'Sign up with Google' : 'Sign in with Google'}
                  </>
                )}
              </Button>
            ) : googleScriptLoading ? (
              <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
                <i className="fab fa-google mr-2"></i>
                Loading Google Sign-In…
              </div>
            ) : googleClientIdConfigured ? (
              <div className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99]">
                <div 
                  ref={googleSignInButtonRef} 
                  className={`w-full flex justify-center ${isSignup ? 'hidden' : ''}`}
                ></div>
                <div 
                  ref={googleSignUpButtonRef} 
                  className={`w-full flex justify-center ${!isSignup ? 'hidden' : ''}`}
                ></div>
              </div>
            ) : (
              <div className="w-full p-2.5 bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-400 text-center">
                Google Sign-In unavailable
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 w-full text-center pointer-events-none z-10">
          <span className="text-[10px] text-slate-400 font-bold opacity-60">© 2026 MVTechnology</span>
      </div>
    </div>
  );
};
