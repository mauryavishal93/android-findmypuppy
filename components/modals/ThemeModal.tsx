import React from 'react';
import { ThemeType } from '../../types';
import { THEME_CONFIGS } from '../../constants/themeConfig';

interface ThemeModalProps {
  onClose: () => void;
  onSelect: (theme: ThemeType) => void;
  currentTheme: ThemeType;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ onClose, onSelect, currentTheme }) => (
  <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border-4 border-white animate-fade-in max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <i className="fas fa-paint-brush text-brand"></i> Theme
        </h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
          <i className="fas fa-times text-slate-500"></i>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(THEME_CONFIGS) as ThemeType[]).map((themeKey) => {
          const theme = THEME_CONFIGS[themeKey];
          const isSelected = currentTheme === themeKey;
          return (
            <button
              key={themeKey}
              onClick={() => onSelect(themeKey)}
              className={`
                relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                ${isSelected 
                  ? 'border-brand bg-brand-light/20 scale-105 shadow-md' 
                  : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300'
                }
              `}
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
          );
        })}
      </div>
    </div>
  </div>
);

