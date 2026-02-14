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
      className={`${color} text-white p-4 ${config.shape} shadow-lg cursor-pointer transition-all relative overflow-hidden group flex flex-col items-center justify-center w-full h-full ${config.borderStyle} hover:border-white/80`}
      style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.25)',
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

      {/* Animated Background Emoji */}
      <div className={`absolute -left-2 -bottom-2 opacity-15 text-5xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
        {config.bgEmoji}
      </div>
      
      {/* Shimmer Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-2 right-2 text-sm opacity-30 group-hover:opacity-50 transition-opacity animate-pulse">
        {config.decorative}
      </div>
      
      {/* Main Content */}
      <div className="z-10 flex flex-col items-center justify-center text-center w-full h-full gap-1">
        {/* Puppy Icon */}
        <div className="text-5xl drop-shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all mb-1">
          {config.puppyIcon}
        </div>
        
        {/* Difficulty Name */}
        <h3 className="text-2xl font-black leading-none drop-shadow-md bg-gradient-to-r from-white to-yellow-50 bg-clip-text text-transparent">
          {difficulty}
        </h3>
        
        {/* Stats Row */}
        <div className="flex items-center gap-2 mt-1">
          <div className="bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1">
             <span className="text-xs opacity-80">{config.icon}</span>
             <span className="text-[10px] font-bold">{completedLevels}/{totalLevels}</span>
          </div>
          <div className="bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
             <span className="text-[10px]">⭐</span>
             <span className="text-xs font-black">{points}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

