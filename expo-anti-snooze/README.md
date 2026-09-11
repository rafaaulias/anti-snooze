# Anti-Snooze — Complete React Native / Expo Project

This folder contains the complete, 100% native React Native application ready to be run on your iPhone or Android phone via Expo Go or compiled into an APK/IPA.

---

## Quick Start (Run on your Phone in 3 Minutes)

### 1. Prerequisites
- Install **Node.js** (v18+) on your computer.
- Install **Expo Go** on your physical phone:
  - **iOS**: [Expo Go on Apple App Store](https://apps.apple.com/app/expo-go/id982107779)
  - **Android**: [Expo Go on Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 2. Run the App
From this folder (`expo-anti-snooze`):

```bash
# 1. Install dependencies
npm install

# 2. Start the Expo development server
npx expo start
```

### 3. Scan & Open on Your Phone
- **On iPhone**: Open your default **Camera** app, point it at the terminal QR code, and tap **"Open in Expo Go"**.
- **On Android**: Open the **Expo Go** app, tap **"Scan QR code"**, and scan the terminal QR code.

The application runs immediately on your real hardware!

---

## Native Modules Used

- **`expo-sensors` (`Accelerometer`)**: Real hardware accelerometer physics calculation for the shake-to-dismiss challenge ($\sqrt{x^2 + y^2 + z^2} > 1.8\text{ G}$).
- **`expo-haptics`**: Real native tactile pulses on switch toggles, keypad presses, and victory confirmation.
- **`expo-av`**: Real native background audio playback with `playsInSilentModeIOS` enabled.
- **`@react-native-async-storage/async-storage`**: 100% offline local flash storage for alarms, streaks, and wake history.
- **`expo-status-bar`**: Dynamic light/dark status bar styling.
