import React, { useState } from 'react';
import { ThemeType } from '../../types';
import { THEME_CONFIGS } from '../../constants/themeConfig';
import { db } from '../../services/db';
import { ModalBase, ModalHeader, ModalContent } from './ModalBase';

interface ThemeModalProps {
  onClose: () => void;
  onSelect: (theme: ThemeType) => void;
  currentTheme: ThemeType;
  unlockedThemes: ThemeType[];
  points: number;
  username?: string;
  onThemeUnlocked?: (themes: ThemeType[], newPoints?: number) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ 
  onClose, 
  onSelect, 
  currentTheme, 
  unlockedThemes,
  points,
  username,
  onThemeUnlocked
}) => {
  const [unlockingTheme, setUnlockingTheme] = useState<ThemeType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allThemes = Object.keys(THEME_CONFIGS) as ThemeType[];
  const defaultUnlocked: ThemeType[] = ['sunny', 'night'];
  const effectiveUnlocked = unlockedThemes && unlockedThemes.length >= 2 
    ? unlockedThemes 
    : defaultUnlocked;

  const handleUnlockTheme = async (theme: ThemeType, method: 'games' | 'points') => {
    if (!username) {
      setError('Please login to unlock themes');
      return;
    }

    if (method === 'points' && points < 25) {
      setError('Not enough points. Need 25 points to unlock this theme.');
      return;
    }

    setUnlockingTheme(theme);
    setError(null);

    try {
      const result = await db.unlockTheme(username, theme, method);
      if (result.success && result.unlockedThemes) {
        if (onThemeUnlocked) {
          onThemeUnlocked(result.unlockedThemes as ThemeType[], result.points);
        }
        // Auto-select the newly unlocked theme
        onSelect(theme);
      } else {
        setError(result.message || 'Failed to unlock theme');
      }
    } catch (err) {
      setError('Failed to unlock theme. Please try again.');
    } finally {
      setUnlockingTheme(null);
    }
  };


  return (
    <ModalBase isOpen={true} onClose={onClose} maxWidth="sm">
      <ModalHeader className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 pb-4 border-b border-purple-200">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <i className="fas fa-paint-brush text-brand"></i> Theme
        </h3>
      </ModalHeader>
      <ModalContent className="p-6">

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {allThemes.map((themeKey) => {
            const theme = THEME_CONFIGS[themeKey];
            const isSelected = currentTheme === themeKey;
            const isUnlocked = effectiveUnlocked.includes(themeKey);
            const isUnlocking = unlockingTheme === themeKey;

            return (
              <div
                key={themeKey}
                className={`
                  relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                  ${isSelected 
                    ? 'border-brand bg-brand-light/20 scale-105 shadow-md' 
                    : isUnlocked
                    ? 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 cursor-pointer'
                    : 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                  }
                `}
              >
                {isUnlocked ? (
                  <button
                    onClick={() => onSelect(themeKey)}
                    className="w-full flex flex-col items-center gap-2"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm ${
                      isSelected ? 'bg-brand text-white' : 'bg-white text-slate-400'
                    }`}>
                      <i className={`fas ${theme.icon}`}></i>
                    </div>
                    <span className={`text-sm font-bold ${isSelected ? 'text-brand-dark' : 'text-slate-500'}`}>
                      {theme.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-brand rounded-full border-2 border-white"></div>
                    )}
                  </button>
                ) : (
                  <div className="w-full flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm bg-slate-200 text-slate-400 relative">
                      <i className={`fas ${theme.icon}`}></i>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-lock text-slate-500 text-xs"></i>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-400">
                      {theme.name}
                    </span>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-slate-400 rounded-full flex items-center justify-center">
                      <i className="fas fa-lock text-white text-[8px]"></i>
                    </div>
                    
                    {/* Unlock Options */}
                    <div className="w-full mt-2 space-y-2">
                      {username && (
                        <>
                          <button
                            onClick={() => handleUnlockTheme(themeKey, 'points')}
                            disabled={isUnlocking || points < 25}
                            className={`
                              w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all
                              ${points >= 25 && !isUnlocking
                                ? 'bg-brand text-white hover:bg-brand-dark'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              }
                            `}
                          >
                            {isUnlocking ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              `Unlock (25 pts)`
                            )}
                          </button>
                        </>
                      )}
                      {!username && (
                        <div className="text-[10px] text-slate-500 text-center">
                          Login to unlock
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {username && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 text-center">
              <i className="fas fa-info-circle text-brand mr-1"></i>
              Spend 25 points to unlock each theme
            </p>
          </div>
        )}
      </ModalContent>
    </ModalBase>
  );
};
