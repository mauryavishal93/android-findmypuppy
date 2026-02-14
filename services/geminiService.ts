import { Difficulty } from "../types";

// --- THEMES ---
const THEMES = [
  "A sunlit cottage kitchen table in morning light",
  "A cozy explorer's desk by a window in autumn",
  "A vintage sewing corner bathed in soft afternoon sun",
  "A lush secret garden nook with blooming hydrangeas",
  "A storybook herbalist's hut interior",
  "A peaceful sunroom filled with ferns",
  "A picnic on a checkered blanket in evening light",
  "A dusty attic window seat with soft sunbeams",
  "A greenhouse shelf crowded with succulents",
  "A bakery counter in a village",
  "A magical potion shop counter",
  "A rustic toolshed workbench",
  "A vintage candy shop display",
  "A painter's easel in a meadow",
  "A cozy reading nook with a plush armchair",
  "A forest floor covered in moss and mushrooms",
  "A seaside rock pool with colorful shells",
  "A vintage vanity table with perfume bottles",
  "A cluttered antique shop shelf",
  "A festive holiday fireplace mantle",
  "A treehouse floor scattered with toys",
  "A japanese tea ceremony set",
  "A wizard's alchemy table",
  "A farmer's market stall",
  "A cozy bedroom window sill"
];

// Curated list of high-quality background images for game levels
// Using local assets from public/asset folder (works for both web and Android)
const FALLBACK_BG_IMAGES = [
"/asset/1.webp",
"/asset/2.webp",
"/asset/3.webp",
"/asset/4.webp",
"/asset/5.webp",
"/asset/6.webp",
"/asset/7.webp",
"/asset/8.webp",
"/asset/9.webp",
"/asset/10.webp",
"/asset/11.webp",
"/asset/12.webp",
"/asset/13.webp",
"/asset/14.webp",
"/asset/15.webp",
"/asset/16.webp",
"/asset/17.webp",
"/asset/18.webp",
"/asset/19.webp",
"/asset/20.webp",
"/asset/21.webp",
"/asset/22.webp",
"/asset/23.webp",
"/asset/24.webp",
"/asset/25.webp",
"/asset/26.webp"
];


export const generateLevelTheme = async (levelId: number, _difficulty: Difficulty): Promise<string> => {
  return THEMES[(levelId - 1) % THEMES.length];
};

export const generateLevelImage = async (_theme: string, levelId: number, timestamp?: number): Promise<string> => {
  // Use seeded random to select image based on level and timestamp for consistency
  // This ensures the same level gets the same image, but different levels get different images
  const seed = levelId * 1000 + (timestamp ? timestamp % 1000 : 0);
  const randomIndex = seed % FALLBACK_BG_IMAGES.length;
  return FALLBACK_BG_IMAGES[randomIndex];
};