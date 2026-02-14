
import React, { useState } from 'react';
import { Difficulty, ThemeType } from '../types';
import { renderThemeBackground } from '../utils/themeBackground';
import { THEME_CONFIGS } from '../constants/themeConfig';

interface LevelSelectorProps {
  difficulty: Difficulty;
  clearedLevels: { [key: string]: boolean };
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  backgroundMusicEnabled: boolean;
  soundEffectsEnabled: boolean;
  onToggleBackgroundMusic: () => void;
  onToggleSoundEffects: () => void;
  currentTheme: ThemeType;
  levelOfDay?: { levelId: number; difficulty: string } | null;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({ 
  difficulty, 
  clearedLevels, 
  onSelectLevel,
  onBack,
  isMuted,
  onToggleMute,
  backgroundMusicEnabled,
  soundEffectsEnabled,
  onToggleBackgroundMusic,
  onToggleSoundEffects,
  currentTheme,
  levelOfDay = null
}) => {
  const [isMusicDropdownOpen, setIsMusicDropdownOpen] = useState(false);
  const activeTheme = THEME_CONFIGS[currentTheme] || THEME_CONFIGS.night;
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

      <div className={`mobile-header border-b border-white/10 flex justify-between backdrop-blur-md shadow-sm z-40 sticky top-0 ${headerBgClass} transition-all duration-500 px-4 py-3`}>
        <button 
          onClick={onBack} 
          className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition shadow-sm border ${btnBgClass} active:scale-95`}
        >
          <i className="fas fa-arrow-left text-sm"></i>
        </button>
        <div className="flex flex-col items-center justify-center">
          <h2 className={`text-lg font-black tracking-tight leading-none ${headerTextClass}`}>{difficulty}</h2>
          <span className={`text-[10px] uppercase tracking-widest font-bold opacity-60 ${headerTextClass}`}>Select Level</span>
        </div>
        
        {/* Music Settings Dropdown */}
        <div className="relative z-50">
          <button 
            onClick={() => setIsMusicDropdownOpen(!isMusicDropdownOpen)} 
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border ${btnBgClass} relative z-50 active:scale-95`}
          >
            <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-sm`}></i>
          </button>
          
          {/* Dropdown Menu - Consistent Style */}
          {isMusicDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-[45]" 
                onClick={() => setIsMusicDropdownOpen(false)}
              ></div>
              
              <div 
                className={`absolute right-0 top-12 mt-2 w-48 rounded-2xl shadow-xl border border-white/40 ${activeTheme.cardBg} ${activeTheme.text} z-[50] overflow-hidden origin-top-right animate-fade-in-up`}
              >
                <button
                  onClick={onToggleBackgroundMusic}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 transition-colors border-b border-black/5`}
                >
                  <span className="text-xs font-bold flex items-center gap-2"><i className="fas fa-music w-4"></i> Music</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${backgroundMusicEnabled ? 'bg-brand' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${backgroundMusicEnabled ? 'translate-x-4' : ''}`}></div>
                  </div>
                </button>
                
                <button
                  onClick={onToggleSoundEffects}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 transition-colors`}
                >
                  <span className="text-xs font-bold flex items-center gap-2"><i className="fas fa-volume-up w-4"></i> SFX</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${soundEffectsEnabled ? 'bg-brand' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${soundEffectsEnabled ? 'translate-x-4' : ''}`}></div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-transparent z-10 relative hide-scrollbar">
        <div className="grid grid-cols-4 gap-3 sm:gap-4 pb-24 max-w-2xl mx-auto">
          {levels.map((level) => {
            const levelKey = `${difficulty}_${level}`;
            const isCleared = clearedLevels[levelKey];
            const previousKey = `${difficulty}_${level - 1}`;
            const isLocked = level > 1 && !clearedLevels[previousKey];
            const isLevelOfDay = levelOfDay && levelOfDay.levelId === level && levelOfDay.difficulty === difficulty;

            // Card Colors based on theme
            let cardBaseClass = 'bg-white border-2 border-slate-100 text-slate-700 hover:border-brand/30 hover:text-brand';
            let cardClearedClass = 'bg-emerald-50 border-2 border-emerald-200 text-emerald-600';
            
            // Simplified fallback for advanced themes
            if (currentTheme === 'night') {
                cardBaseClass = 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-300';
                cardClearedClass = 'bg-indigo-900/50 border-2 border-indigo-500/50 text-indigo-300';
            }

            return (
              <button
                key={level}
                disabled={isLocked}
                onClick={() => onSelectLevel(level)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center relative shadow-sm transition-all duration-300 overflow-hidden group
                  ${isLocked 
                    ? `bg-black/5 opacity-60 cursor-not-allowed border border-transparent ${currentTheme === 'night' ? 'bg-white/5' : ''}`
                    : isCleared 
                      ? `${cardClearedClass} shadow-md` 
                      : `${cardBaseClass} hover:shadow-md hover:-translate-y-0.5`
                  }
                `}
              >
                {/* Background Pattern for specific states */}
                {isLocked && (
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent"></div>
                )}
                
                {isLocked ? (
                  <div className="flex flex-col items-center opacity-40">
                    <i className="fas fa-lock text-lg mb-1"></i>
                    <span className="text-[10px] font-bold">{level}</span>
                  </div>
                ) : isCleared ? (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                      <i className="fas fa-star text-2xl mb-1 drop-shadow-sm animate-bounce-short" style={{ animationDuration: '3s' }}></i>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        <i className="fas fa-check text-[8px] text-emerald-600 block"></i>
                      </div>
                    </div>
                    <span className="text-lg font-black leading-none">{level}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center z-10">
                    <span className="text-2xl font-black mb-0 leading-none group-hover:scale-110 transition-transform">{level}</span>
                    {isLevelOfDay && (
                       <span className="text-[8px] font-bold text-amber-500 uppercase tracking-tight mt-1">Bonus</span>
                    )}
                  </div>
                )}
                
                {isLevelOfDay && !isLocked && (
                  <span className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-bl from-amber-400 to-transparent flex items-start justify-end pr-1 pt-0.5">
                    <span className="text-[8px] font-black text-white">2×</span>
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
