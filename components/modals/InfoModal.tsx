import React, { useState } from 'react';

interface InfoModalProps {
  onClose: () => void;
  onOpenExplorerGuide?: () => void;
  onOpenLeaderboard?: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose, onOpenExplorerGuide, onOpenLeaderboard }) => {
  const [showGuidePreview, setShowGuidePreview] = useState(false);

  return (
  <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-4 px-4 animate-fade-in overflow-hidden">
    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative max-h-[calc(90vh-2rem)] flex flex-col border-4 border-white overflow-hidden">
      {/* Header - Fixed with Gradient */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-slate-100 bg-gradient-to-br from-brand-light via-pink-50 to-yellow-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center shadow-lg animate-pulse-fast">
              <i className="fas fa-book-open text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">🐾 Explorer's Guide 🐾</h3>
              <p className="text-xs text-slate-600 font-medium">Your Complete Adventure Manual</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 text-slate-400 hover:bg-white hover:text-slate-600 flex items-center justify-center transition-colors shadow-sm"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-4 hide-scrollbar">
        <div className="space-y-6">
          
          {/* Hero Section - Enhanced */}
          <div className="bg-gradient-to-br from-brand-light via-pink-100 to-yellow-100 rounded-2xl p-5 border-2 border-brand/20 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full -ml-12 -mb-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-5xl animate-bounce">🐶</span>
                <div>
                  <h4 className="text-xl font-black text-slate-800 mb-1">Welcome to FindMyPuppy!</h4>
                  <p className="text-xs text-slate-600 font-semibold">🎮 The Ultimate Hidden Puppy Adventure 🎮</p>
                </div>
              </div>
              <p className="text-slate-700 text-sm font-medium leading-relaxed mb-3">
                Embark on an <strong className="text-brand-dark">epic adventure</strong> through magical worlds and rescue adorable puppies hiding in plain sight! Each scene is uniquely crafted with <strong className="text-pink-600">AI-generated artwork</strong>, making every level a fresh and exciting challenge! 🌟
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-white/80 px-2 py-1 rounded-full text-xs font-bold text-slate-700 border border-brand/30">✨ 100 Unique Levels</span>
                <span className="bg-white/80 px-2 py-1 rounded-full text-xs font-bold text-slate-700 border border-brand/30">🎨 Beautiful Themes</span>
                <span className="bg-white/80 px-2 py-1 rounded-full text-xs font-bold text-slate-700 border border-brand/30">🏆 Compete Globally</span>
              </div>
            </div>
          </div>

          {/* Explorer Guide Feature - Similar to Daily Check-In */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 border-2 border-white/30 relative overflow-hidden shadow-2xl">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <i className="fas fa-compass text-white text-2xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-black text-white mb-1">🗺️ Explorer's Guide</h4>
                  <p className="text-white/90 text-xs font-medium">Interactive Tutorial & Tips</p>
                </div>
              </div>
              
              <p className="text-white/95 text-sm mb-4 leading-relaxed font-medium">
                New to the game? Start your adventure with our <strong className="text-yellow-200">interactive Explorer's Guide</strong>! Learn all the tricks, master the controls, and become a puppy-finding expert! 🎓
              </p>

              {/* Guide Preview Cards */}
              {showGuidePreview && (
                <div className="mb-4 space-y-2 animate-fade-in">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                    <div className="flex items-center gap-2 text-white text-xs font-semibold">
                      <i className="fas fa-check-circle text-yellow-300"></i>
                      <span>Step-by-step interactive tutorial</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                    <div className="flex items-center gap-2 text-white text-xs font-semibold">
                      <i className="fas fa-check-circle text-yellow-300"></i>
                      <span>Master zoom, pan, and tap controls</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                    <div className="flex items-center gap-2 text-white text-xs font-semibold">
                      <i className="fas fa-check-circle text-yellow-300"></i>
                      <span>Pro tips for finding hidden puppies</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                    <div className="flex items-center gap-2 text-white text-xs font-semibold">
                      <i className="fas fa-check-circle text-yellow-300"></i>
                      <span>Hint system explained in detail</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (onOpenExplorerGuide) {
                      onOpenExplorerGuide();
                      onClose();
                    } else {
                      setShowGuidePreview(!showGuidePreview);
                    }
                  }}
                  className="flex-1 bg-white text-indigo-600 px-4 py-3 rounded-xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-white/50"
                >
                  <i className="fas fa-play-circle"></i>
                  <span>Start Guide</span>
                </button>
                <button
                  onClick={() => setShowGuidePreview(!showGuidePreview)}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-white/30 active:scale-95 transition-all border border-white/30 flex items-center justify-center"
                >
                  <i className={`fas ${showGuidePreview ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
              </div>

              {/* Badge/Indicator */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="bg-yellow-400 text-indigo-900 px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1.5">
                  <i className="fas fa-star"></i>
                  <span>Recommended for Beginners</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Feature */}
          <div className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-5 border-2 border-white/30 relative overflow-hidden shadow-2xl">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 translate-y-16 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <i className="fas fa-trophy text-white text-2xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-black text-white mb-1">🏆 Leaderboard</h4>
                  <p className="text-white/90 text-xs font-medium">Top Players & Rankings</p>
                </div>
              </div>
              
              <p className="text-white/95 text-sm mb-4 leading-relaxed font-medium">
                Compete with players worldwide! Check out the <strong className="text-yellow-200">top 10 players</strong> ranked by points. See where you stand and challenge yourself to climb the ranks! 🎯
              </p>

              {/* Leaderboard Preview Info */}
              <div className="mb-4 space-y-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="flex items-center gap-2 text-white text-xs font-semibold">
                    <i className="fas fa-medal text-yellow-300"></i>
                    <span>Top 10 players ranked by points</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="flex items-center gap-2 text-white text-xs font-semibold">
                    <i className="fas fa-star text-yellow-300"></i>
                    <span>See your rank and compete with friends</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="flex items-center gap-2 text-white text-xs font-semibold">
                    <i className="fas fa-chart-line text-yellow-300"></i>
                    <span>Updated in real-time as players earn points</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (onOpenLeaderboard) {
                      onOpenLeaderboard();
                      onClose();
                    }
                  }}
                  className="flex-1 bg-white text-orange-600 px-4 py-3 rounded-xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-white/50"
                >
                  <i className="fas fa-trophy"></i>
                  <span>View Leaderboard</span>
                </button>
              </div>

              {/* Badge/Indicator */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="bg-yellow-400 text-orange-900 px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1.5">
                  <i className="fas fa-fire"></i>
                  <span>Compete & Climb!</span>
                </div>
              </div>
            </div>
          </div>

          {/* How to Play - Step by Step */}
          <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                <i className="fas fa-play text-white"></i>
              </div>
              <h4 className="text-lg font-black text-slate-800">How to Play</h4>
            </div>
            
            {/* YouTube Video Link - Below Title */}
            <div className="mb-4 flex justify-center">
              <a
                href="https://www.youtube.com/watch?v=_aBm0CZDCPo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <i className="fab fa-youtube text-[10px]"></i>
                <span>Watch Video Trailer</span>
              </a>
            </div>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-sm shadow-sm">
                  1
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <i className="fas fa-search text-blue-500"></i> Explore the Scene
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong>Look everywhere!</strong> Puppies are hidden throughout the image. <strong>Pan left, right, up, and down</strong> by dragging your finger or mouse. The image is much larger than your screen!
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-sm shadow-sm">
                  2
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <i className="fas fa-hand-pointer text-blue-500"></i> Zoom In & Out
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong>Pinch to zoom</strong> (mobile) or <strong>Ctrl + Scroll</strong> (desktop) to get a closer look. Puppies can be tiny, especially in Hard mode! Zoom out to see the bigger picture.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-sm shadow-sm">
                  3
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <i className="fas fa-mouse-pointer text-blue-500"></i> Tap to Find
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong>Tap or click</strong> on any puppy you spot! They're camouflaged to blend with the scene, so look carefully. Found puppies will bounce and celebrate! 🎉
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-sm shadow-sm">
                  4
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <i className="fas fa-heart text-red-500"></i> Watch Your Lifes!
                  </h5>
                      <p className="text-sm text-slate-600 leading-relaxed">
                    <strong>You have 3 lifes!</strong> If you tap 3 places where no puppy is hiding, the game ends. Look at the top-left corner to see your remaining lifes (🐕 icons). <strong className="text-red-600">Be careful!</strong> Wrong taps show a red ❌ mark briefly.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-sm shadow-sm">
                  5
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <i className="fas fa-lightbulb text-yellow-500"></i> Use Hints Wisely
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Stuck? Tap the <strong>💡 hint button</strong> (bottom-right). It will highlight 1-2 puppies and scroll to show you where they are. You get 2 free hints per level!
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-black text-sm shadow-sm">
                  ✓
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <i className="fas fa-trophy text-yellow-500"></i> Complete the Level
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Find <strong>all puppies</strong> to clear the level and earn points! Progress through 100 levels, each more challenging than the last!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Game Modes - Enhanced */}
          <div className="border-2 border-slate-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 flex justify-between items-center">
              <h4 className="font-black text-white text-base uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-layer-group"></i> Difficulty Modes
              </h4>
              <span className="text-xs text-slate-300 font-bold">Choose Your Challenge</span>
            </div>
            <div className="divide-y divide-slate-100">
              {/* Easy */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <i className="fas fa-seedling text-white"></i>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-black text-emerald-700 text-base">Easy Mode</h5>
                    <p className="text-xs text-emerald-600">Perfect for beginners!</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-clock text-emerald-500 w-4"></i>
                    <span><strong>No Timer</strong> - Take your time!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-paw text-emerald-500 w-4"></i>
                    <span><strong>15-25 Puppies</strong> - Easier to spot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-star text-yellow-500 w-4"></i>
                    <span><strong>+5 Points</strong> per level</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-eye text-emerald-500 w-4"></i>
                    <span><strong>More Visible</strong> - Less camouflage</span>
                  </div>
                </div>
              </div>

              {/* Medium */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                    <i className="fas fa-fire text-white"></i>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-black text-blue-700 text-base">Medium Mode</h5>
                    <p className="text-xs text-blue-600">For the adventurous!</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-clock text-blue-500 w-4"></i>
                    <span><strong>150 Seconds</strong> (2m 30s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-paw text-blue-500 w-4"></i>
                    <span><strong>25-35 Puppies</strong> - More to find</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-star text-yellow-500 w-4"></i>
                    <span><strong>+10 Points</strong> per level</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-mask text-blue-500 w-4"></i>
                    <span><strong>Better Hidden</strong> - More camouflage</span>
                  </div>
                </div>
              </div>

              {/* Hard */}
              <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 hover:from-rose-100 hover:to-red-100 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center shadow-md">
                    <i className="fas fa-skull text-white"></i>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-black text-rose-700 text-base">Hard Mode</h5>
                    <p className="text-xs text-rose-600">Master level challenge!</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-clock text-rose-500 w-4"></i>
                    <span><strong>180 Seconds</strong> (3 minutes)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-paw text-rose-500 w-4"></i>
                    <span><strong>40-50 Puppies</strong> - TINY!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-star text-yellow-500 w-4"></i>
                    <span><strong>+15 Points</strong> per level</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-ghost text-rose-500 w-4"></i>
                    <span><strong>Nearly Invisible</strong> - Expert level!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hint System - Enhanced */}
          <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-yellow-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/20 rounded-full -mr-12 -mt-12"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <i className="fas fa-lightbulb text-white text-xl"></i>
                </div>
                <h4 className="text-lg font-black text-slate-800">💡 Hint System</h4>
              </div>
              <div className="space-y-3">
                <div className="bg-white/80 p-3 rounded-xl border border-yellow-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-gift text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-black text-slate-800 mb-1">Free Daily Hints</span>
                      <span className="text-xs text-slate-600 leading-relaxed">
                        You get <strong className="text-green-600">2 FREE hints</strong> every single level! They automatically reset when you start a new game. Use them wisely!
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-yellow-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-coins text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-black text-slate-800 mb-1">Buy with Points</span>
                      <span className="text-xs text-slate-600 leading-relaxed">
                        Out of free hints? Exchange your hard-earned points! <br/>
                        <strong className="text-indigo-600 bg-white/50 px-2 py-1 rounded text-xs">10 Points = 2 Premium Hints</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-yellow-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-shopping-cart text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-black text-slate-800 mb-1">Purchase Hint Packs</span>
                      <span className="text-xs text-slate-600 leading-relaxed">
                        Support the game and get massive hint packs! Available through secure payment options.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Tips */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-100">
              <h5 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-2">
                <i className="fas fa-gamepad text-purple-500"></i> Controls & Tips
              </h5>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <i className="fas fa-hand-pointer text-purple-500 mt-1"></i>
                  <span><strong>Tap/Click:</strong> Find puppies by tapping on them</span>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-compress-alt text-purple-500 mt-1"></i>
                  <span><strong>Pinch/Zoom:</strong> Pinch on mobile or Ctrl+Scroll on desktop to zoom in/out</span>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-arrows-alt text-purple-500 mt-1"></i>
                  <span><strong>Pan:</strong> Drag to move around the large image - explore every corner!</span>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
                  <span><strong>Hints:</strong> Tap the lightbulb button to reveal 1-2 puppies</span>
                </div>
              <div className="flex items-start gap-2">
                <i className="fas fa-heart text-red-500 mt-1"></i>
                <span><strong>Lifes:</strong> Watch the top-left - you have 3 lifes before game over! Wrong taps show a red ❌ mark.</span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fas fa-music text-purple-500 mt-1"></i>
                <span><strong>Audio:</strong> Toggle background music and sound effects from the music icon in the header!</span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fas fa-user-friends text-blue-500 mt-1"></i>
                <span><strong>Refer Friends:</strong> Share your referral code - both you and your friend get 25 bonus hints!</span>
              </div>
              </div>
            </div>
          </div>

          {/* Progression & Features */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border-2 border-indigo-100">
            <h5 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-2">
              <i className="fas fa-chart-line text-indigo-500"></i> Progression & Features
            </h5>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <i className="fas fa-layer-group text-indigo-500 mt-1"></i>
                <span><strong>100 Levels:</strong> Progress through 100 unique levels, each with beautifully crafted scenes!</span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fas fa-palette text-indigo-500 mt-1"></i>
                <span><strong>Multiple Themes:</strong> Choose from various beautiful themes to customize your experience</span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fas fa-star text-yellow-500 mt-1"></i>
                <span><strong>Points System:</strong> Earn points by completing levels - use them to buy hints!</span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fas fa-users text-indigo-500 mt-1"></i>
                <span><strong>Refer Friends:</strong> Share your referral code and both of you get 25 bonus hints!</span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fas fa-trophy text-yellow-500 mt-1"></i>
                <span><strong>Track Progress:</strong> See your cleared levels and unlock new difficulties as you progress</span>
              </div>
            </div>
          </div>

          {/* Advanced Strategies Section */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-5 border-2 border-emerald-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-300/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <i className="fas fa-brain text-white text-xl"></i>
                </div>
                <h4 className="text-lg font-black text-slate-800">🧠 Advanced Strategies</h4>
              </div>
              <div className="space-y-3">
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 shadow-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🔍</span>
                    <div className="flex-1">
                      <span className="block text-sm font-black text-slate-800 mb-1">Systematic Search Pattern</span>
                      <span className="text-xs text-slate-600 leading-relaxed">
                        Start from one corner and work your way across the image in a grid pattern. This ensures you don't miss any areas!
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 shadow-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🔎</span>
                    <div className="flex-1">
                      <span className="block text-sm font-black text-slate-800 mb-1">Zoom Strategy</span>
                      <span className="text-xs text-slate-600 leading-relaxed">
                        Zoom in to check small details, then zoom out to see the bigger picture. Puppies can be hiding in textures, shadows, or blending with similar colors!
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 shadow-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <div className="flex-1">
                      <span className="block text-sm font-black text-slate-800 mb-1">Smart Hint Usage</span>
                      <span className="text-xs text-slate-600 leading-relaxed">
                        Save your hints for when you're stuck! Use them after finding most puppies naturally - they'll help you locate the trickiest ones!
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 shadow-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⏱️</span>
                    <div className="flex-1">
                      <span className="block text-sm font-black text-slate-800 mb-1">Time Management</span>
                      <span className="text-xs text-slate-600 leading-relaxed">
                        In Medium and Hard modes, don't spend too long on one area. If you can't find a puppy, move on and come back later!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Points & Rewards System */}
          <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-yellow-300 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full -ml-12 -mt-12"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <i className="fas fa-coins text-white text-xl"></i>
                </div>
                <h4 className="text-lg font-black text-slate-800">💰 Points & Rewards System</h4>
              </div>
              <div className="space-y-3">
                <div className="bg-white/90 p-3 rounded-xl border border-yellow-300 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-slate-800">🎯 Earning Points</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Easy!</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Complete levels to earn points! <strong className="text-emerald-600">Easy: +5 pts</strong>, <strong className="text-blue-600">Medium: +10 pts</strong>, <strong className="text-rose-600">Hard: +15 pts</strong> per level!
                  </p>
                </div>
                <div className="bg-white/90 p-3 rounded-xl border border-yellow-300 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-slate-800">🛒 Spending Points</span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Worth It!</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Use points to buy hints! <strong className="text-indigo-600">10 points = 2 premium hints</strong>. Perfect for those challenging levels!
                  </p>
                </div>
                <div className="bg-white/90 p-3 rounded-xl border border-yellow-300 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-slate-800">🏆 Leaderboard</span>
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">Compete!</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your total points determine your rank! Climb the leaderboard by completing more levels and earning more points!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Check-In Feature */}
          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-2xl p-5 border-2 border-white/30 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <span className="text-2xl">🐕</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-black text-white mb-1">📅 Daily Check-In</h4>
                  <p className="text-white/90 text-xs font-medium">Feed Your Puppy Daily!</p>
                </div>
              </div>
              <p className="text-white/95 text-sm mb-4 leading-relaxed font-medium">
                Visit every day to <strong className="text-yellow-200">feed your virtual puppy</strong>! Watch it grow from Day 1 to Day 7, and earn amazing rewards for maintaining your streak! 🎁
              </p>
              <div className="mb-4 space-y-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="flex items-center gap-2 text-white text-xs font-semibold">
                    <span className="text-yellow-300">⭐</span>
                    <span><strong>Daily Reward:</strong> Earn 5 points every day you check in!</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="flex items-center gap-2 text-white text-xs font-semibold">
                    <span className="text-yellow-300">🔥</span>
                    <span><strong>7-Day Streak:</strong> Get 10 bonus hints when you complete a week!</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="flex items-center gap-2 text-white text-xs font-semibold">
                    <span className="text-yellow-300">🎉</span>
                    <span><strong>30-Day Streak:</strong> Unlock 50 bonus points milestone reward!</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="flex items-center gap-2 text-white text-xs font-semibold">
                    <span className="text-yellow-300">👑</span>
                    <span><strong>1-Year Streak:</strong> Ultimate reward - 1000 hints added to your account!</span>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-400 text-pink-900 px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center justify-center gap-1.5 mt-3">
                <span>💎</span>
                <span>Don't Miss a Day - Build Your Streak!</span>
              </div>
            </div>
          </div>

          {/* Themes & Customization */}
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-5 border-2 border-purple-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-300/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <i className="fas fa-palette text-white text-xl"></i>
                </div>
                <h4 className="text-lg font-black text-slate-800">🎨 Themes & Customization</h4>
              </div>
              <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                Personalize your gaming experience with <strong className="text-purple-600">beautiful themes</strong>! Each theme transforms the entire game interface with unique colors, backgrounds, and styles!
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/80 p-2 rounded-lg border border-purple-200">
                  <span className="font-bold text-purple-600">🌞 Sunny Day</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-purple-200">
                  <span className="font-bold text-indigo-600">🌙 Starry Night</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-purple-200">
                  <span className="font-bold text-pink-600">🍬 Candy Land</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-purple-200">
                  <span className="font-bold text-green-600">🌲 Forest</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-purple-200">
                  <span className="font-bold text-cyan-600">🌌 Cosmic</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-purple-200">
                  <span className="font-bold text-orange-600">🦁 Safari</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-3 italic">
                💡 Tip: Change themes anytime from the settings menu to match your mood!
              </p>
            </div>
          </div>

          {/* Pro Tip - Enhanced */}
          <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-xl p-4 text-white shadow-lg border-2 border-amber-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="relative z-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-star text-xl"></i>
                </div>
                <div>
                  <h5 className="font-black text-white mb-2 text-sm flex items-center gap-2">
                    <span>🌟</span>
                    <span>Pro Tips from the Experts!</span>
                  </h5>
                  <div className="space-y-2 text-xs text-white/95 leading-relaxed">
                    <p>
                      <strong>🔍 Look for patterns:</strong> Puppies often hide near similar objects or in groups. If you find one, check nearby!
                    </p>
                    <p>
                      <strong>🎨 Color clues:</strong> Puppies blend with backgrounds, but their shapes are still visible. Look for outlines and shadows!
                    </p>
                    <p>
                      <strong>⏰ Time pressure:</strong> In timed modes, don't panic! Stay calm and methodical - rushing leads to mistakes!
                    </p>
                    <p>
                      <strong>💪 Practice makes perfect:</strong> Start with Easy mode to learn the game, then challenge yourself with harder difficulties!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {/* Copyright Footer */}
          <div className="pt-2 text-center">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider opacity-60">
              © 2025-2026 MVTechnology
            </p>
            <p className="text-[9px] text-slate-400 mt-1 opacity-50">
              Made with ❤️ for puppy lovers everywhere
            </p>
          </div>
          
          {/* Privacy Policy Link */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-slate-600">
                <i className="fas fa-shield-alt text-indigo-500"></i>
                <span className="text-sm font-bold">Privacy & Legal</span>
              </div>
              <a
                href="/privacy-policy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 border border-indigo-200 shadow-sm"
              >
                <i className="fas fa-file-contract text-xs"></i>
                <span>Privacy Policy</span>
                <i className="fas fa-external-link-alt text-[10px]"></i>
              </a>
              <p className="text-[10px] text-slate-500 text-center max-w-xs">
                COPPA Compliant • GDPR & CCPA Compliant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
