# Google Sign-In Fix Summary

## Issues Fixed

### 1. **Wrong Client ID in `requestIdToken()`**
   - **Problem**: The native plugin was using the **Android Client ID** (`896459680164-31qmoo79jfnj4ca3fei6l2hjlb5c4ivg`) for `requestIdToken()`
   - **Fix**: Changed to use the **Web Client ID** (`896459680164-aa61o2u96qrscu10ia9g0l40agca0q6i`) 
   - **Why**: `requestIdToken()` requires the OAuth 2.0 client ID that matches what your backend server uses to verify tokens. The backend verifies tokens using the Web Client ID, not the Android Client ID.

### 2. **Client ID Configuration**
   - **Updated Files**:
     - `android/app/src/main/res/values/strings.xml` - Changed `server_client_id` to Web Client ID
     - `services/nativeGoogleAuth.ts` - Updated to use `WEB_CLIENT_ID` as default

## SHA-1 Fingerprints Required

You need **BOTH** SHA-1 fingerprints added to your Android OAuth client in Google Cloud Console:

### Debug Build SHA-1
```
96:54:9E:98:75:A8:6B:21:22:D1:37:6D:A6:54:35:D8:56:B3:87:8C
```

### Release Build SHA-1  
```
81:1D:7D:6B:85:20:14:A9:DE:C1:12:D6:3F:DC:25:F3:35:9E:84:3D
```

## How to Add SHA-1s to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **Android** OAuth 2.0 Client ID:
   - Client ID: `896459680164-31qmoo79jfnj4ca3fei6l2hjlb5c4ivg.apps.googleusercontent.com`
   - Package name: `com.findmypuppy.app`
4. Click **Edit** (pencil icon)
5. In **SHA-1 certificate fingerprint**, add **BOTH** fingerprints (one per line):
   ```
   96:54:9E:98:75:A8:6B:21:22:D1:37:6D:A6:54:35:D8:56:B3:87:8C
   81:1D:7D:6B:85:20:14:A9:DE:C1:12:D6:3F:DC:25:F3:35:9E:84:3D
   ```
6. Click **Save**
7. **Wait 5-10 minutes** for changes to propagate

## Testing

After adding both SHA-1s and waiting 5-10 minutes:

1. Uninstall the app: `adb uninstall com.findmypuppy.app`
2. Install the release APK: `adb install android/app/release/app-release.apk`
3. Open the app and tap "Sign in with Google"
4. Select your Google account
5. Sign-in should complete successfully!

## Client IDs Reference

- **Web Client ID** (used for `requestIdToken()` and backend verification):
  - `896459680164-aa61o2u96qrscu10ia9g0l40agca0q6i.apps.googleusercontent.com`

- **Android Client ID** (used for OAuth client configuration in Google Cloud):
  - `896459680164-31qmoo79jfnj4ca3fei6l2hjlb5c4ivg.apps.googleusercontent.com`

## Important Notes

- The **Android Client ID** is only used for configuring the OAuth client in Google Cloud Console (package name + SHA-1)
- The **Web Client ID** is what you pass to `requestIdToken()` because your backend verifies tokens using this client ID
- Both SHA-1s must be registered so the app works with both debug and release builds
