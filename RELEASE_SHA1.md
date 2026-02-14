# Release APK SHA-1 Certificate Fingerprint

## SHA-1 from Release APK
```
81:1D:7D:6B:85:20:14:A9:DE:C1:12:D6:3F:DC:25:F3:35:9E:84:3D
```

## How to Add to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **Android** OAuth 2.0 Client ID:
   - Client ID: `896459680164-31qmoo79jfnj4ca3fei6l2hjlb5c4ivg.apps.googleusercontent.com`
   - Package name: `com.findmypuppy.app`
4. Click **Edit** (pencil icon)
5. In **SHA-1 certificate fingerprint**, add:
   ```
   81:1D:7D:6B:85:20:14:A9:DE:C1:12:D6:3F:DC:25:F3:35:9E:84:3D
   ```
6. Click **Save**

## Certificate Details
- **DN**: C=IN, ST=KA, L=Bangalore, O=findmypuppy, OU=1, CN=findmypuppy
- **SHA-256**: 70edcb4aac1705c2b60c2f60752c8291502a4dd1ed8f51b3f01567d2e7438283
- **SHA-1**: 81:1D:7D:6B:85:20:14:A9:DE:C1:12:D6:3F:DC:25:F3:35:9E:84:3D
- **MD5**: df2ed5ad5f988e35b10a3332e8a4408f

## Important Notes

- **Debug builds** use a different SHA-1: `96:54:9E:98:75:A8:6B:21:22:D1:37:6D:A6:54:35:D8:56:B3:87:8C`
- **Release builds** use the SHA-1 above: `81:1D:7D:6B:85:20:14:A9:DE:C1:12:D6:3F:DC:25:F3:35:9E:84:3D`
- You need to add **BOTH** SHA-1 fingerprints to your Android OAuth client if you want to test both debug and release builds
- Changes can take 5-10 minutes to propagate

## Command to Extract SHA-1 from APK

If you need to extract SHA-1 from any APK in the future:

```bash
# Using apksigner (recommended)
apksigner verify --print-certs /path/to/app.apk | grep "SHA-1 digest"

# Or using keytool (if APK has .RSA file)
unzip -p /path/to/app.apk META-INF/*.RSA | keytool -printcert | grep SHA1
```
