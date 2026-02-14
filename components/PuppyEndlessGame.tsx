import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ThemeConfig } from '../types';
import { triggerHaptic, HAPTIC_PATTERNS } from '../utils/haptics';

// --- Game Constants ---
// Physics and gameplay tuning variables
const GROUND_Y = 0.82; // Ground level (percentage of canvas height)
const FLOOR_PUPPY = GROUND_Y - 0.12; // Y position for puppy when running
const FLOOR_PUPPY_DUCK = GROUND_Y - 0.06; // Y position for puppy when ducking
const PUPPY_WIDTH = 0.08; // Width relative to canvas width
const PUPPY_HEIGHT_RUN = 0.12; // Height when running
const PUPPY_HEIGHT_DUCK = 0.06; // Height when ducking
const GRAVITY = 0.0018; // Downward acceleration per frame
const JUMP_VELOCITY = -0.035; // Initial upward speed for jump
const SCROLL_SPEED_INITIAL = 0.005;
const SCROLL_SPEED_INCREMENT = 0.0003; // Increase per difficulty level
const OBSTACLE_MIN_GAP_INITIAL = 0.4;
const OBSTACLE_MAX_GAP_INITIAL = 0.6;
const HURDLE_WIDTH = 0.06;
const HURDLE_HEIGHT = 0.14;
const DUCK_OBSTACLE_WIDTH = 0.18;
const DUCK_OBSTACLE_HEIGHT = 0.07;
const DUCK_OBSTACLE_TOP = 0.68; // Y position for flying obstacles

// --- Types ---
type ObstacleType = 'hurdle' | 'duck';

interface Obstacle {
  x: number; // X position (relative to scroll)
  type: ObstacleType;
  width: number;
  height: number;
  topY: number;
}

interface PuppyEndlessGameProps {
  onComplete: (gameId: string, score: number) => Promise<{ success: boolean; hintsEarned?: number; totalHints?: number; highScore?: number }>;
  onClose: () => void;
  activeTheme: ThemeConfig;
  username?: string | null;
  highScore?: number;
}

/**
 * Puppy Jump - An endless runner game inspired by Chrome's Dino game.
 * 
 * Features:
 * - Jump (Space/Tap) and Duck (Down Arrow) mechanics
 * - Obstacle generation (ground hurdles and flying birds/bars)
 * - Score tracking and High Score persistence (localStorage)
 * - Progressive difficulty (speed is constant but obstacles vary)
 */
export const PuppyEndlessGame: React.FC<PuppyEndlessGameProps> = ({
  onComplete,
  onClose,
  activeTheme,
  highScore: initialHighScoreProp = 0
}) => {
  // --- Refs & State ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jumpRequestedRef = useRef(false); // Track jump input between frames
  
  // Game state management
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(initialHighScoreProp);
  const [showReward, setShowReward] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const highScoreRef = useRef(highScore);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);
  
  // Unique ID for daily reward tracking
  const gameId = `endless-${new Date().toISOString().slice(0, 10)}`;

  // Load high score from local storage on mount, but respect prop if higher
  useEffect(() => {
    const saved = localStorage.getItem('puppyJump_highScore');
    let localHigh = 0;
    if (saved) localHigh = parseInt(saved, 10);
    
    // Use the maximum of local storage and prop (DB)
    setHighScore(Math.max(localHigh, initialHighScoreProp));
  }, [initialHighScoreProp]);

  // --- Game Loop ---
  const runGameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game variables (reset on start)
    let animationId: number;
    let puppyY = FLOOR_PUPPY;
    let puppyX = 0.15; // Horizontal position (relative to width)
    let puppyVy = 0; // Vertical velocity
    let isDucking = false;
    let obstacles: Obstacle[] = [];
    let lastObstacleX = 1.2; // Start spawning obstacles off-screen
    let scrollX = 0; // Global scroll position
    let frameCount = 0;
    let currentSpeed = SCROLL_SPEED_INITIAL;

    const width = canvas.width;
    const height = canvas.height;

    // --- Drawing Functions ---

    // Draw the ground line
    const drawGround = () => {
      ctx.fillStyle = '#8B7355'; // Brown earth
      ctx.fillRect(0, height * GROUND_Y, width, height * (1 - GROUND_Y));
      ctx.strokeStyle = '#5D4E37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height * GROUND_Y);
      ctx.lineTo(width, height * GROUND_Y);
      ctx.stroke();
    };

    // Draw the puppy character with simple animation
    const drawPuppy = () => {
      const py = puppyY * height;
      const h = (isDucking ? PUPPY_HEIGHT_DUCK : PUPPY_HEIGHT_RUN) * height;
      const w = PUPPY_WIDTH * width;
      const px = width * puppyX; // Dynamic X position
      
      // Animation state
      const legCycle = Math.floor(frameCount / 6) % 2;
      const bounce = (isDucking ? 0 : (Math.floor(frameCount / 4) % 2 === 0 ? 0 : 2));
      const drawY = py + h - bounce;

      ctx.save();
      // Draw Emoji
      ctx.font = `${Math.round(h)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      
      // Flip emoji horizontally to face right
      ctx.translate(px + w / 2, drawY);
      ctx.scale(-1, 1); 
      ctx.translate(-(px + w / 2), -drawY);
      
      ctx.fillText('🐕', px + w / 2, drawY);
      ctx.restore();

      // Draw running legs (only when on ground and not ducking)
      if (!isDucking && puppyY >= FLOOR_PUPPY - 0.005) {
        ctx.strokeStyle = '#5D4E37';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        const legY = (puppyY + PUPPY_HEIGHT_RUN) * height - 2;
        const legW = w * 0.35;
        const legH = 6;
        
        // Alternate legs
        if (legCycle === 0) {
          ctx.beginPath();
          ctx.moveTo(px + w * 0.25, legY);
          ctx.lineTo(px + w * 0.25 - legW, legY + legH);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(px + w * 0.75, legY);
          ctx.lineTo(px + w * 0.75 + legW, legY + legH);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(px + w * 0.25, legY);
          ctx.lineTo(px + w * 0.25 + legW, legY + legH);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(px + w * 0.75, legY);
          ctx.lineTo(px + w * 0.75 - legW, legY + legH);
          ctx.stroke();
        }
      }
    };

    // Draw all active obstacles
    const drawObstacles = () => {
      obstacles.forEach((obs) => {
        const x = (obs.x - scrollX) * width;
        
        // Skip if off-screen
        if (x + obs.width * width < -50) return;
        
        const y = height * obs.topY;
        const w = obs.width * width;
        const h = obs.height * height;

        // Color based on type
        ctx.fillStyle = obs.type === 'hurdle' ? '#4A90D9' : '#E67E22';
        ctx.fillRect(x, y, w, h);
        
        // Border
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        
        // Icon/Text decoration
        if (obs.type === 'hurdle') {
          ctx.font = '20px Arial';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🪨', x + w / 2, y + h / 2 + 2);
        } else {
          ctx.font = '18px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⬇️', x + w / 2, y + h / 2 + 2);
        }
      });
    };

    // --- Logic Functions ---

    // Check for AABB collision between puppy and obstacles
    const checkCollision = (): boolean => {
      const px = puppyX * width;
      const py = puppyY * height;
      const pw = PUPPY_WIDTH * width;
      const ph = (isDucking ? PUPPY_HEIGHT_DUCK : PUPPY_HEIGHT_RUN) * height;
      const margin = 6; // Hitbox forgiveness

      for (const obs of obstacles) {
        const ox = (obs.x - scrollX) * width;
        
        // Quick X-axis check
        if (ox + obs.width * width < px + margin) continue;
        if (ox > px + pw - margin) continue;
        
        const oy = height * obs.topY;
        const ow = obs.width * width;
        const oh = obs.height * height;
        
        // Detailed intersection check
        if (py + ph - margin > oy && py + margin < oy + oh &&
            px + pw - margin > ox && px + margin < ox + ow) {
          return true;
        }
      }
      return false;
    };

    // Main update loop
    const gameLoop = () => {
      if (gameState !== 'playing') return;

      frameCount++;
      
      // Difficulty progression: Increase speed every 200 points
      const currentScore = Math.floor(scrollX * 100);
      const difficultyLevel = Math.floor(currentScore / 200);
      currentSpeed = SCROLL_SPEED_INITIAL + (difficultyLevel * SCROLL_SPEED_INCREMENT);
      
      // Cap max speed to keep it playable
      if (currentSpeed > 0.012) currentSpeed = 0.012;

      scrollX += currentSpeed;
      
      setScore(currentScore);

      // --- Physics ---
      // Jump logic
      if (jumpRequestedRef.current && puppyY >= FLOOR_PUPPY - 0.002 && !isDucking) {
        puppyVy = JUMP_VELOCITY;
        jumpRequestedRef.current = false;
        triggerHaptic('JUMP');
      }
      
      // Gravity & Ducking
      if (isDucking) {
        // Check if on/near ground (transition to slide)
        if (puppyY >= FLOOR_PUPPY - 0.02) {
          puppyY = FLOOR_PUPPY_DUCK;
          puppyVy = 0;
        } else {
          // In air: Fast Dive (Gravity assist)
          puppyVy += GRAVITY * 3.5; 
          puppyY += puppyVy;
          
          // Maintain forward momentum during dive
          if (puppyY < FLOOR_PUPPY_DUCK) {
             if (puppyX < 0.4) puppyX += 0.0004;
          }

          // Floor collision during dive
          if (puppyY >= FLOOR_PUPPY_DUCK) {
             puppyY = FLOOR_PUPPY_DUCK;
             puppyVy = 0;
          }
        }
      } else {
        puppyVy += GRAVITY;
        puppyY += puppyVy;
        
        // Move forward while in air (jump arc)
        // Always add positive X momentum when in air
        if (puppyY < FLOOR_PUPPY) {
             puppyX += 0.0004; // Constant forward speed in air
             // Cap max forward position
             if (puppyX > 0.4) puppyX = 0.4;
        }

        // Floor collision
        if (puppyY >= FLOOR_PUPPY) {
          puppyY = FLOOR_PUPPY;
          puppyVy = 0;
        }
      }

      // Ground Logic: Drift back to start position
      if (puppyY >= FLOOR_PUPPY && !isDucking) {
        if (puppyX > 0.15) {
             puppyX -= 0.001; // Drift back speed
             if (puppyX < 0.15) puppyX = 0.15;
        }
      }

      // --- Obstacle Spawning ---
      while (lastObstacleX - scrollX < OBSTACLE_MAX_GAP_INITIAL) {
        // Adjust gap based on difficulty? 
        // Actually, wider gaps are needed at higher speeds to react, but the game naturally gets harder with speed.
        // We'll stick to initial gap logic but maybe slightly wider range.
        const gap = OBSTACLE_MIN_GAP_INITIAL + Math.random() * (OBSTACLE_MAX_GAP_INITIAL - OBSTACLE_MIN_GAP_INITIAL);
        lastObstacleX += gap;
        
        const type: ObstacleType = Math.random() < 0.5 ? 'hurdle' : 'duck';
        const heightVal = type === 'hurdle' ? HURDLE_HEIGHT : DUCK_OBSTACLE_HEIGHT;
        const topY = type === 'hurdle' ? GROUND_Y - heightVal : DUCK_OBSTACLE_TOP;
        
        obstacles.push({
          x: lastObstacleX,
          type,
          width: type === 'hurdle' ? HURDLE_WIDTH : DUCK_OBSTACLE_WIDTH,
          height: heightVal,
          topY
        });
      }

      // Cleanup off-screen obstacles
      obstacles = obstacles.filter((o) => o.x - scrollX > -0.1);

      // --- Collision & Game Over ---
      if (checkCollision()) {
        setGameState('gameover');
        setShowReward(true);
        triggerHaptic('ERROR');
        
        // Update High Score
        if (currentScore > highScoreRef.current) {
          setHighScore(currentScore);
          highScoreRef.current = currentScore;
          localStorage.setItem('puppyJump_highScore', currentScore.toString());
        }
        return;
      }

      // --- Render Frame ---
      ctx.fillStyle = '#87CEEB'; // Sky blue
      ctx.fillRect(0, 0, width, height);
      drawGround();
      drawObstacles();
      drawPuppy();

      animationId = requestAnimationFrame(gameLoop);
    };

    // --- Input Handling ---
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        // Allow jump only if near ground
        if (puppyY >= FLOOR_PUPPY - 0.001) {
          jumpRequestedRef.current = true;
        }
      }
      if (e.code === 'ArrowDown' || e.key === 'ArrowDown') {
        e.preventDefault();
        isDucking = true;
        triggerHaptic('LIGHT');
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.key === 'ArrowDown') {
        isDucking = false;
      }
    };
    
    // Touch Logic
    const handleTouchStart = (e: TouchEvent) => {
      if (gameState !== 'playing') return;
      // Prevent default to stop scrolling
      e.preventDefault(); 
      
      const touchY = e.touches[0].clientY;
      touchStartRef.current = touchY;
      
      // Assume Jump on start (tap behavior)
      if (puppyY >= FLOOR_PUPPY - 0.001) {
         jumpRequestedRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gameState !== 'playing' || touchStartRef.current === null) return;
      e.preventDefault(); // Prevent scrolling while swiping
      
      const touchY = e.touches[0].clientY;
      const diffY = touchY - touchStartRef.current;
      
      // Swipe Down Detection (positive Y diff)
      if (diffY > 30) { // Threshold for swipe down
        isDucking = true;
        // Don't repeatedly trigger haptic
      } else {
        isDucking = false;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchStartRef.current = null;
      isDucking = false; // Stop ducking on release
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Start loop
    setGameState('playing');
    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState]); // Re-run if gameState changes

  // Trigger game loop when state becomes 'playing'
  useEffect(() => {
    if (gameState === 'playing') {
      const cleanup = runGameLoop();
      return () => { cleanup?.(); };
    }
  }, [gameState, runGameLoop]);

  // --- Actions ---
  const handleStart = () => {
    setScore(0);
    setShowReward(false);
    setGameState('playing');
  };

  const handleClaimReward = async () => {
    const res = await onComplete(gameId, score);
    if (res.success) {
      // Update local high score if DB reports a higher one (sync)
      if (res.highScore && res.highScore > highScore) {
        setHighScore(res.highScore);
        localStorage.setItem('puppyJump_highScore', res.highScore.toString());
      }
      setShowReward(false);
      setTimeout(() => onClose(), 800);
    }
  };

  const handleClose = () => {
    setGameState('ready');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`${activeTheme.cardBg} ${activeTheme.text} rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-400/50 w-full max-w-md`}>
        {/* Header */}
        <div className="p-4 border-b border-white/20 flex justify-between items-center">
          <h2 className="text-xl font-black flex items-center gap-2">
            <span>🐕</span> Puppy Jump
          </h2>
          <button
            onClick={handleClose}
            className={`w-10 h-10 rounded-full ${activeTheme.iconBg} flex items-center justify-center hover:scale-110`}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Instructions */}
        <p className={`text-xs px-4 py-2 ${activeTheme.subText}`}>
          <strong>Space / Up</strong> = Jump · <strong>Down</strong> = Duck
        </p>

        {/* Game Canvas Container */}
        <div className="relative bg-sky-200 rounded-lg overflow-hidden mx-4 mb-4" style={{ touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full h-auto block cursor-pointer"
            style={{ maxHeight: '50vh' }}
            onClick={() => {
              if (gameState === 'ready') handleStart();
              else if (gameState === 'playing') jumpRequestedRef.current = true;
            }}
          />
          
          {/* Start Screen Overlay */}
          {gameState === 'ready' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
              <p className="text-white font-bold text-lg mb-2">Tap to Start!</p>
              <p className="text-white/90 text-sm">Jump 🪨 Duck ⬇️</p>
              {highScore > 0 && (
                <p className="text-yellow-300 text-xs font-bold mt-2">Best: {highScore}</p>
              )}
            </div>
          )}
          
          {/* In-Game Score */}
          {gameState === 'playing' && (
            <div className="absolute top-2 right-2 flex flex-col items-end">
              <div className="bg-black/50 text-white px-2 py-1 rounded font-mono text-sm font-bold">
                {score.toString().padStart(5, '0')}
              </div>
              {highScore > 0 && (
                <div className="text-black/50 text-[10px] font-bold mt-1">
                  HI {highScore.toString().padStart(5, '0')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 rounded-lg mx-4 my-4 min-h-[200px]">
            <div className={`${activeTheme.cardBg} ${activeTheme.text} rounded-xl p-6 text-center shadow-xl border-2 border-amber-400 max-w-[90%] mx-4`}>
              <p className="text-3xl mb-2">😅</p>
              <p className="text-xl font-black mb-1">Game Over!</p>
              
              <div className="flex justify-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-xs uppercase opacity-70 font-bold">Score</p>
                  <p className="text-xl font-black">{score}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase opacity-70 font-bold">Best</p>
                  <p className="text-xl font-black text-amber-500">{highScore}</p>
                </div>
              </div>

              {/* Reward Section (Only if daily reward is available) */}
              {showReward && (
                <div className="mb-4 bg-green-100 p-2 rounded-lg border border-green-300">
                  <p className="text-green-800 text-xs font-bold mb-1">Daily Bonus Unlocked!</p>
                  <button
                    onClick={handleClaimReward}
                    className="w-full px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 shadow-sm"
                  >
                    {score >= 1001 ? 'Claim +5 Hints' : score >= 501 ? 'Claim +2 Hints' : score >= 1 ? 'Claim +1 Hint' : 'Finish (No Reward)'}
                  </button>
                </div>
              )}

              <div className="flex gap-2 justify-center">
                {/* Play Again button removed as per requirement */}
              </div>
            </div>
          </div>
        )}

        {/* Ready State Footer */}
        {gameState === 'ready' && (
          <div className="px-4 pb-4">
            <button
              onClick={handleStart}
              className={`w-full py-3 rounded-xl font-bold ${activeTheme.button} ${activeTheme.text}`}
            >
              Start Run
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
