/**
 * Central Google Auth config and initialization.
 * Use WEB_CLIENT_ID for web OAuth and server-side token verification.
 * Use ANDROID_CLIENT_ID for native Android sign-in (NativeGoogleAuthPlugin / strings.xml).
 *
 * If using @codetrix-studio/capacitor-google-auth or similar, ensure:
 *   GoogleAuth.initialize({
 *     clientId: WEB_CLIENT_ID,
 *     scopes: ['profile', 'email'],
 *     grantOfflineAccess: true
 *   });
 * This module runs that initialization when the plugin is available.
 */

export const WEB_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '896459680164-aa61o2u96qrscu10ia9g0l40agca0q6i.apps.googleusercontent.com';

export const ANDROID_GOOGLE_CLIENT_ID =
  '896459680164-31qmoo79jfnj4ca3fei6l2hjlb5c4ivg.apps.googleusercontent.com';

/**
 * Call once at app startup (e.g. in App.tsx).
 * This app uses custom NativeGoogleAuth on Android and Google Identity Services on web,
 * so no plugin init is required here. If you add @codetrix-studio/capacitor-google-auth,
 * call GoogleAuth.initialize({ clientId: WEB_CLIENT_ID, scopes: ['profile', 'email'], grantOfflineAccess: true })
 * in your app after the plugin is loaded (e.g. in a separate script or after npm install of that package).
 */
export async function initializeGoogleAuth(): Promise<void> {
  // No-op: avoids build-time resolution of optional @codetrix-studio/capacitor-google-auth
}
