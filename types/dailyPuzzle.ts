// Daily Puppy Puzzle Types - Jigsaw Puzzle System

export type PuppyBreed = 
  | 'Corgi' 
  | 'ShibaInu' 
  | 'GoldenRetriever' 
  | 'Dalmatian' 
  | 'Poodle' 
  | 'Beagle' 
  | 'Bulldog' 
  | 'Husky' 
  | 'Labrador' 
  | 'Pomeranian';

export type PuppyPose = 
  | 'sitting' 
  | 'standing' 
  | 'sleeping' 
  | 'playing' 
  | 'begging' 
  | 'running' 
  | 'lying';

export type PuppyAccessory = 
  | 'hat' 
  | 'glasses' 
  | 'bow' 
  | 'collar' 
  | 'scarf' 
  | 'costume' 
  | 'bandana' 
  | 'flowerCrown';

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard';

export interface PuzzlePiece {
  id: string;
  row: number; // Grid row (0-indexed)
  col: number; // Grid column (0-indexed)
  x: number; // Current position X (percentage)
  y: number; // Current position Y (percentage)
  targetX: number; // Target position X in grid (percentage)
  targetY: number; // Target position Y in grid (percentage)
  rotation: number; // Current rotation (0, 90, 180, 270) - not used in simple version
  isPlaced: boolean;
  backgroundPosition: { x: number; y: number }; // Position in original image (%)
  backgroundSize: { width: number; height: number }; // Size of original image (%)
}

export interface DailyPuzzle {
  id: string; // Unique puzzle ID (date-based)
  breed: PuppyBreed;
  pose: PuppyPose;
  accessories: PuppyAccessory[];
  difficulty: PuzzleDifficulty;
  pieces: PuzzlePiece[];
  gridRows: number; // Number of rows in grid (always 3)
  gridCols: number; // Number of columns in grid (always 3)
  referenceImageUrl: string; // Full reference image (unique per day)
  completedDate?: string;
}

export interface CollectedPuppy {
  breed: PuppyBreed;
  pose: PuppyPose;
  accessories: PuppyAccessory[];
  collectedDate: string;
  puzzleId: string;
}

export interface DailyCheckInData {
  lastCheckInDate: string | null;
  checkInStreak: number;
  totalCheckIns: number;
  hasCheckedInToday: boolean;
  collectedPuppies: CollectedPuppy[];
}

export interface PuzzleConfig {
  difficulty: PuzzleDifficulty;
  gridRows: number;
  gridCols: number;
  allowRotation: boolean;
  snapTolerance: number; // Pixels
}

// Puzzle configurations by difficulty - Always 3x3 (9 pieces)
export const PUZZLE_CONFIGS: Record<PuzzleDifficulty, PuzzleConfig> = {
  easy: {
    difficulty: 'easy',
    gridRows: 3,
    gridCols: 3,
    allowRotation: false,
    snapTolerance: 15
  },
  medium: {
    difficulty: 'medium',
    gridRows: 3,
    gridCols: 3,
    allowRotation: true,
    snapTolerance: 12
  },
  hard: {
    difficulty: 'hard',
    gridRows: 3,
    gridCols: 3,
    allowRotation: true,
    snapTolerance: 10
  }
};

// Breed emoji/icons mapping
export const BREED_ICONS: Record<PuppyBreed, string> = {
  Corgi: '🐕',
  ShibaInu: '🦊',
  GoldenRetriever: '🐕‍🦺',
  Dalmatian: '🐕',
  Poodle: '🐩',
  Beagle: '🐕',
  Bulldog: '🐕',
  Husky: '🐺',
  Labrador: '🐕',
  Pomeranian: '🐕'
};

import { PUPPY_IMAGES } from '../constants/puppyImages';

// Generate unique puppy image URL based on breed, pose, date, and user seed
// Uses actual puppy images from the game's image list
export function getPuppyImageUrl(breed: PuppyBreed, pose: PuppyPose, date: Date, seed?: number): string {
  // Use provided seed or generate from date for unique image
  const imageSeed = seed || (date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate());
  
  // Select image based on seed for uniqueness (different per user)
  const imageIndex = imageSeed % PUPPY_IMAGES.length;
  
  return PUPPY_IMAGES[imageIndex];
}

// Generate simple puzzle pieces from a grid (always 3x3 = 9 pieces)
// Simplified: Square pieces that snap together (no complex jigsaw edges)
export function generatePuzzlePieces(
  difficulty: PuzzleDifficulty,
  breed: PuppyBreed,
  pose: PuppyPose
): PuzzlePiece[] {
  const pieces: PuzzlePiece[] = [];
  const gridRows = 3; // Always 3x3
  const gridCols = 3; // Always 3x3
  const totalPieces = 9;

  // Calculate grid positions (always 3x3 = 9 pieces)
  const pieceWidth = 100 / 3; // Always 3 columns
  const pieceHeight = 100 / 3; // Always 3 rows

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const index = row * gridCols + col;
      
      // Target position in grid (center of piece)
      const targetX = (col + 0.5) * pieceWidth;
      const targetY = (row + 0.5) * pieceHeight;
      
      // Random starting position (scattered around screen)
      const angle = (Math.PI * 2 * index) / totalPieces;
      const radius = 100 + Math.random() * 60;
      const startX = 50 + Math.cos(angle) * (radius / 5);
      const startY = 50 + Math.sin(angle) * (radius / 5);

      // Calculate background position for image clipping
      // For CSS background-position with backgroundSize 300%:
      // - Col 0: Position image at 0% to show left third
      // - Col 1: Position image at 50% to show middle third (center aligns with piece center)
      // - Col 2: Position image at 100% to show right third
      // Same logic for rows
      const bgX = col === 0 ? 0 : col === 1 ? 50 : 100; // 0%, 50%, 100%
      const bgY = row === 0 ? 0 : row === 1 ? 50 : 100; // 0%, 50%, 100%
      
      pieces.push({
        id: `piece-${row}-${col}`,
        row,
        col,
        x: Math.max(10, Math.min(90, startX)),
        y: Math.max(10, Math.min(90, startY)),
        targetX,
        targetY,
        rotation: 0, // No rotation needed for simple puzzle
        isPlaced: false,
        backgroundPosition: {
          x: bgX, // CSS background-position X (0%, 50%, 100%)
          y: bgY  // CSS background-position Y (0%, 50%, 100%)
        },
        backgroundSize: {
          width: gridCols * 100, // 300% (3x the piece size) - shows full image width
          height: gridRows * 100 // 300% (3x the piece size) - shows full image height
        }
      });
    }
  }

  return pieces;
}

// Generate a random puzzle for the day - unique per user
export function generateDailyPuzzle(date: Date, username?: string | null): DailyPuzzle {
  const breeds: PuppyBreed[] = ['Corgi', 'ShibaInu', 'GoldenRetriever', 'Dalmatian', 'Poodle', 'Beagle', 'Bulldog', 'Husky', 'Labrador', 'Pomeranian'];
  const poses: PuppyPose[] = ['sitting', 'standing', 'sleeping', 'playing', 'begging', 'running', 'lying'];
  const allAccessories: PuppyAccessory[] = ['hat', 'glasses', 'bow', 'collar', 'scarf', 'costume', 'bandana', 'flowerCrown'];
  
  // Create unique seed: date + username hash for user-specific puzzles
  const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  
  // Hash username to a number for seed (simple hash function)
  let usernameHash = 0;
  if (username) {
    for (let i = 0; i < username.length; i++) {
      const char = username.charCodeAt(i);
      usernameHash = ((usernameHash << 5) - usernameHash) + char;
      usernameHash = usernameHash & usernameHash; // Convert to 32-bit integer
    }
  }
  
  // Combine date and username hash for unique seed per user per day
  const seed = Math.abs(dateSeed * 1000 + (usernameHash % 1000));
  
  const random = (() => {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  })();

  // Select breed and pose based on user-specific seed - ensures uniqueness per user each day
  const breedIndex = Math.floor(random() * breeds.length);
  const poseIndex = Math.floor(random() * poses.length);
  const breed = breeds[breedIndex];
  const pose = poses[poseIndex];
  
  console.log(`🎲 Daily Puzzle Seed: ${seed} (Date: ${dateSeed}, User: ${usernameHash}) | Breed: ${breed} (${breedIndex}) | Pose: ${pose} (${poseIndex}) | User: ${username || 'guest'}`);
  
  // Random 0-2 accessories
  const accessoryCount = Math.floor(random() * 3);
  const accessories: PuppyAccessory[] = [];
  const availableAccessories = [...allAccessories];
  for (let i = 0; i < accessoryCount; i++) {
    const index = Math.floor(random() * availableAccessories.length);
    accessories.push(availableAccessories.splice(index, 1)[0]);
  }

  // Determine difficulty based on streak (or random for first time)
  const difficulty: PuzzleDifficulty = random() < 0.4 ? 'easy' : random() < 0.7 ? 'medium' : 'hard';

  // Include username in puzzle ID for uniqueness
  const userSuffix = username ? `-${username.replace(/[^a-zA-Z0-9]/g, '')}` : '';
  const puzzleId = `puzzle-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}${userSuffix}`;
  
  const config = PUZZLE_CONFIGS[difficulty];
  const pieces = generatePuzzlePieces(difficulty, breed, pose);
  // Use seed for image selection to ensure unique image per user
  const referenceImageUrl = getPuppyImageUrl(breed, pose, date, seed);

  // Ensure exactly 9 pieces (3x3 grid)
  if (pieces.length !== 9) {
    console.error(`❌ Invalid puzzle: expected 9 pieces but got ${pieces.length}`);
    // Regenerate to ensure 9 pieces
    const regeneratedPieces = generatePuzzlePieces(difficulty, breed, pose);
    return {
      id: puzzleId,
      breed,
      pose,
      accessories,
      difficulty,
      pieces: regeneratedPieces.slice(0, 9), // Ensure exactly 9
      gridRows: 3, // Always 3x3
      gridCols: 3, // Always 3x3
      referenceImageUrl
    };
  }

  return {
    id: puzzleId,
    breed,
    pose,
    accessories,
    difficulty,
    pieces, // Exactly 9 pieces
    gridRows: 3, // Always 3x3
    gridCols: 3, // Always 3x3
    referenceImageUrl
  };
}
