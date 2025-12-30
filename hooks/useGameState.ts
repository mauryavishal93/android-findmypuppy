import { useState, useCallback } from 'react';
import { Difficulty, Puppy } from '../types';
import { generateLevelTheme, generateLevelImage } from '../services/geminiService';
import { PUPPY_IMAGES } from '../constants/puppyImages';

interface GameState {
  puppies: Puppy[];
  bgImage: string | null;
  loading: boolean;
  levelTheme: string;
}

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    puppies: [],
    bgImage: null,
    loading: false,
    levelTheme: '',
  });

  const initLevel = useCallback(async (level: number, diff: Difficulty) => {
    setGameState(prev => ({ ...prev, loading: true, bgImage: null, puppies: [], levelTheme: '' }));
    
    // Difficulty Progression Logic (Harder every 5 levels)
    const progressionStep = Math.floor((level - 1) / 5);
    
    let puppyCount = 15;
    let baseOpacity = 0.5; 
    let minScale = 0.3; 
    let maxScale = 0.5; 
    
    if (diff === Difficulty.EASY) {
        // Easy: 15 -> 25 puppies, Opacity 0.6 -> 0.4
        puppyCount = Math.min(25, 15 + Math.floor(progressionStep / 2)); 
        baseOpacity = Math.max(0.4, 0.6 - (progressionStep * 0.01));
    } else if (diff === Difficulty.MEDIUM) {
        // Medium: 25 -> 35 puppies, Opacity 0.4 -> 0.25, Scale reduces
        puppyCount = Math.min(35, 25 + Math.floor(progressionStep / 2));
        baseOpacity = Math.max(0.25, 0.4 - (progressionStep * 0.01));
        minScale = Math.max(0.15, 0.25 - (progressionStep * 0.005));
        maxScale = Math.max(0.3, 0.4 - (progressionStep * 0.005));
    } else if (diff === Difficulty.HARD) {
        // Hard: 40 -> 50 puppies, Opacity 0.3 -> 0.15, Scale reduces
        puppyCount = Math.min(50, 40 + Math.floor(progressionStep / 2));
        baseOpacity = Math.max(0.15, 0.3 - (progressionStep * 0.01));
        minScale = Math.max(0.12, 0.2 - (progressionStep * 0.004)); 
        maxScale = Math.max(0.25, 0.35 - (progressionStep * 0.005));
    }

    // Get the textual theme for this level
    const theme = await generateLevelTheme(level, diff);
    
    // Generate the image on the fly using Gemini
    const bgImage = await generateLevelImage(theme, level);

    const newPuppies: Puppy[] = [];
    let safetyCounter = 0; // Prevent infinite loops
    while (newPuppies.length < puppyCount && safetyCounter < 1000) {
      safetyCounter++;
      const scale = minScale + (Math.random() * (maxScale - minScale));
      // Added margin to ensure puppies are fully inside the image boundaries
      const margin = 5;
      const x = margin + Math.random() * (100 - (margin * 2));
      const y = margin + Math.random() * (100 - (margin * 2));
      
      let overlaps = false;
      for (const p of newPuppies) {
        const dx = x - p.x;
        const dy = y - p.y;
        if (Math.sqrt(dx*dx + dy*dy) < 6) { // Distance check
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        newPuppies.push({
          id: `pup-${newPuppies.length}-${Date.now()}-${Math.random()}`,
          x,
          y,
          rotation: Math.random() * 360,
          scale,
          isFound: false,
          opacity: Math.max(0.15, baseOpacity - (Math.random() * 0.1)), 
          hueRotate: Math.random() * 360, 
          imageUrl: PUPPY_IMAGES[Math.floor(Math.random() * PUPPY_IMAGES.length)],
        });
      }
    }

    setGameState({
      loading: false,
      bgImage,
      puppies: newPuppies,
      levelTheme: theme,
    });

    // Calculate time limit based on difficulty
    let calculatedTimeLimit: number | null = null;
    if (diff === Difficulty.MEDIUM) {
      calculatedTimeLimit = Math.max(120, 150 - (progressionStep * 2));
    } else if (diff === Difficulty.HARD) {
      calculatedTimeLimit = Math.max(150, 180 - (progressionStep * 2));
    }

    return { timeLimit: calculatedTimeLimit };
  }, []);

  const updatePuppy = useCallback((id: string, updates: Partial<Puppy>) => {
    setGameState(prev => ({
      ...prev,
      puppies: prev.puppies.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, []);

  return {
    gameState,
    initLevel,
    updatePuppy,
    setGameState
  };
};

