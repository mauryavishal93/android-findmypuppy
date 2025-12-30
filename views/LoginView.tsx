
import React, { useState } from 'react';
import { GameLogo } from '../components/GameLogo';
import { Button } from '../components/ui/Button';
import { db } from '../services/db';

interface LoginViewProps {
  loginName: string;
  setLoginName: (name: string) => void;
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ loginName, setLoginName, onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
        response = await db.signup(loginName, email, password);
      } else {
        response = await db.login(loginName, password);
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
    <div className="flex flex-col h-full items-center justify-center p-6 bg-gradient-to-br from-pink-100 via-white to-blue-100 relative overflow-hidden">
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
      </div>
      
      <div className="absolute bottom-4 w-full text-center pointer-events-none z-10">
          <span className="text-[10px] text-slate-400/80 font-medium">© 2025-2026 MVTechnology</span>
      </div>
    </div>
  );
};
