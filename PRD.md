# Anti-Snooze — Product Requirements Document (PRD)

## 1. Executive Summary & Overview
**Anti-Snooze** is an offline-first, high-accountability mobile alarm application designed to permanently eliminate snoozing. Unlike traditional alarm applications that permit reflexive dismissals or infinite snooze intervals, Anti-Snooze enforces cognitive or physical wake-up challenges (**Math Arithmetic Puzzle** or **Physical Phone Shake**) before an alarm can be silenced.

- **Core Value Proposition**: *"We make sure you actually wake up."*
- **Architecture**: 100% local, offline-first execution ensuring zero cloud latency and absolute privacy for wake-up patterns.
- **Target Platforms**: Cross-platform compatibility for iOS & Android via React Native Expo (Expo Go compatible) and mobile Web/PWA.

---

## 2. Target User Personas
1. **Primary: Students (16–25)**
   - Daily early morning class commitments and varying weekly schedules.
   - History of setting multiple sequential alarms (e.g., 6:00, 6:15, 6:30) and turning them off while half-asleep.
2. **Secondary: Heavy Sleepers & Chronic Snoozers**
   - Individuals with high sleep inertia who need forced cognitive engagement to activate the prefrontal cortex.
3. **Tertiary: Disciplined Early Risers**
   - Goal-oriented users who track wake-up consistency, streaks, and reaction times.

---

## 3. Design Tokens & UI Guidelines
- **Typography**: Plus Jakarta Sans (Regular, Medium, SemiBold, Bold, ExtraBold).
- **Corner Radii Tokens**:
  - `8px`: Day chips, small tags, sub-controls, inputs.
  - `12px`: Alarm list cards, numeric keypad buttons, primary action buttons.
  - `16px`: Challenge progress containers, feature cards.
  - `24px` / `32px`: Modals, dialog sheets, device frames.
  - `Full Pill (9999px)`: Streak badges, dynamic island, toggle track.
- **Color Palette**:
  - `#000000` (Near-Black Primary)
  - `#FFFFFF` (Pure White Canvas / Surface)
  - `#F9F9F9` (Soft Neutral Container Background)
  - `#5E5E5E` (Muted Neutral for Secondary Labels & Metadata)
  - `#E5E5E5` / `#EBEBEB` (Subtle 1px Borders)
  - **`#FF7B00`**: Exclusively reserved for the active wake-up streak flame icon.

---

## 4. Current Implementation Status

### 4.1 Implemented Screens & Workflows
1. **Onboarding Screen (`OnboardingModal.tsx`)**:
   - Explicit permission disclosures:
     - **Exact Alarm Timing**: `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` permissions.
     - **Full-Screen Notification Intent**: Lock screen wake locks and high-priority alarms.
     - **Battery Optimization Exemption**: Prevents OS-level background task termination.
   - Primary "Grant Access & Start" onboarding action with local state persistence.

2. **Home Screen (`App.tsx` & `AlarmCard.tsx`)**:
   - List of scheduled alarms with large digit time presentation (`HH:MM AM/PM`).
   - Individual day chips (`M T W T F S S`) indicating active repeat schedules.
   - Custom labels and challenge type badges (`Math` difficulty / `Shake` count).
   - High-contrast toggle switch for instant enable/disable.
   - Quick testing trigger (`⚡ Test`) to preview ringing state on demand.
   - Floating Action Button (`+`) anchored to the bottom-right.
   - Clean empty state with quick alarm creation guidance.

3. **Create & Edit Alarm Modal (`AlarmModal.tsx`)**:
   - Large digit numeric time picker with quick AM/PM selector.
   - 7-day repeat selector pills with multi-select support.
   - Customizable alarm label text input.
   - Dual selectable challenge cards:
     - **Math Puzzle**: Easy, Medium, and Hard arithmetic configurations + problem count selector (1–3).
     - **Shake Phone**: Target shake thresholds (15, 30, 45 shakes).
   - Built-in sound tester for previewing escalating sirens.

4. **Alarm Ringing Screen (`RingingScreen.tsx`)**:
   - Full-screen immersion with dimmed background and acoustic pulse rings.
   - Dynamic live digital clock and custom alarm label.
   - Single prominent **"Start challenge"** button.
   - **Zero snooze shortcuts or dismiss gestures**.

5. **Challenge Execution Screen (`ChallengeScreen.tsx`)**:
   - **Math Puzzle Variant**:
     - Arithmetic problem generator scaled to difficulty.
     - 12-key tactile numeric keypad (1–9, Clear, 0, Backspace).
     - Error shake animation and buzz tone on incorrect entry; progression fanfare on correct entry.
   - **Shake Phone Variant**:
     - Circular SVG progress ring tracking real-time completion percentage (0–100%).
     - Responsive mobile motion handling via device accelerometer.
     - Interactive physical tap / spacebar / shake fallback for desktop/browser testing.

6. **Success Screen (`SuccessScreen.tsx`)**:
   - Immediate confirmation: *"Alarm dismissed"*.
   - Dismissal timestamp and total wake-up duration metric (in seconds).
   - Streak counter displaying consecutive successful wake-up days with the `#FF7B00` flame.

7. **Expo Go React Native Code Viewer (`ExpoExportModal.tsx`)**:
   - Integrated tabbed viewer exposing `App.tsx`, `package.json`, `app.json`, and terminal installation instructions for physical mobile testing in Expo Go.

---

## 5. Sensor, Audio & Hardware Integration Details

### 5.1 Motion & Accelerometer Detection
- **Mobile Browsers & Web**: Implemented in `src/services/motionService.ts` using the W3C `devicemotion` API. Supports iOS 13+ explicit permission handshake (`DeviceMotionEvent.requestPermission()`). Computes acceleration deltas across $X, Y, Z$ axes with a velocity threshold filter.
- **Expo / React Native**: Uses `expo-sensors` (`Accelerometer.addListener`) with 100ms update intervals calculating Euclidean vector magnitude:
  $$\|A\| = \sqrt{x^2 + y^2 + z^2} > 1.8g$$

### 5.2 Audio Escalation Engine
- Built using Web Audio API synthesis (`src/services/soundService.ts`) and `expo-av`.
- Emits dual-frequency harmonic bursts (880Hz / 1320Hz) configured to bypass silent profiles.
- Automated volume escalation steps from 35% up to 85% over elapsed time.

### 5.3 Local Offline Storage
- Persistent key-value store (`localStorage` in web, `@react-native-async-storage/async-storage` in Expo).
- No external network requests required; zero analytics or telemetry tracking by default.

---

## 6. Further Development Roadmap & Next Iterations

### Phase 2: Enhanced Native Alarm Scheduling (Next Sprint)
- **Expo Background Tasks & Native Alarms**:
  - Integration with `expo-notifications` background task manager and Android `AlarmManager` for scheduled wakeups when the app process is closed.
  - Native iOS Critical Alerts entitlement (`UNNotificationCategory`) allowing sound during Sleep Focus mode.

### Phase 3: Advanced Wake-Up Challenges
- **Barcode / QR Code Scan Challenge**:
  - Requires user to get out of bed and scan a physical item in their bathroom or kitchen (e.g., toothpaste, coffee machine).
- **Typing Challenge**:
  - Typing an inspiring quote or tongue-twister without typographical errors.
- **Step Counter Challenge**:
  - Using pedometer sensors (`expo-sensors` Pedometer) to verify 20–50 steps taken.

### Phase 4: Sleep Inertia Analytics & Streaks
- **Wake-up Speed Graph**: Historical chart showing wake-up latency across weekdays vs. weekends.
- **Habit Export**: Ability to export wake-up logs as CSV/JSON or sync with Apple Health / Google Health Connect.
- **Emergency Snooze Token**: Optional ultra-strict mode allowing maximum 1 emergency 3-minute snooze per week, earned only through continuous 5-day streaks.
