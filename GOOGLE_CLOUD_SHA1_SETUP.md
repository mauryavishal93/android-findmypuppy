# Google Cloud Console - Add BOTH SHA-1 Fingerprints

## ⚠️ IMPORTANT: You Need BOTH SHA-1 Fingerprints

Your app can be signed with either a **debug** or **release** keystore. Google Cloud Console needs **BOTH** SHA-1 fingerprints registered to work with both builds.

## SHA-1 Fingerprints to Add

### 1. Debug Build SHA-1 (Currently Installed)
```
96:54:9E:98:75:A8:6B:21:22:D1:37:6D:A6:54:35:D8:56:B3:87:8C
```
**This is what's currently installed on your emulator.**

### 2. Release Build SHA-1 (From Release APK)
```
81:1D:7D:6B:85:20:14:A9:DE:C1:12:D6:3F:DC:25:F3:35:9E:84:3D
```
**This is from your release APK at:** `/Users/mauryavishal/Project/MobileApp/android-findmypuppy1/android/app/release/app-release.apk`

## Steps to Add Both SHA-1s

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
7. Wait **5-10 minutes** for changes to propagate

## Verify Which APK is Installed

The currently installed APK on your emulator has SHA-1: `96:54:9E:98:75:A8:6B:21:22:D1:37:6D:A6:54:35:D8:56:B3:87:8C` (debug)

If you want to test with the release APK:
```bash
adb -s emulator-5554 install -r /Users/mauryavishal/Project/MobileApp/android-findmypuppy1/android/app/release/app-release.apk
```

## After Adding SHA-1s

1. Uninstall the app: `adb -s emulator-5554 uninstall com.findmypuppy.app`
2. Reinstall: `adb -s emulator-5554 install /path/to/app.apk`
3. Test Google Sign-In - it should work now!
