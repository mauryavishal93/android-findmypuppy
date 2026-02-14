import React from 'react';
import { APP_VERSION } from '../../constants/appVersion';

interface SettingsModalProps {
  onClose: () => void;
  backgroundMusicEnabled: boolean;
  soundEffectsEnabled: boolean;
  hapticsEnabled: boolean;
  hapticIntensity: number; // 0–1
  onToggleBackgroundMusic: () => void;
  onToggleSoundEffects: () => void;
  onToggleHaptics: () => void;
  onHapticIntensityChange: (value: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  backgroundMusicEnabled,
  soundEffectsEnabled,
  hapticsEnabled,
  hapticIntensity,
  onToggleBackgroundMusic,
  onToggleSoundEffects,
  onToggleHaptics,
  onHapticIntensityChange
}) => {
  return (
    <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl relative border-4 border-white overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-6 pb-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <i className="fas fa-cog text-slate-600"></i> Settings
            </h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/80 text-slate-400 hover:bg-white hover:text-slate-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Audio Settings */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audio & Feedback</h4>
            
            {/* Music Toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${backgroundMusicEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                  <i className="fas fa-music"></i>
                </div>
                <div>
                  <span className="block font-bold text-slate-800">Music</span>
                  <span className="text-xs text-slate-500">Background melody</span>
                </div>
              </div>
              <button 
                onClick={onToggleBackgroundMusic}
                className={`w-12 h-7 rounded-full transition-colors relative ${backgroundMusicEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-transform ${backgroundMusicEnabled ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>

            {/* SFX Toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${soundEffectsEnabled ? 'bg-pink-100 text-pink-600' : 'bg-slate-200 text-slate-400'}`}>
                  <i className="fas fa-volume-up"></i>
                </div>
                <div>
                  <span className="block font-bold text-slate-800">Sound FX</span>
                  <span className="text-xs text-slate-500">Taps and interactions</span>
                </div>
              </div>
              <button 
                onClick={onToggleSoundEffects}
                className={`w-12 h-7 rounded-full transition-colors relative ${soundEffectsEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-transform ${soundEffectsEnabled ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>

            {/* Haptics Toggle + Intensity */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hapticsEnabled ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-400'}`}>
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">Vibration</span>
                    <span className="text-xs text-slate-500">Haptic feedback</span>
                  </div>
                </div>
                <button 
                  onClick={onToggleHaptics}
                  className={`w-12 h-7 rounded-full transition-colors relative ${hapticsEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-transform ${hapticsEnabled ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
              {hapticsEnabled && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">Intensity</span>
                    <span className="text-xs font-bold text-slate-700">{Math.round(hapticIntensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(hapticIntensity * 100)}
                    onChange={(e) => onHapticIntensityChange(Number(e.target.value) / 100)}
                    className="w-full h-2 rounded-full appearance-none bg-slate-200 accent-orange-500 cursor-pointer"
                    style={{ accentColor: '#f97316' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About</h4>
             
             <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group">
               <span className="font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">Privacy Policy</span>
               <i className="fas fa-chevron-right text-slate-300 group-hover:text-indigo-400"></i>
             </a>
             
             <div className="flex items-center justify-between p-3">
               <span className="font-medium text-slate-600">Version</span>
               <span className="text-sm font-bold text-slate-400">{APP_VERSION}</span>
             </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Find My Puppy</p>
        </div>
      </div>
    </div>
  );
};
