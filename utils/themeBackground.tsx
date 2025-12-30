
import React from 'react';
import { ThemeType } from '../types';

export const renderThemeBackground = (themeId: ThemeType) => {
  switch (themeId) {
    case 'night':
      return (
        <>
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1a1b4b] to-slate-950 opacity-90"></div>
           
           {/* Moon & Stars */}
           <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-100 rounded-full blur-[80px] opacity-10"></div>
           <i className="fas fa-moon absolute top-8 right-8 text-7xl text-yellow-100/40 rotate-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"></i>
           
           {[...Array(12)].map((_, i) => (
              <i key={i} className="fas fa-star absolute text-white/20 animate-pulse" 
                 style={{
                   top: `${Math.random() * 50}%`, 
                   left: `${Math.random() * 100}%`, 
                   fontSize: `${8 + Math.random() * 16}px`,
                   animationDelay: `${Math.random() * 3}s`,
                   opacity: 0.3 + Math.random() * 0.5
                 }}></i>
           ))}
           
           {/* Silhouette Landscape */}
           <div className="absolute bottom-0 w-full h-1/2 overflow-hidden opacity-40">
              <i className="fas fa-tree absolute bottom-[-20px] left-[-40px] text-[14rem] text-[#0f172a]"></i>
              <i className="fas fa-tree absolute bottom-[-30px] right-[-30px] text-[12rem] text-[#0f172a] transform -scale-x-100"></i>
              <div className="absolute bottom-0 left-1/4 w-1/2 h-32 bg-[#0f172a] rounded-t-full blur-xl opacity-50"></div>
           </div>
           
           <i className="fas fa-meteor absolute top-20 left-1/3 text-5xl text-blue-300/10 rotate-45"></i>
        </>
      );

    case 'candy':
      return (
        <>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-100/40 via-purple-100/20 to-transparent"></div>
           
           {/* Clouds */}
           <i className="fas fa-cloud absolute top-10 left-[-20px] text-9xl text-white/60 animate-[pulse_4s_ease-in-out_infinite]"></i>
           <i className="fas fa-cloud absolute top-32 right-[-40px] text-[10rem] text-white/50 animate-[pulse_5s_ease-in-out_infinite] delay-1000"></i>
           
           {/* Floating Sweets */}
           <i className="fas fa-candy-cane absolute top-24 left-[20%] text-8xl text-pink-400/10 rotate-12 drop-shadow-md"></i>
           <i className="fas fa-ice-cream absolute bottom-1/3 right-[15%] text-9xl text-purple-400/10 -rotate-12 drop-shadow-md"></i>
           <i className="fas fa-cookie absolute bottom-20 left-[10%] text-7xl text-yellow-600/10 rotate-45"></i>
           
           {/* Ground Hills */}
           <div className="absolute -bottom-20 -left-20 w-[70%] h-64 bg-pink-200/30 rounded-full blur-2xl"></div>
           <div className="absolute -bottom-20 -right-20 w-[70%] h-64 bg-purple-200/30 rounded-full blur-2xl"></div>
           
           <i className="fas fa-heart absolute top-10 right-20 text-6xl text-pink-400/20 animate-bounce"></i>
        </>
      );

    case 'forest':
       return (
        <>
           <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent"></div>
           
           {/* Trees Layer */}
           <i className="fas fa-tree absolute top-10 left-[-20px] text-8xl text-emerald-800/5 rotate-180 opacity-20"></i> {/* Abstract canopy */}
           
           <div className="absolute bottom-0 w-full h-1/2">
              <i className="fas fa-tree absolute bottom-10 left-5 text-[9rem] text-emerald-700/10 drop-shadow-lg"></i>
              <i className="fas fa-tree absolute bottom-20 right-[-20px] text-[8rem] text-teal-700/10 transform -scale-x-100 drop-shadow-lg"></i>
              <i className="fas fa-leaf absolute bottom-1/3 right-1/3 text-6xl text-emerald-500/10 rotate-45 animate-pulse"></i>
           </div>
           
           <i className="fas fa-sun absolute top-5 right-5 text-yellow-400/20 text-9xl animate-[spin_60s_linear_infinite]"></i>
           <i className="fas fa-frog absolute bottom-5 left-1/3 text-6xl text-green-600/10"></i>
        </>
       );

    case 'park':
       return (
        <>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-100/40 to-transparent"></div>
           <i className="fas fa-sun absolute -top-10 -left-10 text-[10rem] text-yellow-400/20 animate-[spin_40s_linear_infinite]"></i>
           
           <div className="absolute inset-0 overflow-hidden">
              <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[40%] bg-lime-200/30 rounded-tl-[100px] blur-xl"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[50%] bg-green-200/30 rounded-tr-[100px] blur-xl"></div>
           </div>

           <i className="fas fa-cloud absolute top-20 right-10 text-8xl text-white/70 animate-pulse"></i>
           <i className="fas fa-baseball-ball absolute top-1/3 right-20 text-6xl text-orange-400/20 rotate-12 animate-bounce"></i>
           <i className="fas fa-bone absolute bottom-32 left-16 text-7xl text-amber-600/10 -rotate-45"></i>
           <i className="fas fa-dog absolute bottom-5 right-5 text-[9rem] text-emerald-800/5 -rotate-6"></i>
        </>
       );

    case 'bath':
       return (
        <>
           <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 to-blue-50/50"></div>
           
           {/* Bubbles */}
           <div className="absolute top-20 left-10 w-24 h-24 rounded-full border-4 border-white/30 animate-bounce"></div>
           <div className="absolute top-40 right-20 w-16 h-16 rounded-full border-2 border-white/30 animate-[bounce_3s_infinite]"></div>
           <div className="absolute bottom-1/3 left-1/2 w-10 h-10 rounded-full border-2 border-white/20 animate-[bounce_4s_infinite]"></div>
           
           <i className="fas fa-soap absolute top-10 right-10 text-8xl text-pink-300/20 rotate-12"></i>
           <i className="fas fa-shower absolute top-5 left-1/3 text-7xl text-cyan-500/10"></i>
           
           {/* Water level */}
           <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-blue-200/20 to-transparent"></div>
           <i className="fas fa-bath absolute bottom-5 left-5 text-[10rem] text-blue-300/10"></i>
        </>
       );

    case 'toys':
       return (
        <>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-yellow-50 to-transparent"></div>
           
           <i className="fas fa-puzzle-piece absolute top-10 left-10 text-9xl text-red-400/10 -rotate-12"></i>
           <i className="fas fa-gamepad absolute top-24 right-10 text-8xl text-purple-400/10 rotate-12"></i>
           <i className="fas fa-robot absolute bottom-32 right-1/3 text-[8rem] text-blue-400/10"></i>
           <i className="fas fa-shapes absolute top-1/2 left-1/4 text-7xl text-yellow-500/20 animate-spin-slow"></i>
           
           <i className="fas fa-cube absolute bottom-10 left-10 text-9xl text-orange-400/10"></i>
        </>
       );

    case 'sunny':
    default:
      return (
        <>
           {/* Sky & Sun */}
           <div className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-200/40 rounded-full blur-[100px]"></div>
           <i className="fas fa-sun absolute top-10 right-10 text-9xl text-yellow-400/30 animate-[spin_120s_linear_infinite]"></i>
           
           {/* Clouds */}
           <i className="fas fa-cloud absolute top-24 left-[-40px] text-[10rem] text-white/70 animate-[pulse_4s_ease-in-out_infinite] drop-shadow-sm"></i>
           <i className="fas fa-cloud absolute top-48 right-[-30px] text-[8rem] text-white/50 animate-[pulse_6s_ease-in-out_infinite] delay-1000 drop-shadow-sm"></i>
           
           {/* Hills Composition */}
           <div className="absolute bottom-0 left-0 w-full h-2/3 overflow-hidden pointer-events-none">
              <div className="absolute bottom-[-10%] left-[-20%] w-[80%] h-[60%] bg-green-100/60 rounded-full blur-xl"></div>
              <div className="absolute bottom-[-15%] right-[-10%] w-[90%] h-[70%] bg-emerald-100/60 rounded-full blur-xl"></div>
           </div>

           {/* Elements */}
           <i className="fas fa-tree absolute bottom-28 left-6 text-8xl text-green-600/10 transform rotate-2"></i>
           <i className="fas fa-tree absolute bottom-12 right-10 text-7xl text-emerald-600/10 transform -scale-x-100"></i>
           
           {/* Dog Silhouette */}
           <i className="fas fa-dog absolute bottom-6 left-1/3 text-[12rem] text-brand-dark/5 rotate-6"></i>
           
           {/* Floating Icons */}
           <i className="fas fa-bone absolute top-1/2 left-12 text-5xl text-slate-400/20 rotate-45 animate-bounce delay-700"></i>
           <i className="fas fa-paw absolute top-1/3 right-1/4 text-4xl text-brand/10 -rotate-12 animate-pulse"></i>
        </>
      );
  }
};
