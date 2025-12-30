
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface LevelConfig {
  id: number;
  difficulty: Difficulty;
  puppyCount: number;
  points: number;
  themePrompt?: string; // Optional cached theme
}

export interface Puppy {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  rotation: number;
  scale: number;
  isFound: boolean;
  opacity: number;
  hueRotate: number;
  imageUrl: string;
}

export interface UserProgress {
  playerName: string;
  clearedLevels: { [key: string]: boolean }; // key format: "DIFFICULTY_ID" e.g., "EASY_1"
  totalScore: number;
  unlockedDifficulties: Difficulty[];
  premiumHints: number;
  selectedTheme?: ThemeType;
}

export interface GameSession {
  isPlaying: boolean;
  currentLevel: number;
  currentDifficulty: Difficulty;
  score: number;
  timeLeft?: number;
}

export type ThemeType = 'sunny' | 'night' | 'candy' | 'forest' | 'park' | 'bath' | 'toys' | 'streetDog' | 'puppyPlush' | 'dogParkDark' | 'puppyCandy' | 'neonPup' | 'handDrawnPup' | 'cosmicPuppy' | 'safariPup' | 'puppyHologram' | 'cartoonChaos';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  icon: string;
  background: string; // Main background gradient
  cardBg: string; // Background for panels/cards
  text: string; // Primary text color
  subText: string; // Secondary text color
  accent: string; // Accent color for buttons/highlights
  button: string; // Primary button style
  headerBg: string; // Header background
  iconBg: string; // Icon button background
}
