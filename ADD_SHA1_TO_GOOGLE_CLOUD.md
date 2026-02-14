# CRITICAL: Add SHA-1 to Google Cloud Console

## The Problem
Google Sign-In shows "Sign-in was cancelled" after selecting an account because **the app's SHA-1 is not registered** in Google Cloud Console.

## The Solution

### Step 1: Your Debug SHA-1
```
96:54:9E:98:75:A8:6B:21:22:D1:37:6D:A6:54:35:D8:56:B3:87:8C
```

### Step 2: Add to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your **Android** OAuth 2.0 Client ID:
   - Client ID: `896459680164-31qmoo79jfnj4ca3fei6l2hjlb5c4ivg.apps.googleusercontent.com`
   - Package name: `com.findmypuppy.app`
5. Click **Edit** (pencil icon)
6. In **SHA-1 certificate fingerprint**, add:
   ```
   96:54:9E:98:75:A8:6B:21:22:D1:37:6D:A6:54:35:D8:56:B3:87:8C
   ```
7. Click **Save**

### Step 3: Wait and Test
- Changes can take **5-10 minutes** to propagate
- Uninstall the app from the emulator
- Reinstall and test Google Sign-In again

## Verification
After adding SHA-1, when you tap "Sign in with Google" and select an account, you should see:
- Account selection completes successfully
- No "Sign-in was cancelled" error
- You are logged into the app

## For Release Builds
When building a release APK, you'll need to add the **release keystore's SHA-1** as well:
```bash
cd android
./gradlew signingReport
# Look for "Variant: release" SHA-1 and add that too
```
