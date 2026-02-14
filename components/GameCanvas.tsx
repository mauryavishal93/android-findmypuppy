import React, { useState, useEffect, useRef } from 'react';
import { Puppy, Difficulty } from '../types';

// Fallback BG with URL encoding to prevent CSS issues (replaces spaces with %20, etc)
const FALLBACK_BG = "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27800%27%20height%3D%27800%27%20viewBox%3D%270%200%20800%20800%27%3E%3Crect%20width%3D%27800%27%20height%3D%27800%27%20fill%3D%27%23e2e8f0%27%2F%3E%3Ccircle%20cx%3D%27400%27%20cy%3D%27400%27%20r%3D%27200%27%20fill%3D%27%23cbd5e1%27%20opacity%3D%270.5%27%2F%3E%3Ctext%20x%3D%2750%25%27%20y%3D%2745%25%27%20dominant-baseline%3D%27middle%27%20text-anchor%3D%27middle%27%20font-family%3D%27sans-serif%27%20font-size%3D%2748%27%20fill%3D%27%2364748b%27%20font-weight%3D%27bold%27%3EAdventure%20Awaits%3C%2Ftext%3E%3Ctext%20x%3D%2750%25%27%20y%3D%2755%25%27%20dominant-baseline%3D%27middle%27%20text-anchor%3D%27middle%27%20font-family%3D%27sans-serif%27%20font-size%3D%2724%27%20fill%3D%27%2394a3b8%27%3ECould%20not%20generate%20scene%3C%2Ftext%3E%3C%2Fsvg%3E";

interface GameCanvasProps {
  backgroundImage: string | null;
  puppies: Puppy[];
  onPuppyFound: (id: string) => void;
  isLoading: boolean;
  difficulty: Difficulty;
  showHints: boolean;
  onImageLoaded?: () => void;
  onWrongClick?: () => void;
}

// Base map size
const MAP_SIZE = 1600;

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  backgroundImage, 
  puppies, 
  onPuppyFound,
  isLoading,
  difficulty,
  showHints,
  onImageLoaded,
  onWrongClick
}) => {
  // Loading States: 'generating' (AI), 'loading' (Images), 'fading' (Transition), 'complete' (Game On)
  const [loadingState, setLoadingState] = useState<'generating' | 'loading' | 'fading' | 'complete'>('generating');
  const [progress, setProgress] = useState(0);
  const [loadError, setLoadError] = useState(false);
  
  const [zoom, setZoom] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Start with a very low min zoom to ensure we don't block zooming out before calculation
  const minZoomRef = useRef(0.1); 
  const prevShowHintsRef = useRef(showHints);
  // Track which specific puppies should be highlighted (1-2 max)
  const [highlightedPuppyIds, setHighlightedPuppyIds] = useState<Set<string>>(new Set());
  // Track if initial scroll position has been set
  const initialScrollSetRef = useRef(false);
  
  // Track wrong click positions to show cross icons
  const [wrongClicks, setWrongClicks] = useState<Array<{ id: string; x: number; y: number }>>([]);
  
  // Track the last loaded background to prevent re-triggering loading on game updates (like finding a puppy)
  const prevBgRef = useRef<string | null>(null);
  
  // Refs for pinch zoom state
  const touchState = useRef<{
    initialDistance: number;
    initialZoom: number;
    isPinching: boolean;
  }>({ initialDistance: 0, initialZoom: 1, isPinching: false });
  
  const zoomRef = useRef(zoom);

  // Sync zoom ref
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Loading Logic
  useEffect(() => {
    // 1. If AI is generating the world
    if (isLoading) {
      setLoadingState('generating');
      setProgress(5); // Start at small percentage
      setLoadError(false);
      prevBgRef.current = null; // Reset so next BG load triggers
      return;
    }

    // 2. If we have a background image, start loading assets
    // Only run this if the background image has effectively changed to prevent reloading when finding puppies
    if (backgroundImage && backgroundImage !== prevBgRef.current) {
      prevBgRef.current = backgroundImage;
      setLoadingState('loading');
      setProgress(10); // Jump a bit to show activity
      
      // Identify all unique assets to load (Background + Unique Puppies)
      const uniquePuppyUrls = Array.from(new Set(puppies.map(p => p.imageUrl)));
      const totalAssets = 1 + uniquePuppyUrls.length; // +1 for BG
      
      let loadedCount = 0;
      let mounted = true;
      let completeTimeoutId: ReturnType<typeof setTimeout> | null = null;

      const handleAssetLoad = (isError: boolean = false) => {
        if (!mounted) return;
        
        loadedCount++;
        const currentProgress = Math.round((loadedCount / totalAssets) * 100);
        setProgress(prev => Math.max(prev, currentProgress));

        if (isError && loadedCount === 1) setLoadError(true);

        if (loadedCount >= totalAssets && mounted) {
          setLoadingState('fading');
          completeTimeoutId = setTimeout(() => {
            if (mounted) {
              setLoadingState('complete');
              onImageLoaded?.();
            }
          }, 300);
        }
      };

      // Load background and puppies in parallel (no artificial delay)
      const bgImg = new Image();
      bgImg.src = backgroundImage;
      bgImg.onload = () => handleAssetLoad(false);
      bgImg.onerror = () => {
        console.error(`Failed to load background: ${backgroundImage}`);
        handleAssetLoad(true);
      };

      uniquePuppyUrls.forEach(url => {
        const img = new Image();
        img.src = url;
        img.onload = () => handleAssetLoad(false);
        img.onerror = () => handleAssetLoad(false);
      });

      return () => {
        mounted = false;
        if (completeTimeoutId) clearTimeout(completeTimeoutId);
      };
    }
  }, [backgroundImage, isLoading, puppies, onImageLoaded]);

  // Reset zoom when level changes (detected by loading state resetting to generating)
  useEffect(() => {
    if (loadingState === 'generating') {
        setZoom(1);
    }
  }, [loadingState]);

  // Calculate minimum zoom to fit screen using ResizeObserver for robustness
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const updateMinZoom = () => {
      if (scrollContainerRef.current) {
        const { clientWidth, clientHeight } = scrollContainerRef.current;
        const widthRatio = clientWidth / MAP_SIZE;
        const heightRatio = clientHeight / MAP_SIZE;
        // Allow zooming out until the whole image fits strictly
        minZoomRef.current = Math.min(widthRatio, heightRatio);
      }
    };

    const observer = new ResizeObserver(() => {
        updateMinZoom();
    });
    
    observer.observe(scrollContainerRef.current);
    updateMinZoom(); // Initial check

    return () => observer.disconnect();
  }, [loadingState]);

  // Random initial scroll position when loading is entering fading state (assets ready)
  useEffect(() => {
    if ((loadingState === 'fading' || loadingState === 'complete') && scrollContainerRef.current && !initialScrollSetRef.current) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight } = scrollContainerRef.current;
      
      // Calculate maximum scroll positions
      const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
      const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
      
      // Random position anywhere on the map
      const randomScrollLeft = Math.random() * maxScrollLeft;
      const randomScrollTop = Math.random() * maxScrollTop;
      
      scrollContainerRef.current.scrollTo({
        left: randomScrollLeft,
        top: randomScrollTop,
        behavior: 'instant'
      });
      
      initialScrollSetRef.current = true;
    }
    
    // Reset the flag when loading starts (new level)
    if (loadingState === 'generating' || loadingState === 'loading') {
      initialScrollSetRef.current = false;
    }
  }, [loadingState]);

  // Auto-scroll to hidden puppies when hint is activated and select 1-2 to highlight
  useEffect(() => {
    // Check if hint was just activated (transition from false -> true)
    if (showHints && !prevShowHintsRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const { scrollTop, scrollLeft, clientWidth, clientHeight } = container;
      
      const hiddenPuppies = puppies.filter(p => !p.isFound);
      
      if (hiddenPuppies.length > 0) {
        // Use a margin to ensure the puppy is not just on the edge
        const margin = 50; 
        
        // Find puppies visible in current viewport
        const visiblePuppies = hiddenPuppies.filter(p => {
          const px = (p.x / 100) * MAP_SIZE * zoom;
          const py = (p.y / 100) * MAP_SIZE * zoom;
          return (
            px >= scrollLeft + margin &&
            px <= scrollLeft + clientWidth - margin &&
            py >= scrollTop + margin &&
            py <= scrollTop + clientHeight - margin
          );
        });

        let puppiesToHighlight: Puppy[] = [];
        
        if (visiblePuppies.length > 0) {
          // If only 1 puppy is visible, highlight only that 1
          if (visiblePuppies.length === 1) {
            puppiesToHighlight = visiblePuppies;
          } 
          // If 2+ puppies are visible, highlight maximum 2 (randomly select 2 if more than 2)
          else {
            const shuffled = [...visiblePuppies].sort(() => Math.random() - 0.5);
            puppiesToHighlight = shuffled.slice(0, 2); // Always select exactly 2 if 2+ are visible
          }
        } else {
          // No puppies visible - scroll to find some and highlight 1-2
          // Find puppies near the center of the map or pick a random one
          const target = hiddenPuppies[Math.floor(Math.random() * hiddenPuppies.length)];
          const targetX = (target.x / 100) * MAP_SIZE * zoom;
          const targetY = (target.y / 100) * MAP_SIZE * zoom;

          // Find other puppies near the target (within reasonable distance)
          const searchRadius = Math.min(clientWidth, clientHeight) * 0.8; // 80% of viewport
          const nearbyPuppies = hiddenPuppies.filter(p => {
            const px = (p.x / 100) * MAP_SIZE * zoom;
            const py = (p.y / 100) * MAP_SIZE * zoom;
            const distance = Math.sqrt(
              Math.pow(px - targetX, 2) + Math.pow(py - targetY, 2)
            );
            return distance <= searchRadius;
          });

          // Select puppies to highlight based on availability
          // If only target is nearby, highlight only 1; if 2+ nearby, highlight max 2
          let puppiesToHighlight: Puppy[] = [target];
          const others = nearbyPuppies.filter(p => p.id !== target.id);
          if (others.length > 0) {
            // If there are other nearby puppies, add exactly 1 more (max 2 total)
            const randomOther = others[Math.floor(Math.random() * others.length)];
            puppiesToHighlight.push(randomOther);
          }
          // If only target exists, puppiesToHighlight already has just 1 puppy

          // Set highlights immediately
          setHighlightedPuppyIds(new Set(puppiesToHighlight.map(p => p.id)));

          // Scroll to center the target puppy
          container.scrollTo({
            left: targetX - clientWidth / 2,
            top: targetY - clientHeight / 2,
            behavior: 'smooth'
          });
          
          return; // Exit early
        }

        // Set highlighted puppies immediately if we found visible ones
        setHighlightedPuppyIds(new Set(puppiesToHighlight.map(p => p.id)));
      }
    } else if (!showHints) {
      // Clear highlights when hints are turned off
      setHighlightedPuppyIds(new Set());
    }
    prevShowHintsRef.current = showHints;
  }, [showHints, puppies, zoom]);

  // Add wheel event listener for trackpad pinch zoom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Allow pinch-to-zoom on trackpads (Ctrl + Wheel)
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const sensitivity = 0.005;
        // Use mutable ref for minZoom to ensure fresh value inside event listener
        setZoom(prev => Math.min(Math.max(prev + (delta * sensitivity), minZoomRef.current), 4.0));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [loadingState]); 

  // Add touch event listeners for pinch zoom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        
        touchState.current = {
          initialDistance: distance,
          initialZoom: zoomRef.current,
          isPinching: true
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchState.current.isPinching) {
        e.preventDefault(); // Prevent default browser actions during pinch
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

        if (touchState.current.initialDistance > 0) {
          const scale = distance / touchState.current.initialDistance;
          // Calculate new zoom with limits
          const newZoom = Math.min(Math.max(touchState.current.initialZoom * scale, minZoomRef.current), 4.0);
          setZoom(newZoom);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
       if (e.touches.length < 2) {
         touchState.current.isPinching = false;
       }
    };

    // Use { passive: false } to allow preventDefault inside touchmove
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [loadingState]); 

  // Camouflage logic helper
  const getPuppyStyles = (puppy: Puppy) => {
    // If hints are active, only highlight the selected puppies (1-2 max)
    if (showHints && !puppy.isFound && highlightedPuppyIds.has(puppy.id)) {
      return {
        mixBlendMode: 'normal' as const,
        opacity: 1,
        filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.9)) brightness(1.2)',
        extraClass: 'animate-pulse ring-4 ring-yellow-400 rounded-full'
      };
    }

    if (puppy.isFound) {
      return {
        mixBlendMode: 'normal' as const,
        opacity: 1,
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4)) brightness(1.2) saturate(1.3)',
        extraClass: ''
      };
    }

    let mixBlendMode: any = loadError ? 'normal' : 'luminosity';
    let filter = '';
    let opacity = loadError ? 1 : puppy.opacity;

    if (!loadError) {
      switch (difficulty) {
        case Difficulty.EASY:
          filter = `grayscale(20%) contrast(1.1) drop-shadow(0 0 2px rgba(255,255,255,0.3))`;
          opacity = Math.max(0.6, puppy.opacity + 0.2);
          break;
        case Difficulty.MEDIUM:
          mixBlendMode = 'luminosity';
          filter = `grayscale(60%) contrast(1.0) brightness(1.0) hue-rotate(${puppy.hueRotate}deg)`;
          opacity = Math.max(0.45, puppy.opacity + 0.1);
          break;
        case Difficulty.HARD:
          mixBlendMode = 'luminosity'; 
          filter = `grayscale(100%) contrast(1.2) brightness(0.9) hue-rotate(${puppy.hueRotate}deg)`;
          opacity = Math.max(0.35, puppy.opacity);
          break;
      }
    }

    return { mixBlendMode, filter, opacity, extraClass: '' };
  };

  // Determine if content is smaller than viewport for centering
  const isContentSmaller = scrollContainerRef.current && 
    (MAP_SIZE * zoom < scrollContainerRef.current.clientWidth || MAP_SIZE * zoom < scrollContainerRef.current.clientHeight);

  return (
    <div className="w-full h-full relative">
       {/* CREATIVE LOADING OVERLAY */}
       {loadingState !== 'complete' && (
          <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${loadingState === 'fading' ? 'opacity-0' : 'opacity-100'}`}>
            
            {/* Colorful Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 overflow-hidden">
              {/* Floating Paws Background Pattern */}
              {[...Array(15)].map((_, i) => (
                <div key={i} 
                     className="absolute text-brand/10"
                     style={{
                       left: `${Math.random() * 100}%`,
                       top: `${Math.random() * 100}%`,
                       fontSize: `${20 + Math.random() * 40}px`,
                       transform: `rotate(${Math.random() * 360}deg)`,
                       opacity: 0.2 + Math.random() * 0.3,
                     }}>
                  <i className="fas fa-paw"></i>
                </div>
              ))}
            </div>

            {/* Main Loading Card */}
            <div className="relative bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border-[6px] border-white w-80 max-w-[90%] flex flex-col items-center gap-6 animate-pulse-fast">
              
              {/* Central Illustration */}
              <div className="relative">
                {/* Spinning Ring */}
                <div className="absolute inset-0 border-4 border-dashed border-brand/30 rounded-full animate-[spin_10s_linear_infinite] scale-125"></div>
                
                {/* Bouncing Circle */}
                <div className="w-24 h-24 bg-gradient-to-tr from-brand-light to-brand rounded-full flex items-center justify-center shadow-lg animate-bounce relative z-10 border-4 border-white">
                  <i className={`fas ${loadingState === 'generating' ? 'fa-wand-magic-sparkles' : 'fa-dog'} text-4xl text-white drop-shadow-md`}></i>
                </div>
                
                {/* Decor items */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm animate-pulse z-20">
                   <i className="fas fa-bone text-sm"></i>
                </div>
              </div>

              <div className="text-center w-full space-y-1">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {loadingState === 'generating' ? 'Dreaming...' : 'Fetching Pups...'}
                </h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-70">
                   {loadingState === 'generating' ? 'Creating World' : 'Almost Ready'}
                </p>
              </div>

              {/* Creative Progress Bar */}
              <div className="w-full space-y-2">
                <div className="h-6 bg-slate-100 rounded-full border-2 border-slate-200 relative overflow-visible shadow-inner">
                   {/* Fill */}
                   <div 
                     className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-300 ease-out relative"
                     style={{ width: `${Math.max(5, progress)}%` }}
                   >
                     {/* Moving Dog Head at tip of bar */}
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 bg-white rounded-full border-2 border-orange-400 shadow-sm flex items-center justify-center z-20">
                       <span className="text-lg leading-none pt-0.5">🐶</span>
                     </div>
                   </div>
                </div>
                
                <div className="flex justify-between w-full text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
                   <span>{loadingState === 'generating' ? 'AI Magic' : 'Loading Assets'}</span>
                   <span className="text-brand">{progress}%</span>
                </div>
              </div>

            </div>
          </div>
       )}

       {/* GAME SCROLLABLE AREA */}
      <div 
        ref={scrollContainerRef}
        className={`w-full h-full overflow-auto bg-slate-900 shadow-inner hide-scrollbar ${isContentSmaller ? 'flex items-center justify-center' : ''}`}
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y' // Allow browser panning but let us handle pinch via events
        }}
      >
        <div 
           style={{ 
             width: `${MAP_SIZE * zoom}px`, 
             height: `${MAP_SIZE * zoom}px`,
             position: 'relative',
             flexShrink: 0, // Prevent shrinking in flex container
           }}
        >
          <div 
            onClick={(e) => {
              // Only handle wrong clicks when game is fully loaded and hints are not showing
              if (loadingState !== 'complete' || showHints || !onWrongClick) return;
              
              // Get click position relative to the scaled background div
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = (e.clientX - rect.left) / zoom;
              const clickY = (e.clientY - rect.top) / zoom;
              
              // Show cross icon at wrong click position
              const wrongClickId = `wrong-${Date.now()}-${Math.random()}`;
              setWrongClicks(prev => [...prev, { id: wrongClickId, x: clickX, y: clickY }]);
              
              // Auto-remove cross icon after 800ms
              setTimeout(() => {
                setWrongClicks(prev => prev.filter(wc => wc.id !== wrongClickId));
              }, 800);
              
              // Convert to percentage coordinates (0-100)
              const clickXPercent = (clickX / MAP_SIZE) * 100;
              const clickYPercent = (clickY / MAP_SIZE) * 100;
              
              // Check if click is within any unfound puppy's bounds
              // Note: Clicks on found puppies are handled by the puppy's onClick which stops propagation
              const clickedOnPuppy = puppies.some(puppy => {
                if (puppy.isFound) return false; // Don't check found puppies
                
                const baseSize = Math.max(30, puppy.scale * 120);
                const puppyX = (puppy.x / 100) * MAP_SIZE;
                const puppyY = (puppy.y / 100) * MAP_SIZE;
                
                // Calculate bounds (puppy is centered at x%, y%)
                const halfSize = baseSize / 2;
                const left = puppyX - halfSize;
                const right = puppyX + halfSize;
                const top = puppyY - halfSize;
                const bottom = puppyY + halfSize;
                
                // Check if click is within bounds (with some tolerance for easier clicking)
                const tolerance = baseSize * 0.3; // 30% tolerance
                return (
                  clickX >= left - tolerance &&
                  clickX <= right + tolerance &&
                  clickY >= top - tolerance &&
                  clickY <= bottom + tolerance
                );
              });
              
              // If not clicked on any puppy, it's a wrong click
              if (!clickedOnPuppy) {
                onWrongClick();
              }
            }}
            style={{ 
              width: `${MAP_SIZE}px`,
              height: `${MAP_SIZE}px`,
              transform: `scale(${zoom})`,
              transformOrigin: '0 0',
              // Use background color as ultimate fallback if image fails
              backgroundColor: '#334155', // Lighter slate for better contrast if image is missing 
              backgroundImage: loadError ? `url("${FALLBACK_BG}")` : `url("${backgroundImage}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              cursor: loadingState === 'complete' && !showHints ? 'pointer' : 'default',
            }}
          >
            {loadError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-70 pointer-events-none text-white">
                 <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 text-center">
                   <i className="fas fa-image text-6xl mb-4 text-white/50"></i>
                   <p className="text-xl font-bold mb-2">Background Image Missing</p>
                   <p className="text-sm opacity-80 max-w-xs">We couldn't load the scene, but you can still find the puppies!</p>
                 </div>
              </div>
            )}
            
            {/* Wrong Click Cross Icons */}
            {wrongClicks.map((wrongClick) => (
              <div
                key={wrongClick.id}
                className="absolute pointer-events-none z-50"
                style={{
                  left: `${wrongClick.x}px`,
                  top: `${wrongClick.y}px`,
                  transform: 'translate(-50%, -50%)',
                  animation: 'wrongClickFade 0.8s ease-out forwards'
                }}
              >
                <div className="relative">
                  {/* Cross Icon */}
                  <i className="fas fa-times text-red-500 text-4xl drop-shadow-lg" 
                     style={{
                       textShadow: '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.5)',
                       filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))'
                     }}
                  ></i>
                  {/* Outer ring for better visibility */}
                  <div 
                    className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-red-500/30"
                    style={{
                      animation: 'wrongClickRing 0.8s ease-out forwards'
                    }}
                  ></div>
                </div>
              </div>
            ))}
            
            {/* CSS Animation for wrong click cross */}
            <style>{`
              @keyframes wrongClickFade {
                0% {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(0.5);
                }
                20% {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1.2);
                }
                80% {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1);
                }
                100% {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(0.8);
                }
              }
              @keyframes wrongClickRing {
                0% {
                  opacity: 0.8;
                  transform: translate(-50%, -50%) scale(0.5);
                }
                50% {
                  opacity: 0.4;
                  transform: translate(-50%, -50%) scale(1.5);
                }
                100% {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(2);
                }
              }
            `}</style>
            
            {/* Puppy Layer */}
            {puppies.map((puppy) => {
              const baseSize = Math.max(30, puppy.scale * 120);
              const { mixBlendMode, filter, opacity, extraClass } = getPuppyStyles(puppy);
              
              return (
                <div
                  key={puppy.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!puppy.isFound) onPuppyFound(puppy.id);
                  }}
                  className={`absolute transition-all duration-500 cursor-pointer flex items-center justify-center ${extraClass}
                    ${puppy.isFound ? 'z-50 pointer-events-none' : 'hover:scale-110 z-10'}
                  `}
                  style={{
                    left: `${puppy.x}%`,
                    top: `${puppy.y}%`,
                    width: `${baseSize}px`, 
                    height: `${baseSize}px`,
                    transform: `
                      translate(-50%, -50%) 
                      rotate(${puppy.rotation}deg) 
                      ${puppy.isFound ? 'scale(2.5)' : 'scale(1)'}
                    `,
                    mixBlendMode: loadError ? 'normal' : mixBlendMode,
                    opacity: loadError ? 1 : opacity,
                    filter: loadError ? 'none' : filter,
                  }}
                >
                  <img 
                    src={puppy.imageUrl} 
                    alt="puppy"
                    decoding="async"
                    className={`w-full h-full object-contain ${puppy.isFound ? 'animate-bounce' : ''}`}
                    draggable={false}
                    style={!puppy.isFound && !showHints ? { filter: 'none' } : undefined}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};