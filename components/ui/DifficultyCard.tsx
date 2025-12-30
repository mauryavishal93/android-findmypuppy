import React from 'react';
import { Difficulty } from '../../types';

interface DifficultyCardProps {
  difficulty: Difficulty;
  points: number;
  color: string;
  onClick: () => void;
  description: string;
}

export const DifficultyCard: React.FC<DifficultyCardProps> = ({ 
  difficulty, 
  points, 
  color, 
  onClick, 
  description 
}) => (
  <div 
    onClick={onClick}
    className={`${color} text-white p-3 rounded-2xl shadow-md cursor-pointer transition-all relative overflow-hidden group flex items-center justify-between h-16 w-full hover:shadow-xl hover:-translate-y-1`}
  >
    <div className="absolute -left-3 -bottom-3 opacity-20 text-5xl group-hover:scale-110 transition-transform rotate-12">
      <i className="fas fa-paw"></i>
    </div>
    
    <div className="z-10 flex flex-col pl-1">
      <h3 className="text-lg font-black leading-none drop-shadow-sm">{difficulty}</h3>
      <p className="text-white/90 text-[10px] font-medium mt-0.5 opacity-90 shadow-sm">{description}</p>
    </div>

    <div className="z-10 flex flex-col items-end pr-1">
      <div className="flex items-center gap-1 bg-white/25 px-2 py-0.5 rounded-lg backdrop-blur-md shadow-sm">
        <i className="fas fa-star text-yellow-300 text-[10px] filter drop-shadow"></i>
        <span className="font-bold text-xs">{points}</span>
      </div>
      <span className="text-[9px] mt-0.5 opacity-90 uppercase font-bold tracking-wider drop-shadow-sm">Points</span>
    </div>
  </div>
);

