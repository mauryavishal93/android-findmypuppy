import React from 'react';

export const GameLogo: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => (
  <div className={`relative ${className} flex items-center justify-center`}>
     <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
       {/* Handle Shadow */}
       <path d="M148,148 L183,183" stroke="rgba(0,0,0,0.1)" strokeWidth="16" strokeLinecap="round" />
       
       {/* Handle */}
       <path d="M145,145 L180,180" stroke="#FF69B4" strokeWidth="16" strokeLinecap="round" />
       <path d="M145,145 L180,180" stroke="#FFD1DC" strokeWidth="6" strokeLinecap="round" />
       
       {/* Outer Ring / Glass Frame */}
       <circle cx="90" cy="90" r="75" fill="#FFF1F2" stroke="#FF69B4" strokeWidth="8" />
       
       {/* Glass Lens Background */}
       <circle cx="90" cy="90" r="68" fill="#FFFFFF" fillOpacity="0.4" />
       
       {/* Puppy Face Illustration */}
       <g transform="translate(45, 45) scale(0.9)">
         {/* Ears */}
         <path d="M10,30 Q-10,0 30,10" fill="#D97706" stroke="#92400E" strokeWidth="2" strokeLinejoin="round" />
         <path d="M90,30 Q110,0 70,10" fill="#D97706" stroke="#92400E" strokeWidth="2" strokeLinejoin="round" />
         
         {/* Head */}
         <path d="M20,40 Q50,10 80,40 Q95,60 80,85 Q50,95 20,85 Q5,60 20,40" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
         
         {/* Eyes */}
         <circle cx="35" cy="50" r="6" fill="#333" />
         <circle cx="65" cy="50" r="6" fill="#333" />
         <circle cx="37" cy="48" r="2.5" fill="white" />
         <circle cx="67" cy="48" r="2.5" fill="white" />

         {/* Snout Area */}
         <ellipse cx="50" cy="65" rx="14" ry="10" fill="#FFF" />
         
         {/* Nose */}
         <path d="M45,61 L55,61 L50,67 Z" fill="#333" />
         
         {/* Mouth */}
         <path d="M50,67 L50,72" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
         <path d="M44,70 Q50,76 56,70" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
         
         {/* Cheeks */}
         <circle cx="28" cy="65" r="4" fill="#FECACA" opacity="0.6" />
         <circle cx="72" cy="65" r="4" fill="#FECACA" opacity="0.6" />
       </g>

       {/* Glass Highlight/Reflection */}
       <path d="M40,60 Q70,30 110,40" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
       <circle cx="120" cy="60" r="4" fill="white" opacity="0.6" />
     </svg>
  </div>
);
