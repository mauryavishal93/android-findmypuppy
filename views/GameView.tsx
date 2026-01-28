import React from 'react';
import { Difficulty, Puppy, UserProgress } from '../types';
import { GameCanvas } from '../components/GameCanvas';

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
  onPuppyFound: (id: string) => void;
  onImageLoaded: () => void;
  onUseHint: () => void;
  onToggleMute: () => void;
  onBack: () => void;
  onWrongClick: () => void;
  wrongAttempts: number;
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
  onPuppyFound,
  onImageLoaded,
  onUseHint,
  onToggleMute,
  onBack,
  onWrongClick,
  wrongAttempts
}) => {
  // Timer Color Logic
  let timerColorClass = 'bg-slate-800 text-white';
  if (timeLeft !== null && timeLeft <= 10) timerColorClass = 'bg-red-500 text-white animate-pulse';
  else if (timeLeft !== null && timeLeft <= 30) timerColorClass = 'bg-orange-500 text-white';
  
  return (
    <div className="mobile-game-container flex flex-col h-full bg-slate-900 absolute inset-0 z-0">
      <div className="mobile-header bg-slate-900/90 backdrop-blur text-white flex justify-between z-10 shadow-lg border-b border-slate-800 shrink-0">
        <button onClick={onBack} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition">
           <i className="fas fa-times text-lg sm:text-xl"></i>
        </button>
        
        <div className="flex items-center gap-4">
           {timeLeft !== null && (
               <div className={`px-3 py-1 rounded-full font-mono font-bold text-sm sm:text-base shadow-sm border border-white/20 flex items-center gap-2 ${timerColorClass}`}>
                  <i className="fas fa-clock text-xs"></i>
                  {formatTime(timeLeft)}
               </div>
           )}
           <div className="bg-slate-800/80 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-brand-light border border-slate-700 flex flex-col items-center shadow-lg min-w-[80px] sm:min-w-[100px]">
              <span className="uppercase text-[9px] sm:text-[10px] tracking-widest">{selectedDifficulty} MODE</span>
              <span className="text-[10px] sm:text-xs text-slate-400 opacity-80">Level {currentLevelId}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleMute}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
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
        
        {/* HUD Elements */}
        {/* Puppies Count - Right Top */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-mono text-brand-light border border-slate-700 flex items-center gap-2 shadow-lg">
            <i className="fas fa-paw text-[10px] sm:text-xs"></i>
            <span className="font-bold">{gameState.puppies.filter(p => p.isFound).length} / {gameState.puppies.length}</span>
          </div>
        </div>
        
        {/* Wrong Attempts Indicator - Left Top (aligned with puppies count) */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 pointer-events-none">
          <div className="bg-red-900/80 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-white border border-red-700 flex items-center gap-2 shadow-lg">
            {/* Creative Puppy Icons showing remaining attempts */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((attempt) => (
                <i 
                  key={attempt}
                  className={`fas fa-dog text-[10px] sm:text-xs transition-all duration-300 ${
                    attempt > (3 - wrongAttempts) 
                      ? 'text-red-300/30 scale-75 opacity-50' 
                      : wrongAttempts >= 2 
                        ? 'text-red-300 animate-pulse' 
                        : wrongAttempts === 1 
                          ? 'text-yellow-300' 
                          : 'text-white'
                  }`}
                ></i>
              ))}
            </div>
            <span className="flex items-center gap-1">
              <span className="text-[10px] sm:text-xs opacity-80 uppercase tracking-tighter">Lifes</span>
              <span className={`${wrongAttempts >= 2 ? 'text-red-300 animate-pulse' : wrongAttempts === 1 ? 'text-yellow-300' : 'text-white'}`}>
                {3 - wrongAttempts}
              </span>
            </span>
          </div>
        </div>
        
        {/* Hint Button */}
        <div className="absolute bottom-20 sm:bottom-24 right-6 z-[60] pb-[env(safe-area-inset-bottom)] transition-all duration-300">
           <button 
             onClick={onUseHint}
             disabled={gameState.loading || showHints}
             className={`
               w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl border-2 flex items-center justify-center transition-all duration-300 active:scale-95
               ${showHints ? 'bg-yellow-400 border-yellow-200 scale-110' : 'bg-slate-800/90 border-slate-600 hover:bg-slate-700'}
             `}
           >
             <i className={`fas fa-lightbulb text-xl sm:text-2xl ${showHints ? 'text-white animate-pulse' : 'text-yellow-400'}`}></i>
             
             {/* Badge for remaining hints - shows current available hint count */}
             <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[1.25rem] h-5 px-1 rounded-full flex items-center justify-center border border-white">
                {hasHints ? currentHintCount : '+'}
             </div>
           </button>
        </div>
      </div>
    </div>
  );
};

