# Anti-Snooze Alarm — Local Setup & Mobile Installation Guide

This guide explains how to move this project to your local IDE (VS Code, Cursor, WebStorm, etc.), run it on your computer, and install/run it directly on your physical mobile device (Android & iOS).

---

## 1. How User Accounts & Storage Work (100% Offline-First)

As requested in your Anti-Snooze specification, this app is built strictly as a **zero-cloud, offline-first application**:

- **No Remote Servers or Databases:** The app **never** sends your alarms, wake-up times, or challenge history over the internet.
- **Local Sandbox Storage:**
  - **In Web / PWA:** Alarms and wake-up streaks are stored securely in your browser's local sandbox (`localStorage` / IndexedDB).
  - **In React Native / Mobile:** Alarms are stored on the phone's native flash storage using `@react-native-async-storage/async-storage`.
- **Private & Ephemeral Identity:**
  - If you see a user profile or name (e.g. "Alex" or custom name), it is merely a **local profile label** saved on your phone.
  - No email login, password hashing, or cloud syncing is needed or performed. If you turn off Wi-Fi and Cellular data, your alarm, sound synthesizer, and challenge engine continue to work seamlessly.

---

## 2. Moving the Project to Your Local IDE

You can download or export the code directly from Google AI Studio and run it locally with Node.js.

### Step 1: Export or Clone
1. In Google AI Studio, click the **Settings** or **Export** menu in the top right.
2. Select **Export to ZIP** or **Push to GitHub**.
3. Extract the ZIP file into a folder on your computer (e.g., `~/Projects/anti-snooze`).

### Step 2: Open in Your IDE
Open the folder in **VS Code**, **Cursor**, or any editor of your choice:
```bash
code ~/Projects/anti-snooze
```

### Step 3: Install Dependencies
Open your terminal inside the project directory and run:
```bash
npm install
```

### Step 4: Start the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You can inspect, edit files in `/src`, and see changes immediately!

---

## 3. How to Easily Change the Brand Logo

If you want to swap out the logo with your own design or image:

### Option A: Use Your Own Image File (PNG, SVG, JPG)
1. Drop your image file into the `public/` directory (e.g. `public/my-logo.png`).
2. Open `src/components/BrandLogo.tsx`.
3. Change line 19:
   ```ts
   export const CUSTOM_LOGO_IMAGE_URL: string | null = '/my-logo.png';
   ```
4. Done! The app will immediately display your custom image everywhere.

### Option B: Paste Your Own SVG Code
1. Open `src/components/BrandLogo.tsx`.
2. Replace the `<svg> ... </svg>` block with your own SVG elements.

---

## 4. Installing the App on Physical Mobile Devices

You have two simple ways to install and run this on your physical phone:

### Method A: Progressive Web App (PWA) / Add to Home Screen (Easiest — No App Store Needed!)

Because the app is responsive (375x812 mobile layout) and includes Web Vibration and Web Audio synthesizers:
1. Run the app locally on your computer with your local IP (`npm run dev -- --host 0.0.0.0`) or deploy the web app.
2. On your **iPhone (Safari)**:
   - Open the web URL.
   - Tap the **Share** button (box with upward arrow).
   - Tap **"Add to Home Screen"**.
   - The app now launches full-screen with no browser address bar!
3. On your **Android (Chrome)**:
   - Open the web URL.
   - Tap the three-dot menu `⋮`.
   - Tap **"Install app"** or **"Add to Home screen"**.
   - Supports physical hardware vibration (`navigator.vibrate`) on toggle switches and dismissals!

---

### Method B: Native React Native Mobile App via Expo Go (iOS & Android)

If you want native background alarm capabilities (`expo-sensors` accelerometer for shaking, `expo-av`, and `react-native-alarm-notification`):

1. **Install Node.js** (v18 or v20+) on your computer.
2. Create an Expo mobile project on your machine:
   ```bash
   npx create-expo-app anti-snooze-mobile --template blank-typescript
   cd anti-snooze-mobile
   ```
3. Install the required native hardware modules:
   ```bash
   npx expo install expo-sensors expo-av @react-native-async-storage/async-storage expo-status-bar
   ```
4. Copy the complete React Native code provided directly inside the app:
   - In the running app, navigate to **Settings tab → Tap "Expo Go Code"**.
   - Copy the ready-to-run `App.tsx` and paste it into your local `App.tsx`.
5. Start Expo:
   ```bash
   npx expo start
   ```
6. **Install on your phone:**
   - Download the free **Expo Go** app from the App Store (iOS) or Google Play Store (Android).
   - Scan the QR code displayed in your computer terminal with your phone camera (iOS) or the Expo Go app (Android).
   - The app loads on your physical phone with full hardware accelerometer shake sensing, haptics, and escalating audio!

---

## 5. Summary of Architecture & Haptic Features
- **Haptic Vibration:** Built into `src/services/hapticService.ts` using native waveforms:
  - Toggle switches: 35–45ms tactile pulse.
  - Alarm dismissal: 3-phase victory pulse `[80ms, 50ms, 160ms]`.
  - Math keypad & Shake: responsive ticks on every interaction.
- **Card Sizing:** The toggle switch and day chips have zero overflow and preserve generous whitespace.
