import React, { useState } from 'react';
import { Difficulty, Puppy, UserProgress, ThemeType } from '../types';
import { GameCanvas } from '../components/GameCanvas';
import { THEME_CONFIGS } from '../constants/themeConfig';

interface GameViewProps {
  gameState: {
    puppies: Puppy[];
    bgImage: string | null;
    loading: boolean;
  };
  selectedDifficulty: Difficulty;
  currentLevelId: number;
  timeLeft: number | null;
  formatTime: (seconds: number) => string;
  showHints: boolean;
  freeHintsRemaining: number;
  totalHintsRemaining: number;
  currentHintType: 'free' | 'total' | 'none';
  currentHintCount: number;
  hasHints: boolean;
  hasPremiumHints: boolean;
  isMuted: boolean;
  backgroundMusicEnabled: boolean;
  soundEffectsEnabled: boolean;
  onPuppyFound: (id: string) => void;
  onImageLoaded: () => void;
  onUseHint: () => void;
  onToggleMute: () => void;
  onToggleBackgroundMusic: () => void;
  onToggleSoundEffects: () => void;
  onBack: () => void;
  onWrongClick: () => void;
  wrongAttempts: number;
  wrongTapLimit: number;
  currentTheme: ThemeType;
}

export const GameView: React.FC<GameViewProps> = ({
  gameState,
  selectedDifficulty,
  currentLevelId,
  timeLeft,
  formatTime,
  showHints,
  freeHintsRemaining,
  totalHintsRemaining,
  currentHintType,
  currentHintCount,
  hasHints,
  hasPremiumHints,
  isMuted,
  backgroundMusicEnabled,
  soundEffectsEnabled,
  onPuppyFound,
  onImageLoaded,
  onUseHint,
  onToggleMute,
  onToggleBackgroundMusic,
  onToggleSoundEffects,
  onBack,
  onWrongClick,
  wrongAttempts,
  wrongTapLimit = 3,
  currentTheme
}) => {
  const [isMusicDropdownOpen, setIsMusicDropdownOpen] = useState(false);
  const activeTheme = THEME_CONFIGS[currentTheme] || THEME_CONFIGS.night;
  // Timer Color Logic
  let timerColorClass = 'bg-slate-800 text-white';
  if (timeLeft !== null && timeLeft <= 10) timerColorClass = 'bg-red-500 text-white animate-pulse';
  else if (timeLeft !== null && timeLeft <= 30) timerColorClass = 'bg-orange-500 text-white';
  
  return (
    <div className="mobile-game-container flex flex-col h-full bg-slate-900 absolute inset-0 z-0 overflow-hidden">
      {/* Top HUD Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-start pointer-events-none">
        
        {/* Left: Back & Level Info */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition active:scale-95 border border-white/10 shadow-lg"
          >
             <i className="fas fa-arrow-left text-sm"></i>
          </button>
          
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 flex items-center gap-2 shadow-lg animate-fade-in-down">
            <div className={`w-2 h-2 rounded-full ${selectedDifficulty === Difficulty.EASY ? 'bg-green-400' : selectedDifficulty === Difficulty.MEDIUM ? 'bg-blue-400' : 'bg-rose-400'}`}></div>
            <div>
              <span className="block text-[10px] text-white/60 uppercase tracking-wider leading-none font-bold">Level</span>
              <span className="block text-sm font-black text-white leading-none">{currentLevelId}</span>
            </div>
          </div>
        </div>
        
        {/* Center: Timer (Floating) */}
        {timeLeft !== null && (
           <div className={`absolute left-1/2 -translate-x-1/2 top-[max(1rem,env(safe-area-inset-top))] pointer-events-none transition-all duration-300 ${timeLeft <= 10 ? 'scale-110' : ''}`}>
              <div className={`px-4 py-1.5 rounded-full font-mono font-black text-lg shadow-xl border-2 flex items-center gap-2 backdrop-blur-md ${
                timeLeft <= 10 
                  ? 'bg-red-500/90 border-red-400 text-white animate-pulse' 
                  : timeLeft <= 30
                    ? 'bg-orange-500/90 border-orange-400 text-white'
                    : 'bg-slate-900/60 border-white/20 text-white'
              }`}>
                 <i className={`fas fa-clock text-xs ${timeLeft <= 10 ? 'animate-spin' : ''}`}></i>
                 <span>{formatTime(timeLeft)}</span>
              </div>
           </div>
        )}
        
        {/* Right: Controls & Stats */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Settings Toggle */}
          <div className="relative">
            <button 
              onClick={() => setIsMusicDropdownOpen(!isMusicDropdownOpen)} 
              className={`w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition border border-white/10 shadow-lg ${isMusicDropdownOpen ? 'bg-white/30' : ''}`}
            >
              <i className={`fas ${isMuted ? 'fa-volume-mute text-red-300' : 'fa-volume-up'}`}></i>
            </button>
            
            {/* Minimalist Dropdown */}
            {isMusicDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMusicDropdownOpen(false)}></div>
                <div 
                  className="absolute right-0 top-12 mt-2 w-48 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl z-20 overflow-hidden text-white animate-fade-in-up origin-top-right"
                >
                  <button
                    onClick={onToggleBackgroundMusic}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition border-b border-white/5"
                  >
                    <span className="text-xs font-bold flex items-center gap-2"><i className="fas fa-music w-4"></i> Music</span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${backgroundMusicEnabled ? 'bg-brand' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${backgroundMusicEnabled ? 'translate-x-4' : ''}`}></div>
                    </div>
                  </button>
                  <button
                    onClick={onToggleSoundEffects}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition"
                  >
                    <span className="text-xs font-bold flex items-center gap-2"><i className="fas fa-volume-up w-4"></i> SFX</span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${soundEffectsEnabled ? 'bg-brand' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${soundEffectsEnabled ? 'translate-x-4' : ''}`}></div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Progress Pill */}
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 flex items-center gap-2 shadow-lg animate-fade-in-down delay-75">
            <i className="fas fa-paw text-brand-light text-xs"></i>
            <span className="text-sm font-bold text-white">{gameState.puppies.filter(p => p.isFound).length}<span className="text-white/50 text-xs mx-0.5">/</span>{gameState.puppies.length}</span>
          </div>

          {/* Lives Pill */}
          <div className={`bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 flex items-center gap-2 shadow-lg animate-fade-in-down delay-100 ${wrongAttempts >= wrongTapLimit - 1 ? 'border-red-500/50 bg-red-900/20' : ''}`}>
             <div className="flex gap-0.5">
               {Array.from({ length: wrongTapLimit }).map((_, i) => (
                 <i 
                   key={i} 
                   className={`fas fa-heart text-[10px] transition-all duration-300 ${
                     i < (wrongTapLimit - wrongAttempts) 
                       ? 'text-red-400 drop-shadow-sm scale-100' 
                       : 'text-slate-600 scale-75 opacity-50'
                   }`}
                 ></i>
               ))}
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden w-full h-full">
        <GameCanvas 
          backgroundImage={gameState.bgImage}
          puppies={gameState.puppies}
          onPuppyFound={onPuppyFound}
          isLoading={gameState.loading}
          difficulty={selectedDifficulty}
          showHints={showHints}
          onImageLoaded={onImageLoaded}
          onWrongClick={onWrongClick}
        />
        
        {/* Bottom Controls */}
        <div className="absolute bottom-6 right-6 z-30 pb-[env(safe-area-inset-bottom)]">
           <button 
             onClick={onUseHint}
             disabled={gameState.loading || showHints}
             className={`
               group relative w-16 h-16 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] border-4 flex items-center justify-center transition-all duration-300 active:scale-90
               ${showHints 
                 ? 'bg-yellow-400 border-yellow-200 scale-105 rotate-12 shadow-yellow-400/50' 
                 : 'bg-white border-white/50 hover:bg-slate-50'
               }
             `}
           >
             <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-black/10"></div>
             <i className={`fas fa-lightbulb text-2xl relative z-10 transition-colors ${showHints ? 'text-white animate-pulse' : 'text-yellow-500'}`}></i>
             
             {/* Badge */}
             <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-[1.25rem] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20">
                {hasHints ? currentHintCount : '+'}
             </div>
           </button>
        </div>
      </div>
    </div>
  );
};

