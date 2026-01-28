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
const FALLBACK_BG_IMAGES = [
"https://mauryavishal93.github.io/FindMyPuppy/asset/1.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/2.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/3.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/4.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/5.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/6.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/7.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/8.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/9.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/10.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/11.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/12.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/13.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/14.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/15.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/16.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/17.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/18.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/19.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/20.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/21.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/22.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/23.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/24.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/25.png",
  "https://mauryavishal93.github.io/FindMyPuppy/asset/26.png"
];


export const generateLevelTheme = async (levelId: number, _difficulty: Difficulty): Promise<string> => {
  return THEMES[(levelId - 1) % THEMES.length];
};

export const generateLevelImage = async (theme: string, levelId: number, timestamp?: number): Promise<string> => {
  // Use seeded random to select image based on level and timestamp for consistency
  // This ensures the same level gets the same image, but different levels get different images
  const seed = levelId * 1000 + (timestamp ? timestamp % 1000 : 0);
  const randomIndex = seed % FALLBACK_BG_IMAGES.length;
  return FALLBACK_BG_IMAGES[randomIndex];
};