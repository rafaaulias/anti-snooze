# Anti-Snooze Alarm — Direct Mobile Installation & Expo Conversion Guide

This guide gives you the exact, step-by-step instructions to install this app directly on your physical mobile phone (iPhone or Android), either instantly without building, or as a native React Native Expo app.

---

## 1. Option A: Install Directly on Your Phone in 30 Seconds (Web PWA)

No build tools, Xcode, or Android Studio required. The app is 100% responsive (375x812 mobile layout) and includes Web Vibration and Web Audio synthesizers.

### On iPhone (iOS Safari):
1. Open the preview URL or shared URL in **Safari** on your iPhone.
2. Tap the **Share button** at the bottom (the square icon with the arrow pointing up).
3. Scroll down and select **"Add to Home Screen"**.
4. Confirm by tapping **"Add"** in the top right.
5. The Anti-Snooze app icon now appears on your home screen. When you open it, it launches in full-screen standalone mode with no browser tabs, search bars, or browser chrome!

### On Android (Chrome):
1. Open the URL in **Google Chrome** on your Android device.
2. Tap the **three-dot menu (⋮)** in the top right.
3. Tap **"Install app"** (or **"Add to Home screen"**).
4. Tap **"Install"**.
5. It will install as an app on your home screen and app drawer, with native hardware haptic vibration (`navigator.vibrate`) enabled.

---

## 2. Option B: Run Directly on Your Phone via Expo Go (Native Accelerometer & Audio)

To run this as a real native app using your phone's physical hardware accelerometer, native haptics, and background audio:

### Step 1: Install Expo Go on Your Phone
- **iOS**: Download **Expo Go** from the Apple App Store.
- **Android**: Download **Expo Go** from the Google Play Store.

### Step 2: Set Up the Project on Your Computer
In your terminal, run:
```bash
# 1. Create a new Expo app with TypeScript
npx create-expo-app anti-snooze-mobile --template blank-typescript
cd anti-snooze-mobile

# 2. Install the necessary native hardware modules
npx expo install expo-sensors expo-av expo-haptics @react-native-async-storage/async-storage expo-status-bar
```

### Step 3: Copy the React Native Code
Replace the contents of `App.tsx` with the complete React Native Expo implementation (found in `PRD.md` Section 6 or by tapping the **"Expo Go Code"** button in the Settings menu of the web app).

### Step 4: Launch and Scan
In your project directory, run:
```bash
npx expo start
```
- A large QR code will appear in your computer terminal.
- **On iPhone**: Open your default **Camera** app, point it at the QR code, and tap the yellow **"Open in Expo Go"** banner.
- **On Android**: Open the **Expo Go** app and tap **"Scan QR code"**.
- The app will compile and load immediately on your physical phone! You can test vigorous shaking with the real hardware accelerometer and solve math puzzles on the native keypad.

---

## 3. Option C: Build a Standalone Android APK (EAS Build)

To build a standalone `.apk` file that you can install directly on any Android phone without Expo Go:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in with your free Expo account:
   ```bash
   eas login
   ```
3. Configure the build:
   ```bash
   eas build:configure
   ```
4. In `eas.json`, configure the preview profile:
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```
5. Trigger the cloud build:
   ```bash
   eas build -p android --profile preview
   ```
6. When the build finishes, EAS gives you a download link and QR code. Download the `.apk` on your Android device, tap it to install, and you have a native standalone app!

---

## 4. How the Native Permissions Work

### Android Exact Alarms & Lock Screen Wake Up
In a production native app, alarms must wake up the phone when the screen is dark. The configuration in `app.json` includes:
- `SCHEDULE_EXACT_ALARM` & `USE_EXACT_ALARM`: Ensures the alarm fires down to the exact second even when the device is in deep Doze mode.
- `WAKE_LOCK`: Keeps CPU awake while the alarm rings.
- `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`: Prompts the user to exempt Anti-Snooze from aggressive OS battery managers.
- `SYSTEM_ALERT_WINDOW`: Allows the ringing screen to draw over the lock screen.

### iOS Audio & Motion Permissions
In `app.json` or `Info.plist`:
- `UIBackgroundModes: ["audio"]`: Enables sound playback when the app is in the background or device is locked.
- `NSMotionUsageDescription`: Required for iOS to grant accelerometer access to detect phone shakes.
