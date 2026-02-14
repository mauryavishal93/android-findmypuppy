/**
 * Haptics utility: uses @capacitor/haptics on native (Android/iOS) for reliable
 * haptic feedback; falls back to navigator.vibrate on web.
 * Supports configurable intensity (0–1) applied to vibration duration / impact style.
 */

import { Capacitor } from '@capacitor/core';

// Intensity 0–1, applied to strength of feedback (default 0.7)
let hapticIntensity = 0.7;

export function setHapticIntensity(value: number) {
  hapticIntensity = Math.max(0, Math.min(1, value));
}

export function getHapticIntensity(): number {
  return hapticIntensity;
}

export const HAPTIC_PATTERNS = {
  LIGHT: 5,
  MEDIUM: 15,
  SUCCESS: [10, 30, 10],
  WARNING: [30, 30, 30],
  ERROR: [50, 50, 50, 50],
  JUMP: 8,
  LAND: 12,
} as const;

export type HapticPatternKey = keyof typeof HAPTIC_PATTERNS;

function isNative(): boolean {
  return typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
}

function getEffectiveIntensity(override?: number): number {
  const i = override !== undefined ? override : hapticIntensity;
  return Math.max(0.05, Math.min(1, i)); // clamp, avoid 0 so something is felt
}

async function triggerNativeHaptic(pattern: HapticPatternKey, intensity: number): Promise<void> {
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    const style = intensity <= 0.33 ? ImpactStyle.Light : intensity <= 0.66 ? ImpactStyle.Medium : ImpactStyle.Heavy;
    const durationMs = Math.round(50 + 250 * intensity); // 50–300 ms

    switch (pattern) {
      case 'SUCCESS':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'WARNING':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'ERROR':
        await Haptics.notification({ type: NotificationType.Error });
        break;
      case 'LIGHT':
      case 'JUMP':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'LAND':
      case 'MEDIUM':
        await Haptics.impact({ style });
        break;
      default:
        await Haptics.vibrate({ duration: durationMs });
    }
  } catch (e) {
    fallbackVibrate(HAPTIC_PATTERNS[pattern], intensity);
  }
}

function fallbackVibrate(pattern: number | number[], intensity: number): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      const scale = 0.3 + 0.7 * intensity;
      const arr = Array.isArray(pattern) ? pattern : [pattern];
      navigator.vibrate(arr.map((p) => Math.round(p * scale)));
    } catch {
      // ignore
    }
  }
}

/**
 * Trigger haptic feedback. On native uses Capacitor Haptics; on web uses navigator.vibrate.
 * Respects global haptic intensity unless overridden.
 * @param pattern - Pattern key ('SUCCESS', 'MEDIUM', 'LIGHT', etc.) or raw number/array for vibrate-only
 */
export function triggerHaptic(
  pattern: HapticPatternKey | number | number[] = 10,
  options?: { intensity?: number }
): void {
  const intensity = getEffectiveIntensity(options?.intensity);

  if (isNative() && typeof pattern === 'string' && pattern in HAPTIC_PATTERNS) {
    triggerNativeHaptic(pattern as HapticPatternKey, intensity).catch(() => {
      const p = HAPTIC_PATTERNS[pattern as HapticPatternKey];
      fallbackVibrate(p as number | number[], intensity);
    });
    return;
  }

  const p = typeof pattern === 'string' ? (HAPTIC_PATTERNS[pattern as HapticPatternKey] ?? 10) : pattern;
  fallbackVibrate(Array.isArray(p) ? p : [p], intensity);
}
