# Fix "Activity class does not exist" when running on emulator

The error happens when an **old app** (`com.findmypuppy.app`) is still installed and the launcher tries to use it.

## Fix (run these from project root)

1. **Uninstall both app versions from the emulator** (so the next install is clean):
   ```bash
   adb uninstall com.findmypuppy.app
   adb uninstall com.findmypuppy.app2
   ```

2. **Clean and rebuild** (from `android` folder):
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

3. **Run the app again** from Android Studio (Run > Run 'app') or:
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   adb shell am start -n com.findmypuppy.app2/.MainActivity
   ```

The project uses **com.findmypuppy.app2** everywhere. After removing the old `com.findmypuppy.app` install, the new app will launch correctly.
