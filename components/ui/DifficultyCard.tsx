import React from 'react';
import { Difficulty } from '../../types';

interface DifficultyCardProps {
  difficulty: Difficulty;
  points: number;
  color: string;
  onClick: () => void;
  description: string;
  completedLevels?: number;
  totalLevels?: number;
}

export const DifficultyCard: React.FC<DifficultyCardProps> = ({ 
  difficulty, 
  points, 
  color, 
  onClick, 
  completedLevels = 0,
  totalLevels = 100
}) => {
  // Get puppy emoji and unique design based on difficulty with creative puppy-themed icons
  const getCardConfig = () => {
    switch (difficulty) {
      case 'Easy':
        return {
          emoji: '🐕', // Happy puppy
          bgEmoji: '🌳', // Tree/outdoor theme
          shape: 'rounded-2xl', // Soft rounded
          borderStyle: 'border-2 border-white/40',
          icon: '🌱', // Growing/beginner
          pattern: 'diagonal',
          puppyIcon: '🐕‍🦺', // Puppy with vest - safe/easy
          decorative: '🌸' // Flowers - peaceful
        };
      case 'Medium':
        return {
          emoji: '🐶', // Energetic puppy
          bgEmoji: '🏃', // Running theme
          shape: 'rounded-xl', // Medium rounded
          borderStyle: 'border-2 border-white/50 border-dashed',
          icon: '⚡', // Energy
          pattern: 'circular',
          puppyIcon: '🎾', // Ball - active play
          decorative: '⭐' // Stars - achievement
        };
      case 'Hard':
        return {
          emoji: '🐺', // Wolf-like challenge
          bgEmoji: '🔥', // Fire/intense
          shape: 'rounded-lg', // Sharp corners
          borderStyle: 'border-2 border-white/60',
          icon: '💪', // Strength
          pattern: 'zigzag',
          puppyIcon: '🦴', // Bone - challenge reward
          decorative: '⚡' // Lightning - intense
        };
      default:
        return {
          emoji: '🐕',
          bgEmoji: '🐕',
          shape: 'rounded-2xl',
          borderStyle: 'border-2 border-white/40',
          icon: '🌱',
          pattern: 'diagonal',
          puppyIcon: '🐕‍🦺',
          decorative: '🌸'
        };
    }
  };

  const config = getCardConfig();

  return (
    <div 
      onClick={onClick}
      className={`${color} text-white p-3 ${config.shape} shadow-lg cursor-pointer transition-all relative overflow-hidden group flex flex-col items-center justify-center aspect-[2/1] w-full hover:shadow-xl hover:scale-105 active:scale-95 ${config.borderStyle} hover:border-white/80`}
      style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.25)',
        touchAction: 'pan-x',
      }}
    >
      {/* Unique Background Pattern based on difficulty */}
      {config.pattern === 'diagonal' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
        </div>
      )}
      {config.pattern === 'circular' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
        </div>
      )}
      {config.pattern === 'zigzag' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
          }}></div>
        </div>
      )}

      {/* Animated Background Emoji - Different sizes per difficulty */}
      <div className={`absolute -left-1 -bottom-1 opacity-15 ${difficulty === 'Easy' ? 'text-3xl' : difficulty === 'Medium' ? 'text-4xl' : 'text-5xl'} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
        {config.bgEmoji}
      </div>
      
      {/* Shimmer Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Unique Decorative Elements per difficulty */}
      {difficulty === 'Easy' && (
        <div className="absolute top-1 right-1 text-sm opacity-25 group-hover:opacity-35 transition-opacity">
          🌿
        </div>
      )}
      {difficulty === 'Medium' && (
        <div className="absolute top-1 right-1 text-sm opacity-25 group-hover:opacity-35 transition-opacity">
          ⚡
        </div>
      )}
      {difficulty === 'Hard' && (
        <div className="absolute top-1 right-1 text-sm opacity-25 group-hover:opacity-35 transition-opacity">
          💥
        </div>
      )}
      
      {/* Main Content - Top-Center Positioned */}
      <div className="z-10 flex flex-col items-center justify-start text-center w-full pt-4">
        {/* Creative Puppy Icon - Larger */}
        <div className="text-5xl mb-1 drop-shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all flex items-center justify-center">
          {config.puppyIcon}
        </div>
        
        {/* Difficulty Name - Larger */}
        <h3 className="text-xl font-black leading-tight drop-shadow-lg mb-0.5 bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent w-full text-center">
          {difficulty}
        </h3>
        
        {/* Description with Levels - Larger */}
        <p className="text-white/95 text-xs font-bold flex items-center justify-center gap-1 mb-1 w-full text-center">
          <span className="text-sm">{config.icon}</span>
          {/* <span>{completedLevels}/{totalLevels} Levels</span> */}
          <span className="text-white/90">{completedLevels}/{totalLevels} Levels</span>
        </p>

        {/* Points Badge - Larger */}
        <div className="flex items-center justify-center gap-1.5 bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-white/50">
          <span className="text-sm">⭐</span>
          <span className="font-black text-base">{points}</span>
        </div>
      </div>
    </div>
  );
};

