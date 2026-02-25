import React, { useState } from 'react';
import { ThemeConfig } from '../types';

interface ExplorerGuideProps {
  activeTheme: ThemeConfig;
  onClose: () => void;
  onOpenPuppyDesigns?: () => void;
}

const GUIDE_STEPS = [
  {
    id: 1,
    title: "Welcome, Explorer! 🗺️",
    icon: "👋",
    content: "Welcome to the Explorer's Guide! This interactive tutorial will teach you everything you need to know about finding puppies. Let's get started!",
    tips: []
  },
  {
    id: 2,
    title: "Panning & Exploring 📱",
    icon: "👆",
    content: "The game images are MUCH larger than your screen! Drag your finger (mobile) or mouse (desktop) to pan around and explore every corner.",
    tips: [
      "💡 Tip: Puppies can hide in the corners!",
      "💡 Tip: Scroll slowly to spot hidden puppies",
      "💡 Tip: Check the edges of the image too"
    ]
  },
  {
    id: 3,
    title: "Zooming In & Out 🔍",
    icon: "🔎",
    content: "Pinch to zoom on mobile, or use Ctrl + Scroll on desktop. Zoom in to find tiny puppies, zoom out to see the bigger picture!",
    tips: [
      "💡 Tip: Hard mode puppies are TINY - zoom in!",
      "💡 Tip: Zoom out to plan your search strategy",
      "💡 Tip: Use zoom to verify if something is a puppy"
    ]
  },
  {
    id: 4,
    title: "Tapping to Find 🎯",
    icon: "👆",
    content: "Tap or click on any puppy you spot! Found puppies will bounce and celebrate. Wrong clicks show a red X - you have 3 lifes!",
    tips: [
      "💡 Tip: Look for shapes that don't match the background",
      "💡 Tip: Puppies use camouflage - look carefully!",
      "💡 Tip: Watch for movement or unusual patterns"
    ]
  },
  {
    id: 5,
    title: "Using Hints 💡",
    icon: "💡",
    content: "Stuck? Use the hint button! You get 2 FREE hints per level. Hints will highlight 1-2 puppies and scroll to show their location.",
    tips: [
      "💡 Tip: Save hints for the hardest puppies",
      "💡 Tip: Daily check-in gives you bonus hints!",
      "💡 Tip: You can buy more hints with points or money"
    ]
  },
  {
    id: 6,
    title: "Difficulty Modes 🎮",
    icon: "🎮",
    content: "Easy: No timer, 15-25 puppies, easier to spot. Medium: 150 seconds, 25-35 puppies. Hard: 180 seconds, 40-50 TINY puppies!",
    tips: [
      "💡 Tip: Start with Easy mode to learn",
      "💡 Tip: Medium mode adds time pressure",
      "💡 Tip: Hard mode is for experts - puppies are nearly invisible!"
    ]
  },
  {
    id: 7,
    title: "Pro Tips 🌟",
    icon: "⭐",
    content: "Master these advanced techniques to become a puppy-finding champion!",
    tips: [
      "🌟 Look for color mismatches - puppies blend but aren't perfect",
      "🌟 Check shadows and reflections - puppies cast them",
      "🌟 Use hints strategically - don't waste them early",
      "🌟 Zoom in on suspicious areas before tapping",
      "🌟 Pan systematically - don't miss any areas",
      "🌟 Watch your lifes - 3 wrong clicks = game over!"
    ]
  },
  {
    id: 8,
    title: "Puppy Designs to Find 🐾",
    icon: "🐾",
    content: "These are all the puppy designs hidden throughout the game! Each level features these unique puppies camouflaged in the scenes. Can you find them all?",
    tips: []
  }
];

export const ExplorerGuide: React.FC<ExplorerGuideProps> = ({ activeTheme, onClose, onOpenPuppyDesigns }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const currentGuide = GUIDE_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === GUIDE_STEPS.length - 1;

  const handleExplorerGuideLink = () => {
    window.open('https://findmypuppy.onrender.com/explorer-guide', '_blank', 'noopener,noreferrer');
  };

  const handleAllPuppyDesigns = () => {
    onClose();
    onOpenPuppyDesigns?.();
  };

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={`bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden border-4 border-white ${activeTheme.cardBg}`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-5 border-b-2 border-white/30`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <span className="text-2xl">{currentGuide.icon}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Explorer's Guide</h3>
                <p className="text-white/90 text-xs font-medium">Step {currentStep + 1} of {GUIDE_STEPS.length}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center transition-colors border border-white/30"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-yellow-300 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / GUIDE_STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto hide-scrollbar">
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h4 className="text-2xl font-black text-slate-800 mb-2">{currentGuide.title}</h4>
              <p className="text-slate-700 text-sm leading-relaxed">{currentGuide.content}</p>
            </div>

            {/* Tips Section */}
            {currentGuide.tips.length > 0 && (
              <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200`}>
                <h5 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <i className="fas fa-lightbulb text-yellow-500"></i>
                  <span>Tips & Tricks</span>
                </h5>
                <div className="space-y-2">
                  {currentGuide.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Guide for specific steps */}
            {currentStep === 1 && (
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-center justify-center gap-4 text-4xl mb-2">
                  <i className="fas fa-hand-pointer text-blue-500 animate-bounce"></i>
                  <span className="text-2xl">→</span>
                  <i className="fas fa-arrows-alt text-blue-500"></i>
                </div>
                <p className="text-xs text-center text-slate-600 font-medium">Drag to explore the entire image!</p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <div className="flex items-center justify-center gap-4 text-4xl mb-2">
                  <i className="fas fa-search-plus text-green-500"></i>
                  <span className="text-2xl">↔</span>
                  <i className="fas fa-search-minus text-green-500"></i>
                </div>
                <p className="text-xs text-center text-slate-600 font-medium">Pinch or Ctrl+Scroll to zoom!</p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-center justify-center gap-4 text-4xl mb-2">
                  <i className="fas fa-hand-pointer text-purple-500 animate-pulse"></i>
                  <span className="text-3xl">🐶</span>
                  <i className="fas fa-check-circle text-green-500"></i>
                </div>
                <p className="text-xs text-center text-slate-600 font-medium">Tap puppies to find them!</p>
              </div>
            )}

            {/* Step 8: Puppy Designs */}
            {currentStep === 7 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <p className="text-sm text-slate-700 mb-4 text-center">
                  Want to learn more? Check out the full Explorer's Guide page or view all puppy designs!
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleExplorerGuideLink}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-colors"
                  >
                    <i className="fas fa-book-open" aria-hidden />
                    Explorer Guide Page
                  </button>
                  {onOpenPuppyDesigns && (
                    <button
                      type="button"
                      onClick={handleAllPuppyDesigns}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md transition-colors"
                    >
                      <i className="fas fa-images" aria-hidden />
                      View All Puppy Designs
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="p-5 bg-slate-50 border-t-2 border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={isFirstStep}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              isFirstStep
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-600 text-white hover:bg-slate-700 active:scale-95'
            }`}
          >
            <i className="fas fa-chevron-left"></i>
            <span>Previous</span>
          </button>

          <div className="flex gap-1">
            {GUIDE_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep ? 'bg-indigo-500 w-6' : 'bg-slate-300'
                }`}
              ></div>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
          >
            <span>{isLastStep ? 'Finish' : 'Next'}</span>
            <i className={`fas ${isLastStep ? 'fa-check' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};
