import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../types';

interface PuppyFeedingProps {
  onFeed: () => Promise<{
    success: boolean;
    hintsEarned?: number;
    pointsEarned?: number;
    puppyAge?: number;
    puppySize?: number;
    milestone?: '7days' | '30days' | '1year' | null;
  }>;
  onClose: () => void;
  activeTheme: ThemeConfig;
  puppyAge: number;
  puppySize: number;
  streak: number;
}

export const PuppyFeeding: React.FC<PuppyFeedingProps> = ({
  onFeed,
  onClose,
  activeTheme,
  puppyAge,
  puppySize,
  streak
}) => {
  const [isFeeding, setIsFeeding] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [hintsEarned, setHintsEarned] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  const handleFeed = async () => {
    setIsFeeding(true);
    try {
      const result = await onFeed();
      if (result.success) {
        if (result.hintsEarned && result.hintsEarned > 0) {
          setHintsEarned(result.hintsEarned);
          setRewardMessage(`🎉 Amazing! You earned ${result.hintsEarned} hints!`);
        } else if (result.pointsEarned && result.pointsEarned > 0) {
          setPointsEarned(result.pointsEarned);
          setRewardMessage(`🎉 Amazing! You earned ${result.pointsEarned} points!`);
        } else {
          setRewardMessage('🐕 Puppy fed! Keep the streak going!');
        }
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setTimeout(() => {
            onClose();
          }, 500);
        }, 2500);
      }
    } catch (error) {
      console.error('Error feeding puppy:', error);
    } finally {
      setIsFeeding(false);
    }
  };

  // Calculate puppy emoji size based on age
  const getPuppyEmoji = () => {
    if (puppyAge >= 7) return '🐕'; // Adult
    if (puppyAge >= 5) return '🐶'; // Growing
    if (puppyAge >= 3) return '🐾'; // Young
    return '🐣'; // Baby
  };

  const puppyEmoji = getPuppyEmoji();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className={`relative w-full max-w-md ${activeTheme.cardBg} rounded-2xl p-6 border-4 ${activeTheme.accent} shadow-2xl`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${activeTheme.text}`}>
            🍖 Feed Your Puppy
          </h2>
          <button
            onClick={onClose}
            className={`px-3 py-1 ${activeTheme.button} rounded-lg font-bold ${activeTheme.text} hover:opacity-80 transition-opacity`}
          >
            ✕
          </button>
        </div>

        {/* Puppy Display */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div 
            className="text-8xl mb-4 transition-all duration-500"
            style={{
              transform: `scale(${puppySize})`,
              filter: `brightness(${1 + (puppyAge * 0.1)})`
            }}
          >
            {puppyEmoji}
          </div>
          <div className={`text-lg font-bold ${activeTheme.text} mb-2`}>
            Day {puppyAge} / 7
          </div>
          <div className={`text-sm ${activeTheme.subText}`}>
            Streak: {streak} days 🔥
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(puppyAge / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Info */}
        <div className={`mb-6 p-4 rounded-lg ${activeTheme.accent}/10`}>
          <p className={`text-sm ${activeTheme.subText} text-center mb-2`}>
            Feed your puppy every day to help it grow!
          </p>
          <div className={`text-xs ${activeTheme.subText} space-y-1`}>
            <div>• Day 1-7: Puppy grows in size and age</div>
            <div>• 7 days streak: 🎁 10 hints</div>
            <div>• 30 days streak: 🎁 50 points</div>
            <div>• 365 days streak: 🎁 1000 hints</div>
          </div>
        </div>

        {/* Feed Button */}
        <button
          onClick={handleFeed}
          disabled={isFeeding}
          className={`
            w-full py-4 rounded-xl font-bold text-lg transition-all duration-300
            ${isFeeding 
              ? 'opacity-50 cursor-wait' 
              : 'hover:scale-105 hover:shadow-2xl cursor-pointer'
            }
            ${activeTheme.button} ${activeTheme.text}
          `}
          style={{
            background: `linear-gradient(135deg, ${activeTheme.accent} 0%, ${activeTheme.button} 100%)`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
          }}
        >
          {isFeeding ? '⏳ Feeding...' : '🍖 Feed Puppy'}
        </button>

        {/* Reward Modal */}
        {showReward && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-2xl z-50">
            <div className={`${activeTheme.cardBg} rounded-2xl p-8 border-4 ${activeTheme.accent} shadow-2xl text-center max-w-sm`}>
              <div className="text-6xl mb-4 animate-bounce">
                {hintsEarned > 0 ? '🎁' : pointsEarned > 0 ? '💰' : '🐕'}
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${activeTheme.text}`}>
                {rewardMessage}
              </h3>
              {(hintsEarned > 0 || pointsEarned > 0) && (
                <p className={`text-lg ${activeTheme.subText}`}>
                  {hintsEarned > 0 && `+${hintsEarned} Hints`}
                  {hintsEarned > 0 && pointsEarned > 0 && ' & '}
                  {pointsEarned > 0 && `+${pointsEarned} Points`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
