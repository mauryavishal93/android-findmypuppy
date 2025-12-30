
import React from 'react';
import { Difficulty, ThemeType } from '../types';
import { renderThemeBackground } from '../utils/themeBackground';

interface LevelSelectorProps {
  difficulty: Difficulty;
  clearedLevels: { [key: string]: boolean };
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentTheme: ThemeType;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({ 
  difficulty, 
  clearedLevels, 
  onSelectLevel,
  onBack,
  isMuted,
  onToggleMute,
  currentTheme
}) => {
  // Generate 100 levels
  const levels = Array.from({ length: 100 }, (_, i) => i + 1);

  // Theme-based style variables
  const bgClass = {
    sunny: 'bg-gradient-to-b from-sky-50 via-white to-indigo-50',
    night: 'bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950',
    candy: 'bg-gradient-to-b from-pink-50 via-purple-50 to-pink-100',
    forest: 'bg-gradient-to-b from-emerald-50 via-teal-50 to-green-100',
    park: 'bg-gradient-to-b from-lime-50 via-green-50 to-emerald-100',
    bath: 'bg-gradient-to-b from-cyan-50 via-blue-50 to-sky-100',
    toys: 'bg-gradient-to-b from-yellow-50 via-red-50 to-blue-50',
    streetDog: 'bg-yellow-200',
    puppyPlush: 'bg-[#FFF6E9]',
    dogParkDark: 'bg-gradient-to-br from-slate-900 via-emerald-900 to-black',
    puppyCandy: 'bg-gradient-to-br from-pink-300 via-yellow-200 to-sky-300',
    neonPup: 'bg-black',
    handDrawnPup: 'bg-[#FFFDF7]',
    cosmicPuppy: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black',
    safariPup: 'bg-gradient-to-b from-lime-200 via-amber-100 to-orange-100',
    puppyHologram: 'bg-gradient-to-br from-slate-900 to-black',
    cartoonChaos: 'bg-gradient-to-r from-red-300 via-yellow-300 to-blue-300'
  }[currentTheme] || 'bg-slate-50';

  const headerTextClass = {
    sunny: 'text-slate-800',
    night: 'text-indigo-100',
    candy: 'text-purple-900',
    forest: 'text-emerald-900',
    park: 'text-emerald-800',
    bath: 'text-blue-900',
    toys: 'text-slate-800',
    streetDog: 'text-black',
    puppyPlush: 'text-[#5A3E2B]',
    dogParkDark: 'text-emerald-300',
    puppyCandy: 'text-pink-900',
    neonPup: 'text-cyan-300',
    handDrawnPup: 'text-amber-900',
    cosmicPuppy: 'text-purple-200',
    safariPup: 'text-[#4A3A1A]',
    puppyHologram: 'text-white',
    cartoonChaos: 'text-purple-800'
  }[currentTheme] || 'text-slate-800';

  const headerBgClass = {
    sunny: 'bg-white/80 border-white/50',
    night: 'bg-slate-800/80 border-slate-700/50',
    candy: 'bg-white/80 border-pink-200/50',
    forest: 'bg-white/80 border-emerald-200/50',
    park: 'bg-white/80 border-lime-200/50',
    bath: 'bg-white/80 border-cyan-200/50',
    toys: 'bg-white/80 border-yellow-200/50',
    streetDog: 'bg-white border-b-4 border-black',
    puppyPlush: 'bg-[#FFDAB9]',
    dogParkDark: 'bg-black border-b border-emerald-600',
    puppyCandy: 'bg-pink-200 border-b-4 border-yellow-400',
    neonPup: 'bg-black border-b-2 border-cyan-400',
    handDrawnPup: 'bg-[#FFF1D6] border-b-2 border-dashed border-amber-700',
    cosmicPuppy: 'bg-indigo-950 border-b border-purple-500/40',
    safariPup: 'bg-[#EAD7B7] border-b border-[#A67C52]',
    puppyHologram: 'bg-black/40 border-b border-white/20',
    cartoonChaos: 'bg-yellow-300 border-b-4 border-purple-600'
  }[currentTheme] || 'bg-white/80';

  const btnBgClass = {
    sunny: 'bg-white/80 border-white text-brand hover:border-brand/20',
    night: 'bg-slate-700/80 border-slate-600 text-yellow-300 hover:border-yellow-300/20',
    candy: 'bg-white/80 border-pink-100 text-pink-500 hover:border-pink-300',
    forest: 'bg-white/80 border-emerald-100 text-emerald-600 hover:border-emerald-300',
    park: 'bg-white/80 border-lime-200 text-lime-600 hover:border-lime-400',
    bath: 'bg-white/80 border-cyan-200 text-cyan-600 hover:border-cyan-400',
    toys: 'bg-white/80 border-orange-200 text-orange-500 hover:border-orange-400',
    streetDog: 'bg-black text-yellow-300 hover:scale-110',
    puppyPlush: 'bg-[#FFB085] text-white',
    dogParkDark: 'bg-slate-700 text-emerald-400',
    puppyCandy: 'bg-yellow-300 text-pink-900',
    neonPup: 'bg-black text-cyan-400',
    handDrawnPup: 'bg-[#FFE8C2] text-amber-800',
    cosmicPuppy: 'bg-indigo-900 text-pink-400',
    safariPup: 'bg-[#C8AD7F] text-[#4A3A1A]',
    puppyHologram: 'bg-white/10 text-cyan-300',
    cartoonChaos: 'bg-red-500 text-white'
  }[currentTheme] || 'bg-white';

  return (
    <div className={`flex flex-col h-full ${bgClass} relative overflow-hidden transition-colors duration-500`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
         {renderThemeBackground(currentTheme)}
      </div>

      <div className={`p-4 border-b flex items-center justify-between backdrop-blur-md shadow-sm z-10 sticky top-0 ${headerBgClass}`}>
        <button onClick={onBack} className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition shadow-sm border ${btnBgClass}`}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className={`text-xl font-black tracking-tight ${headerTextClass}`}>{difficulty} Levels</h2>
        <button 
          onClick={onToggleMute}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border ${btnBgClass}`}
        >
          <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-transparent z-10 relative hide-scrollbar">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pb-20">
          {levels.map((level) => {
            const levelKey = `${difficulty}_${level}`;
            const isCleared = clearedLevels[levelKey];
            const previousKey = `${difficulty}_${level - 1}`;
            const isLocked = level > 1 && !clearedLevels[previousKey];

            // Card Colors based on theme
            let cardBaseClass = 'bg-white border-2 border-brand/50 text-brand';
            let cardClearedClass = 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-emerald-300 text-emerald-600';
            
            // Simplified fallback for advanced themes to keep switch mostly consistent with Home
            if (currentTheme === 'night') {
                cardBaseClass = 'bg-slate-800 border-2 border-indigo-500/50 text-indigo-300 hover:border-indigo-400';
                cardClearedClass = 'bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-yellow-400/50 text-yellow-300';
            } else if (currentTheme === 'candy') {
                cardBaseClass = 'bg-white border-2 border-pink-300 text-pink-500 hover:border-pink-400';
                cardClearedClass = 'bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-rose-300 text-rose-600';
            } else if (currentTheme === 'forest') {
                cardBaseClass = 'bg-white border-2 border-emerald-300 text-emerald-600 hover:border-emerald-500';
                cardClearedClass = 'bg-gradient-to-br from-lime-100 to-green-100 border-2 border-green-400 text-green-700';
            } else if (currentTheme === 'park') {
                cardBaseClass = 'bg-white border-2 border-lime-400 text-lime-600 hover:border-lime-500';
                cardClearedClass = 'bg-gradient-to-br from-emerald-50 to-lime-100 border-2 border-emerald-400 text-emerald-700';
            } else if (currentTheme === 'bath') {
                cardBaseClass = 'bg-white border-2 border-cyan-300 text-cyan-500 hover:border-cyan-400';
                cardClearedClass = 'bg-gradient-to-br from-sky-50 to-blue-100 border-2 border-blue-400 text-blue-700';
            } else if (currentTheme === 'toys') {
                cardBaseClass = 'bg-white border-2 border-orange-300 text-orange-500 hover:border-orange-400';
                cardClearedClass = 'bg-gradient-to-br from-yellow-50 to-red-50 border-2 border-red-400 text-red-600';
            }

            return (
              <button
                key={level}
                disabled={isLocked}
                onClick={() => onSelectLevel(level)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center relative shadow-sm transition-all duration-300
                  ${isLocked 
                    ? `bg-black/5 text-slate-400 cursor-not-allowed border border-transparent ${currentTheme === 'night' ? 'bg-white/5 text-slate-600' : ''}`
                    : isCleared 
                      ? `${cardClearedClass} hover:scale-105 active:scale-95 shadow-md` 
                      : `${cardBaseClass} hover:scale-105 active:scale-95 shadow-sm`
                  }
                `}
              >
                {isLocked ? (
                  <i className="fas fa-lock text-xl mb-1 opacity-50"></i>
                ) : isCleared ? (
                  <div className="relative">
                    <i className="fas fa-star text-2xl mb-1 drop-shadow-sm"></i>
                    <i className="fas fa-check absolute -bottom-1 -right-2 text-xs bg-white text-green-600 rounded-full p-0.5 border border-green-200"></i>
                  </div>
                ) : (
                  <span className="text-2xl font-black mb-1">{level}</span>
                )}
                
                {!isLocked && (
                  <span className="text-[10px] font-bold uppercase tracking-wide">
                    {isCleared ? 'Done' : 'Play'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
