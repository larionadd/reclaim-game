# RECLAIM Android build

The Android app bundles the Vite game in a WebView and keeps saves on the device. Settings can export and import a JSON save through Android's document picker.

From the repository root, run `npm run build:android`, copy `dist/*` into `android/app/src/main/assets/web/`, then run Gradle `assembleDebug` from `android/` with Android SDK 34 and JDK 21. The debug APK is `android/app/build/outputs/apk/debug/app-debug.apk`.

The release APK needs a production signing key. The debug APK is installable for testing and retains its local save across updates installed with the same signing key.
