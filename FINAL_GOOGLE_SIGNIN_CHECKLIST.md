# Final Google Sign-In Checklist

## ✅ Fixes Applied

1. **Updated `strings.xml`** to use Web Client ID (`896459680164-aa61o2u96qrscu10ia9g0l40agca0q6i`) instead of Android Client ID
2. **Updated `nativeGoogleAuth.ts`** to use `WEB_CLIENT_ID` as default
3. **Rebuilt and synced** the app with latest changes

## ⚠️ CRITICAL: Add BOTH SHA-1 Fingerprints

You **MUST** add **BOTH** SHA-1 fingerprints to Google Cloud Console:

### 1. Debug SHA-1 (for debug builds)
```
96:54:9E:98:75:A8:6B:21:22:D1:37:6D:A6:54:35:D8:56:B3:87:8C
```

### 2. Release SHA-1 (for release builds)  
```
81:1D:7D:6B:85:20:14:A9:DE:C1:12:D6:3F:DC:25:F3:35:9E:84:3D
```

## Steps to Add SHA-1s

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **Android** OAuth 2.0 Client ID:
   - Client ID: `896459680164-31qmoo79jfnj4ca3fei6l2hjlb5c4ivg.apps.googleusercontent.com`
   - Package name: `com.findmypuppy.app`
4. Click **Edit** (pencil icon)
5. In **SHA-1 certificate fingerprint**, add **BOTH** fingerprints:
   ```
   96:54:9E:98:75:A8:6B:21:22:D1:37:6D:A6:54:35:D8:56:B3:87:8C
   81:1D:7D:6B:85:20:14:A9:DE:C1:12:D6:3F:DC:25:F3:35:9E:84:3D
   ```
6. Click **Save**
7. **Wait 5-10 minutes** for Google's servers to update

## After Adding SHA-1s

1. **Uninstall** the app: `adb uninstall com.findmypuppy.app`
2. **Reinstall** the release APK: `adb install android/app/release/app-release.apk`
3. **Clear app data**: `adb shell pm clear com.findmypuppy.app`
4. **Test Google Sign-In** - it should work now!

## Current Configuration

- **Package Name**: `com.findmypuppy.app`
- **Web Client ID** (for `requestIdToken`): `896459680164-aa61o2u96qrscu10ia9g0l40agca0q6i.apps.googleusercontent.com`
- **Android Client ID** (for OAuth config): `896459680164-31qmoo79jfnj4ca3fei6l2hjlb5c4ivg.apps.googleusercontent.com`

## Why Both SHA-1s?

- **Debug SHA-1**: Used when you build with `./gradlew assembleDebug` or run from Android Studio
- **Release SHA-1**: Used when you build with `./gradlew assembleRelease` or install a signed release APK

Both need to be registered so Google Sign-In works regardless of which build type you use.

## Troubleshooting

If sign-in still fails after adding both SHA-1s:

1. **Wait longer**: Google's servers can take up to 10 minutes to propagate changes
2. **Verify SHA-1s**: Double-check both SHA-1s are correctly added (no extra spaces, correct format)
3. **Check package name**: Ensure it's exactly `com.findmypuppy.app` in Google Cloud Console
4. **Check logs**: Run `adb logcat | grep -i "NativeGoogleAuth\|ApiException\|OAuth2"` to see detailed errors
