/**
 * Native Google Sign-In for Android (Capacitor).
 * On web this module is no-op; use the Web GIS flow in LoginView instead.
 */

import { registerPlugin } from '@capacitor/core';
import { WEB_CLIENT_ID, ANDROID_GOOGLE_CLIENT_ID } from './googleAuthConfig';

export interface NativeGoogleAuthPlugin {
  signIn(options: { serverClientId?: string }): Promise<{
    idToken: string;
    email?: string;
    displayName?: string;
  }>;
}

declare global {
  interface Window {
    Capacitor?: {
      getPlatform: () => string;
      Plugins?: {
        NativeGoogleAuth?: NativeGoogleAuthPlugin;
      };
    };
  }
}

function isAndroidPlatform(): boolean {
  return typeof window !== 'undefined' && window.Capacitor?.getPlatform?.() === 'android';
}

/** Prefer registerPlugin (Capacitor 8); fallback to bridge Plugins for compatibility */
function getNativeAuthPlugin(): NativeGoogleAuthPlugin | null {
  if (!isAndroidPlatform()) return null;
  try {
    const registered = registerPlugin<NativeGoogleAuthPlugin>('NativeGoogleAuth');
    if (registered && typeof registered.signIn === 'function') return registered;
  } catch {
    // registerPlugin may throw if plugin not found
  }
  const cap = window.Capacitor;
  const plugin = cap?.Plugins?.NativeGoogleAuth;
  if (plugin && typeof plugin.signIn === 'function') return plugin;
  return null;
}

export function getIsAndroidNativeGoogleAvailable(): boolean {
  return getNativeAuthPlugin() != null;
}

const SIGN_IN_TIMEOUT_MS = 45_000; // 45 seconds – then show timeout error

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

/** Use this to detect "plugin not implemented" so UI can fall back to Web Google button on Android */
export function isPluginNotImplementedError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /not implemented|NativeGoogleAuth\.then/i.test(msg);
}

export async function signInWithGoogleNative(
  serverClientId?: string
): Promise<{ idToken: string }> {
  console.log('[nativeGoogleAuth] signInWithGoogleNative called');
  const plugin = getNativeAuthPlugin();
  if (!plugin) {
    console.error('[nativeGoogleAuth] Plugin not available');
    throw new Error('Native Google Sign-In is only available on Android.');
  }
  console.log('[nativeGoogleAuth] Plugin found, calling signIn...');
  // Call the native-injected method directly so it returns a real Promise (avoids "then() is not implemented")
  // IMPORTANT: serverClientId must be the WEB_CLIENT_ID (not Android client ID) because:
  // 1. The backend server verifies tokens using the Web Client ID
  // 2. Google's requestIdToken() requires the OAuth 2.0 client ID that matches the backend audience
  // The Android client ID is only used for configuring the OAuth client in Google Cloud Console
  const clientIdToUse = serverClientId || WEB_CLIENT_ID || ANDROID_GOOGLE_CLIENT_ID;
  console.log('[nativeGoogleAuth] Using serverClientId (Web Client ID):', clientIdToUse.substring(0, 30) + '...');
  const signInPromise = plugin.signIn({
    serverClientId: clientIdToUse,
  });
  if (!signInPromise || typeof (signInPromise as Promise<unknown>).then !== 'function') {
    throw new Error('Google Sign-In is not available. Rebuild the app and try again.');
  }
  try {
    const result = await withTimeout(
      signInPromise as Promise<{ idToken?: string; email?: string; displayName?: string }>,
      SIGN_IN_TIMEOUT_MS,
      'Sign-in timed out. Please try again.'
    );
    console.log('[NativeGoogleAuth] signIn result:', {
      hasIdToken: Boolean(result?.idToken),
      email: result?.email ?? null,
      displayName: result?.displayName ?? null,
    });
    if (!result?.idToken) throw new Error('No ID token from Google Sign-In');
    return { idToken: result.idToken };
  } catch (err) {
    const serialized = typeof err === 'object' && err !== null
      ? JSON.stringify({ ...(err as object), message: (err as Error).message })
      : JSON.stringify(err);
    console.error('[NativeGoogleAuth] signIn error:', serialized);
    const code = (err as { code?: number })?.code;
    if (typeof code === 'number') {
      console.error('[NativeGoogleAuth] native status code:', code);
    }
    throw err;
  }
}
