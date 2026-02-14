import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DailyPuzzle, PuzzlePiece, generateDailyPuzzle, BREED_ICONS, PUZZLE_CONFIGS } from '../types/dailyPuzzle';
import { ThemeConfig } from '../types';

interface DailyPuzzleGameProps {
  onComplete: (puzzleId: string, breed: string, pose: string, accessories: string[]) => Promise<void>;
  onClose: () => void;
  activeTheme: ThemeConfig;
  username?: string | null; // Username for unique puzzle generation
}

export const DailyPuzzleGame: React.FC<DailyPuzzleGameProps> = ({
  onComplete,
  onClose,
  activeTheme,
  username
}) => {
  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const puzzleAreaRef = useRef<HTMLDivElement>(null);

  // Generate puzzle on mount - ensure exactly 9 pieces, unique per user
  useEffect(() => {
    const today = new Date();
    const todayPuzzle = generateDailyPuzzle(today, username);
    // Verify we have exactly 9 pieces
    if (todayPuzzle.pieces.length === 9) {
      setPuzzle(todayPuzzle);
      setPieces([...todayPuzzle.pieces]);
      console.log(`✅ Generated puzzle with exactly 9 pieces (3x3 grid)`);
      console.log(`🖼️ Unique image for today: ${todayPuzzle.referenceImageUrl}`);
    } else {
      console.error(`❌ Invalid puzzle: expected 9 pieces but got ${todayPuzzle.pieces.length}`);
      // Regenerate if incorrect
      const fixedPuzzle = generateDailyPuzzle(today, username);
      if (fixedPuzzle.pieces.length === 9) {
        setPuzzle(fixedPuzzle);
        setPieces([...fixedPuzzle.pieces]);
      }
    }
  }, [username]);

  // Check if puzzle is complete - must have exactly 9 pieces all placed
  useEffect(() => {
    if (pieces.length === 9 && pieces.every(p => p.isPlaced)) {
      setIsComplete(true);
      setTimeout(() => {
        setShowReward(true);
      }, 500);
    } else {
      setIsComplete(false);
    }
  }, [pieces]);

  const handleMouseDown = useCallback((e: React.MouseEvent, pieceId: string) => {
    e.preventDefault();
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || piece.isPlaced) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDraggedPiece(pieceId);
    setDragOffset({
      x: x - piece.x,
      y: y - piece.y
    });
  }, [pieces]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedPiece || !containerRef.current || !puzzleAreaRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const puzzleRect = puzzleAreaRef.current.getBoundingClientRect();
    
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;
    
    const x = (mouseX / containerRect.width) * 100;
    const y = (mouseY / containerRect.height) * 100;

    setPieces(prev => prev.map(p => {
      if (p.id === draggedPiece) {
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;

        // Calculate target position relative to puzzle area
        const puzzleAreaCenterX = containerRect.width / 2;
        const puzzleAreaCenterY = containerRect.height / 2;
        const puzzleAreaLeft = puzzleAreaCenterX - puzzleRect.width / 2;
        const puzzleAreaTop = puzzleAreaCenterY - puzzleRect.height / 2;
        
        const targetX = puzzleAreaLeft + (p.targetX / 100) * puzzleRect.width;
        const targetY = puzzleAreaTop + (p.targetY / 100) * puzzleRect.height;
        
        const targetXPercent = (targetX / containerRect.width) * 100;
        const targetYPercent = (targetY / containerRect.height) * 100;

        // Check if close enough to target (snap tolerance) - increased for easier snapping
        const config = PUZZLE_CONFIGS[puzzle?.difficulty || 'medium'];
        const snapTolerance = 8; // Increased tolerance for easier snapping
        const distance = Math.sqrt(
          Math.pow(newX - targetXPercent, 2) + Math.pow(newY - targetYPercent, 2)
        );

        if (distance <= snapTolerance) {
          return {
            ...p,
            x: targetXPercent,
            y: targetYPercent,
            rotation: 0,
            isPlaced: true
          };
        }

        return {
          ...p,
          x: Math.max(5, Math.min(95, newX)),
          y: Math.max(5, Math.min(95, newY))
        };
      }
      return p;
    }));
  }, [draggedPiece, dragOffset, puzzle]);

  const handleMouseUp = useCallback(() => {
    setDraggedPiece(null);
  }, []);

  useEffect(() => {
    if (draggedPiece) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedPiece, handleMouseMove, handleMouseUp]);

  const handleComplete = useCallback(async () => {
    if (!puzzle || !isComplete) return;

    await onComplete(puzzle.id, puzzle.breed, puzzle.pose, puzzle.accessories);
  }, [puzzle, isComplete, onComplete]);

  useEffect(() => {
    if (showReward && puzzle) {
      handleComplete();
    }
  }, [showReward, puzzle, handleComplete]);

  if (!puzzle) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className={`${activeTheme.cardBg} rounded-2xl p-8 border-2 ${activeTheme.accent} shadow-2xl`}>
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🐕</div>
            <p className={activeTheme.text}>Loading puzzle...</p>
          </div>
        </div>
      </div>
    );
  }

  const config = PUZZLE_CONFIGS[puzzle.difficulty];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className={`relative w-full h-full max-w-6xl max-h-[90vh] ${activeTheme.cardBg} rounded-2xl p-6 border-4 ${activeTheme.accent} shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${activeTheme.text}`}>
            🧩 Daily Puppy Puzzle
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowReference(!showReference)}
              className={`px-4 py-2 ${activeTheme.button} rounded-lg font-bold ${activeTheme.text} hover:opacity-80 transition-opacity text-sm`}
            >
              {showReference ? '👁️ Hide' : '👁️ Show'} Reference
            </button>
            <button
              onClick={onClose}
              className={`px-4 py-2 ${activeTheme.button} rounded-lg font-bold ${activeTheme.text} hover:opacity-80 transition-opacity`}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Puzzle Info */}
        <div className={`mb-4 p-3 rounded-lg ${activeTheme.accent}/20`}>
          <p className={`text-sm ${activeTheme.subText}`}>
            <span className="font-bold">Breed:</span> {BREED_ICONS[puzzle.breed]} {puzzle.breed} | 
            <span className="font-bold"> Pose:</span> {puzzle.pose} | 
            <span className="font-bold"> Puzzle:</span> 3x3 Grid (9 pieces to assemble)
          </p>
        </div>

        <div className="flex-1 flex gap-4">
          {/* Puzzle Area */}
          <div className="flex-1 flex flex-col">
            <div
              ref={containerRef}
              className="flex-1 relative border-4 border-dashed border-gray-400 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50"
              style={{ minHeight: '400px' }}
            >
              {/* Grid Target Area - Always 3x3 */}
              <div
                ref={puzzleAreaRef}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: '60%',
                  height: '60%',
                  minWidth: '400px',
                  minHeight: '400px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '3px solid rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
                }}
              >
                {/* Grid lines for 3x3 */}
                <div
                  className="absolute w-full border-t-2 border-dashed border-gray-400"
                  style={{ top: '33.33%' }}
                />
                <div
                  className="absolute w-full border-t-2 border-dashed border-gray-400"
                  style={{ top: '66.66%' }}
                />
                <div
                  className="absolute h-full border-l-2 border-dashed border-gray-400"
                  style={{ left: '33.33%' }}
                />
                <div
                  className="absolute h-full border-l-2 border-dashed border-gray-400"
                  style={{ left: '66.66%' }}
                />
              </div>

              {/* Simple Square Puzzle Pieces */}
              {pieces.map((piece) => {
                const isDragging = draggedPiece === piece.id;
                const rect = puzzleAreaRef.current?.getBoundingClientRect();
                const containerRect = containerRef.current?.getBoundingClientRect();
                
                if (!rect || !containerRect) return null;

                // Calculate actual position
                const actualX = (piece.x / 100) * containerRect.width;
                const actualY = (piece.y / 100) * containerRect.height;
                
                // Target position is relative to the puzzle area center
                const puzzleAreaCenterX = containerRect.width / 2;
                const puzzleAreaCenterY = containerRect.height / 2;
                const puzzleAreaLeft = puzzleAreaCenterX - rect.width / 2;
                const puzzleAreaTop = puzzleAreaCenterY - rect.height / 2;
                
                const targetX = puzzleAreaLeft + (piece.targetX / 100) * rect.width;
                const targetY = puzzleAreaTop + (piece.targetY / 100) * rect.height;
                
                const pieceWidth = (rect.width / 3); // Always 3 columns
                const pieceHeight = (rect.height / 3); // Always 3 rows

                return (
                  <div
                    key={piece.id}
                    className={`absolute cursor-move transition-all duration-200 ${
                      piece.isPlaced ? 'z-10 opacity-100' : 'z-20 opacity-90 hover:opacity-100'
                    } ${isDragging ? 'scale-110 z-30 shadow-2xl' : ''}`}
                    style={{
                      left: piece.isPlaced ? `${targetX}px` : `${actualX}px`,
                      top: piece.isPlaced ? `${targetY}px` : `${actualY}px`,
                      transform: `translate(-50%, -50%)`,
                      width: `${pieceWidth}px`,
                      height: `${pieceHeight}px`
                    }}
                    onMouseDown={(e) => handleMouseDown(e, piece.id)}
                  >
                    {/* Simple Square Piece with Image - Proper CSS clipping */}
                    <div
                      className={`w-full h-full rounded-lg border-3 transition-all overflow-hidden relative ${
                        piece.isPlaced
                          ? 'border-green-500 shadow-lg'
                          : 'border-blue-500 hover:border-blue-600 shadow-md'
                      }`}
                      style={{
                        backgroundColor: '#f0f0f0'
                      }}
                    >
                      {puzzle.referenceImageUrl ? (
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundImage: `url(${puzzle.referenceImageUrl})`,
                            backgroundSize: '300% 300%', // 3x3 grid = 300% total (each piece is 1/3)
                            backgroundPosition: `${piece.backgroundPosition.x}% ${piece.backgroundPosition.y}%`,
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                          {piece.row * 3 + piece.col + 1}
                        </div>
                      )}
                      
                      {/* Overlay for better visibility when dragging */}
                      {isDragging && (
                        <div className="absolute inset-0 bg-white/10 rounded-lg pointer-events-none" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Instructions */}
            <div className={`mt-4 p-3 rounded-lg ${activeTheme.accent}/10`}>
              <p className={`text-sm ${activeTheme.subText} text-center font-bold`}>
                Drag the 9 pieces to the grid to complete the puppy image!
              </p>
              <p className={`text-xs ${activeTheme.subText} text-center mt-1`}>
                Pieces placed: <span className="font-bold text-lg">{pieces.filter(p => p.isPlaced).length} / 9</span>
              </p>
            </div>
          </div>

          {/* Reference Image */}
          {showReference && (
            <div className="w-64 flex flex-col">
              <h3 className={`text-lg font-bold mb-2 ${activeTheme.text}`}>Reference</h3>
              <div className="flex-1 border-4 border-gray-300 rounded-lg overflow-hidden bg-white">
                {puzzle.referenceImageUrl ? (
                  <img
                    src={puzzle.referenceImageUrl}
                    alt={`${puzzle.breed} ${puzzle.pose}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">${BREED_ICONS[puzzle.breed]}</div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {BREED_ICONS[puzzle.breed]}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Completion Modal */}
        {showReward && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-2xl">
            <div className={`${activeTheme.cardBg} rounded-2xl p-8 border-4 ${activeTheme.accent} shadow-2xl text-center max-w-md`}>
              <div className="text-6xl mb-4 animate-bounce">
                {BREED_ICONS[puzzle.breed]}
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${activeTheme.text}`}>
                Puzzle Complete! 🎉
              </h3>
              <p className={`text-lg mb-6 ${activeTheme.subText}`}>
                You've assembled a {puzzle.breed} in {puzzle.pose} pose!
              </p>
              <button
                onClick={onClose}
                className={`px-6 py-3 ${activeTheme.button} rounded-lg font-bold ${activeTheme.text} hover:opacity-80 transition-opacity`}
              >
                Collect Reward! ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
