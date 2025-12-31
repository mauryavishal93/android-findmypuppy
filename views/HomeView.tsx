import React, { useState } from 'react';
import { Difficulty, UserProgress, ThemeConfig } from '../types';
import { DifficultyCard } from '../components/ui/DifficultyCard';
import { GameLogo } from '../components/GameLogo';
import { AdBanner } from '../components/AdBanner';
import { GOOGLE_AD_CLIENT_ID, GOOGLE_AD_SLOT_ID } from '../constants/ads';
import { renderThemeBackground } from '../utils/themeBackground';
import { UserDropdown } from '../components/ui/UserDropdown';
import { PriceOffer } from '../services/db';

interface HomeViewProps {
  progress: UserProgress;
  activeTheme: ThemeConfig;
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onOpenThemeModal: () => void;
  onOpenInfoModal: () => void;
  onOpenHintShop: () => void;
  onOpenPurchaseHistory: () => void;
  onLogout: () => void;
  priceOffer: PriceOffer | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  progress,
  activeTheme,
  selectedDifficulty,
  onSelectDifficulty,
  onToggleMute,
  isMuted,
  onOpenThemeModal,
  onOpenInfoModal,
  onOpenHintShop,
  onOpenPurchaseHistory,
  onLogout,
  priceOffer
}) => {
  // Use price offer values if available, otherwise fallback to defaults
  const marketPrice = priceOffer?.marketPrice || 99;
  const offerPrice = priceOffer?.offerPrice || 9;
  const hintCount = priceOffer?.hintCount || 100;
  const hasOffer = marketPrice !== offerPrice;
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  return (
    <div className={`flex flex-col h-full ${activeTheme.background} relative overflow-hidden transition-colors duration-500`}>
      
      {/* Decorative Landscape Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {renderThemeBackground(activeTheme.id)}
      </div>

      <header className={`${activeTheme.headerBg} backdrop-blur-md px-4 py-2 shadow-sm flex justify-between items-center z-[100] sticky top-0 border-b shrink-0 h-16 relative`}>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className={`bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600 w-9 h-9 rounded-full flex items-center justify-center font-black text-lg border-2 border-white shadow-sm cursor-pointer`}>
               {progress.playerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className={`text-[9px] font-bold uppercase tracking-wider opacity-70 ${activeTheme.text}`}>Player</span>
              <span className={`text-sm font-black leading-none drop-shadow-sm ${activeTheme.text}`}>{progress.playerName}</span>
            </div>
          </button>
          
          <UserDropdown
            isOpen={isUserDropdownOpen}
            onClose={() => setIsUserDropdownOpen(false)}
            activeTheme={activeTheme}
            onInfoClick={onOpenInfoModal}
            onThemeClick={onOpenThemeModal}
            onPurchaseHistoryClick={onOpenPurchaseHistory}
            onLogout={onLogout}
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleMute} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm ${activeTheme.iconBg}`}>
            <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-xs`}></i>
          </button>

          <div className={`backdrop-blur-sm px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 border-2 border-white shadow-sm ${activeTheme.cardBg} ${activeTheme.accent}`}>
            <i className="fas fa-trophy text-sm drop-shadow-sm"></i>
            <span className="text-sm">{progress.totalScore}</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden flex flex-col items-center z-10 w-full hide-scrollbar">
        <div className="w-full max-w-sm space-y-4">
          <div className={`flex flex-col items-center text-center p-4 rounded-3xl backdrop-blur-sm shadow-sm border relative overflow-hidden ${activeTheme.cardBg}`}>
             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 ${activeTheme.accent}`}></div>
             <GameLogo className="w-16 h-16 mb-2 drop-shadow-md transform hover:scale-105 transition-transform duration-500" />
             <h2 className={`text-2xl font-black tracking-tight ${activeTheme.text}`}>Select Difficulty</h2>
             <p className={`font-medium text-xs mt-0.5 ${activeTheme.subText}`}>Where are the puppies hiding today?</p>
          </div>
          
          <div className="space-y-3 perspective-1000">
            <DifficultyCard 
              difficulty={Difficulty.EASY} 
              points={5} 
              color={activeTheme.id === 'night' ? "bg-gradient-to-r from-indigo-600 to-blue-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"}
              description="100 Levels • Relaxed" 
              onClick={() => onSelectDifficulty(Difficulty.EASY)}
            />
            <DifficultyCard 
              difficulty={Difficulty.MEDIUM} 
              points={10} 
              color={activeTheme.id === 'night' ? "bg-gradient-to-r from-purple-600 to-indigo-600" : "bg-gradient-to-r from-blue-400 to-indigo-500"}
              description="100 Levels • Timed" 
              onClick={() => onSelectDifficulty(Difficulty.MEDIUM)}
            />
            <DifficultyCard 
              difficulty={Difficulty.HARD} 
              points={15} 
              color={activeTheme.id === 'night' ? "bg-gradient-to-r from-pink-700 to-rose-600" : "bg-gradient-to-r from-rose-500 to-pink-600"}
              description="100 Levels • Expert" 
              onClick={() => onSelectDifficulty(Difficulty.HARD)}
            />
            
            {/* Buy Hints Shop Card */}
            <div 
              onClick={onOpenHintShop}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-2xl shadow-md cursor-pointer transition-all relative overflow-hidden group flex items-center justify-between h-16 w-full hover:shadow-xl hover:-translate-y-1 mt-4 border-2 border-yellow-300"
            >
              <div className="absolute -left-3 -bottom-3 opacity-20 text-5xl group-hover:scale-110 transition-transform rotate-12">
                <i className="fas fa-lightbulb"></i>
              </div>
              
              <div className="z-10 flex flex-col pl-1">
                <h3 className="text-lg font-black leading-none drop-shadow-sm">Buy Hints</h3>
                <p className="text-white/90 text-[10px] font-medium mt-0.5 opacity-90 shadow-sm">
                  Total Hints: {progress.premiumHints || 0}
                </p>
              </div>

              <div className="z-10 flex flex-col items-end pr-1">
                <div className="flex items-center gap-1 bg-white/25 px-2 py-0.5 rounded-lg backdrop-blur-md shadow-sm border border-white/20">
                  {hasOffer ? (
                    <>
                      <span className="text-[9px] line-through opacity-70 font-medium">₹{marketPrice}</span>
                      <span className="font-black text-sm">₹{offerPrice}</span>
                    </>
                  ) : (
                    <span className="font-black text-sm">₹{offerPrice}</span>
                  )}
                </div>
                <span className="text-[9px] mt-0.5 opacity-90 uppercase font-bold tracking-wider drop-shadow-sm">{hintCount} Pack</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Ad Banner - Sticky Footer */}
      <div className="shrink-0 z-20 w-full flex justify-center items-center bg-white/20 backdrop-blur-md border-t border-white/30 py-2">
         <AdBanner 
            dataAdClient={GOOGLE_AD_CLIENT_ID}
            dataAdSlot={GOOGLE_AD_SLOT_ID}
            className="w-[320px] max-w-full" 
         />
      </div>
    </div>
  );
};

