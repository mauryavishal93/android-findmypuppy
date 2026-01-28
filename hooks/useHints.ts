import { useState, useCallback } from 'react';
import { UserProgress } from '../types';
import { db } from '../services/db';

interface UseHintsProps {
  progress: UserProgress;
  setProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
  playSfx: (type: 'hint') => void;
  onOutOfHints: () => void;
}

export const useHints = ({ progress, setProgress, playSfx, onOutOfHints }: UseHintsProps) => {
  const [hintsUsedInLevel, setHintsUsedInLevel] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const activateHint = useCallback(() => {
     playSfx('hint');
     setShowHints(true);
     // Hide hints after 3 seconds
     setTimeout(() => setShowHints(false), 3000);
  }, [playSfx]);

  const handleUseHint = useCallback(() => {
    if (showHints) return; // Already showing
    
    // HINT PRIORITY SEQUENCE:
    // 1. Free Hints (2 per game) - Use first
    // 2. Total Hints (premium hints from shop) - Use last
    
    const freeHintsRemaining = Math.max(0, 2 - hintsUsedInLevel);
    const totalHints = (progress.premiumHints ?? 0);
    
    // Debug: Log available hints
    console.log('[HINTS USE] Available - Free:', freeHintsRemaining, 'Total:', totalHints);
    
    // STEP 1: Check Free Hints first
    if (freeHintsRemaining > 0) {
      const newFreeCount = freeHintsRemaining - 1;
      console.log('[HINTS] Using free hint. Badge will show:', newFreeCount > 0 ? `${newFreeCount} free` : 'total hint count');
      setHintsUsedInLevel(prev => prev + 1);
      activateHint();
      return; // Exit early after using free hint
    } 
    
    // STEP 2: Check Total Hints (premium hints from shop) - only after free hints are exhausted
    if (totalHints > 0) {
      console.log('[HINTS] Using total/premium hint. Before:', totalHints, 'After:', totalHints - 1);
      
      // Update progress state immediately
      setProgress(prev => {
        const currentHints = prev.premiumHints ?? 0;
        const updatedHints = Math.max(0, currentHints - 1);
        
        // Sync hints to database if user is logged in
        if (prev.playerName) {
          db.updateHints(prev.playerName, updatedHints)
            .then(response => {
              if (response.success) {
                console.log('[HINTS] ✅ Database updated: hints =', updatedHints);
              } else {
                console.error('[HINTS] ❌ Database update failed:', response.message);
              }
            })
            .catch(err => {
              console.error('[HINTS] ❌ Failed to update hints in database:', err);
            });
        }
        
        console.log('[HINTS] Updated premiumHints from', currentHints, 'to', updatedHints);
        return {...prev, premiumHints: updatedHints};
      });
      
      activateHint();
      return; // Exit early after using premium hint
    } 
    
    // Out of hints - all hint types exhausted
    console.log('[HINTS] All hints exhausted. Free:', freeHintsRemaining, 'Total:', totalHints);
    onOutOfHints();
  }, [showHints, hintsUsedInLevel, progress.premiumHints, progress.playerName, activateHint, setProgress, onOutOfHints]);

  const resetHints = useCallback(() => {
    setHintsUsedInLevel(0);
    setShowHints(false);
  }, []);

  // Calculate available hints for display
  const freeHintsRemaining = Math.max(0, 2 - hintsUsedInLevel);
  const totalHintsRemaining = progress.premiumHints ?? 0;
  
  // Determine which hint type is currently available (based on priority)
  let currentHintType: 'free' | 'total' | 'none' = 'none';
  let currentHintCount = 0;
  
  // Priority 1: Free hints (if available)
  if (freeHintsRemaining > 0) {
    currentHintType = 'free';
    currentHintCount = freeHintsRemaining;
    console.log('[HINTS BADGE] Showing FREE hints:', currentHintCount);
  } 
  // Priority 2: Total hints (only if free hints are exhausted)
  else if (totalHintsRemaining > 0) {
    currentHintType = 'total';
    currentHintCount = totalHintsRemaining;
    console.log('[HINTS BADGE] Showing TOTAL hints:', currentHintCount);
  }
  
  // Summary log for debugging
  console.log('[HINTS BADGE SUMMARY] Free:', freeHintsRemaining, '| Total:', totalHintsRemaining, '→ Badge:', currentHintType, '=', currentHintCount);

  return {
    hintsUsedInLevel,
    showHints,
    handleUseHint,
    resetHints,
    freeHintsRemaining,
    totalHintsRemaining,
    currentHintType,
    currentHintCount,
    hasHints: freeHintsRemaining > 0 || totalHintsRemaining > 0,
    hasPremiumHints: totalHintsRemaining > 0
  };
};
