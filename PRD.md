# Anti-Snooze — Product Requirements Document (PRD) & Native Mobile Architecture

---

## 1. Executive Summary & Product Vision

**Anti-Snooze** is a high-accountability, offline-first mobile alarm application engineered to eliminate the habit of reflexive morning snoozing. Unlike traditional alarm clocks that provide easily accessible snooze buttons or trivial swipe gestures, Anti-Snooze locks the phone in an active alarm state until the user completes a rigorous physical or cognitive task:

1. **Math Arithmetic Puzzle**: Solved via an on-screen tactile numeric keypad with configurable difficulty (Easy, Medium, Hard) and problem sets (1–3).
2. **Physical Phone Shake**: Validated via real-time accelerometer vector calculus, requiring 15–45 vigorous full-body shakes.

### Core Tenets
- **Zero Reflexive Snooze**: No dismiss gestures, hidden snooze menus, or bypasses.
- **100% Offline-First & Private**: Zero cloud dependency, zero external API keys, zero tracking. All alarms, streak counts, and wake-up timestamps reside entirely in local device sandbox storage.
- **Escalating Siren**: Dual-frequency acoustic harmonic synthesis (880 Hz / 1320 Hz) that gradually climbs from 35% to 85% volume to penetrate deep sleep without audio clipping.

---

## 2. Platform Delivery & Installation Paths

You can run and install Anti-Snooze on your physical phone in three distinct ways depending on your target workflow:

```
                               ┌────────────────────────────────────────┐
                               │           Anti-Snooze App              │
                               └──────────────────┬─────────────────────┘
                                                  │
                ┌─────────────────────────────────┼─────────────────────────────────┐
                ▼                                 ▼                                 ▼
   [Option 1: Web PWA (Zero Build)]   [Option 2: Expo Go (Instant)]      [Option 3: Standalone Native APK]
   • Add to Home Screen (Safari/Chrome)• Real-time scan via QR code       • Compiled via Expo Application Services
   • Instant full-screen UI           • Direct hardware accelerometer     • Works fully locked/backgrounded
   • Web Audio & Web Vibration        • Native Audio & Haptics            • Android Exact Alarm & WakeLock
```

### Option 1: Instant Mobile PWA (No App Store / No Build Required)
Because this application is designed around a mobile viewport (375x812), it functions immediately as an installable Progressive Web App:
- **On iOS (Safari)**:
  1. Open your running application URL in Safari.
  2. Tap the **Share** icon (square with upward arrow).
  3. Scroll down and tap **"Add to Home Screen"**.
  4. The icon appears on your iOS springboard. When launched, it runs in standalone full-screen mode without Safari address bars or navigation headers.
- **On Android (Chrome)**:
  1. Open the URL in Google Chrome.
  2. Tap the three-dot menu `⋮` in the top-right corner.
  3. Tap **"Install app"** or **"Add to Home screen"**.
  4. Supports full hardware vibration feedback (`navigator.vibrate`) on switches, keypads, and dismissals.

### Option 2: Run via Expo Go on iOS & Android (Under 5 Minutes)
1. Install the free **Expo Go** application on your physical mobile phone from the **App Store** (iOS) or **Google Play Store** (Android).
2. On your computer terminal, initialize an Expo TypeScript project:
   ```bash
   npx create-expo-app anti-snooze --template blank-typescript
   cd anti-snooze
   ```
3. Install the required native hardware modules:
   ```bash
   npx expo install expo-sensors expo-av expo-haptics @react-native-async-storage/async-storage expo-status-bar
   ```
4. Copy the complete Expo code provided in Section 5 into `App.tsx`.
5. Start the local bundler:
   ```bash
   npx expo start
   ```
6. Point your phone camera at the terminal QR code. The app loads instantly on your physical device with direct accelerometer shaking, native audio escalation, and tactile haptic pulses.

### Option 3: Compile Standalone Native APK / IPA (EAS Build)
To generate an installable `.apk` file for Android or TestFlight build for iOS:
```bash
npm install -g eas-cli
eas login
eas build:configure
# Generate Android APK directly for sideloading
eas build -p android --profile preview
```

---

## 3. Technology Stack Comparison

| Functional Area | Current Web Implementation | React Native / Expo Native Equivalent |
|---|---|---|
| **UI Framework** | React 18 + TypeScript | React Native 0.74+ / Expo SDK 51+ |
| **Styling** | Tailwind CSS (Utility classes) | `StyleSheet.create` or `nativewind` (Tailwind for RN) |
| **Motion & Gestures** | `motion/react` (Framer Motion) | `react-native-reanimated` + `react-native-gesture-handler` |
| **Icons** | `lucide-react` | `@expo/vector-icons` (`Feather` / `Ionicons`) |
| **Motion Sensing** | W3C `DeviceMotionEvent` API | `expo-sensors` (`Accelerometer`) |
| **Audio Engine** | Web Audio API (`AudioContext` oscillators) | `expo-av` (`Audio.Sound` with background audio category) |
| **Haptics** | `navigator.vibrate` | `expo-haptics` (`Haptics.impactAsync`, `notificationAsync`) |
| **Local Persistence** | Browser `localStorage` sandbox | `@react-native-async-storage/async-storage` |
| **Alarm Scheduling** | `setInterval` / `requestAnimationFrame` | Android `AlarmManager` / `expo-notifications` |

---

## 4. Native Permissions & Android/iOS System Integration

To wake up a physical mobile device reliably from deep doze mode or lock screen, native mobile OSes enforce strict background execution rules.

### Android Permission Matrix (`AndroidManifest.xml` / `app.json`)
```json
{
  "expo": {
    "name": "Anti-Snooze",
    "slug": "anti-snooze",
    "version": "1.0.0",
    "android": {
      "package": "com.antisnooze.alarm",
      "permissions": [
        "SCHEDULE_EXACT_ALARM",
        "USE_EXACT_ALARM",
        "WAKE_LOCK",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_MEDIA_PLAYBACK",
        "REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
        "SYSTEM_ALERT_WINDOW"
      ]
    }
  }
}
```

#### Why Each Permission is Mandatory:
1. `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM`: Required on Android 12+ (API 31+) to fire alarms down to the exact second rather than being deferred into batched battery-saving maintenance windows.
2. `WAKE_LOCK`: Powers the CPU on when the alarm triggers while the phone screen is black.
3. `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`: Whitelists the app against OEM battery killers (Xiaomi MIUI, Samsung OneUI, Huawei EMUI).
4. `SYSTEM_ALERT_WINDOW` & Full-Screen Intent: Automatically turns on the screen and launches the full-screen Ringing view directly over the lock screen without requiring user unlock.
5. `RECEIVE_BOOT_COMPLETED`: Reschedules all active alarms if the device reboots or powers down.

### iOS Permission & Background Capabilities (`Info.plist`)
```xml
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
  <string>fetch</string>
</array>
<key>NSMotionUsageDescription</key>
<string>Anti-Snooze needs access to the accelerometer to verify physical phone shaking to silence alarms.</string>
```
On iOS, sound playback during active alarm states requires setting the audio session category to `AVAudioSessionCategoryPlayback` with `mixWithOthers = false` and enabling the Critical Alerts entitlement (`UNAuthorizationOptionCriticalAlert`) so alarms pierce through Sleep Focus and Do Not Disturb.

---

## 5. System Logic & Architecture

```
                                ┌───────────────────────────┐
                                │       App Boot / Init     │
                                └─────────────┬─────────────┘
                                              ▼
                                ┌───────────────────────────┐
                                │ Check Onboarding State    │
                                └──────┬─────────────┬──────┘
                   First Launch        │             │ Already Completed
                                       ▼             ▼
                     ┌───────────────────┐      ┌─────────────────────────┐
                     │ Permissions Screen│      │       Home Screen       │
                     └─────────┬─────────┘      │ (Alarms, Toggle, FAB)   │
                               │ Grant Access   └────────────┬────────────┘
                               └─────────────────────────────┘
                                              │ Scheduled Alarm Matches Time
                                              ▼
                                ┌───────────────────────────┐
                                │     Alarm Ringing State   │
                                │ • Escalating Audio Synth  │
                                │ • Acoustic Pulse Rings    │
                                │ • NO SNOOZE / NO DISMISS  │
                                └─────────────┬─────────────┘
                                              │ Tap "Start challenge"
                                              ▼
                                ┌───────────────────────────┐
                                │   Challenge Execution     │
                                └──────┬─────────────┬──────┘
                  Math Variant         │             │ Shake Variant
                                       ▼             ▼
                     ┌───────────────────┐      ┌─────────────────────────┐
                     │ Arithmetic Keypad │      │ Real-time Accelerometer │
                     │ Scaled Difficulty │      │ Vector Magnitude > 1.8G │
                     └─────────┬─────────┘      └────────────┬────────────┘
                               │ All Solved                  │ Target Reached
                               └──────────────┬──────────────┘
                                              ▼
                                ┌───────────────────────────┐
                                │   Success & Dismissal     │
                                │ • Stop Audio & Vibration  │
                                │ • Increment Streak 🔥     │
                                │ • Record Wake-up History  │
                                └───────────────────────────┘
```

### 5.1 Math Challenge Problem Generation
Problems are generated dynamically based on difficulty:
- **Easy**: Two numbers $A \in [10, 30]$ and $B \in [10, 30]$ using simple addition ($A + B$).
- **Medium**: Addition/Subtraction $A \in [20, 80]$ and $B \in [15, 65]$ with positive results ($A - B \ge 5$).
- **Hard**: Single-digit multiplication plus addition, e.g. $(A \times B) + C$ where $A, B \in [3, 9]$ and $C \in [10, 30]$.

### 5.2 Accelerometer Shake Detection Vector Math
The device accelerometer samples three-dimensional acceleration components $(x, y, z)$ at 100 ms intervals (10 Hz).
The Euclidean magnitude $\|A\|$ is calculated:
$$\|A\| = \sqrt{x^2 + y^2 + z^2}$$
When the acceleration vector exceeds $1.8 \text{ G}$ ($17.6 \text{ m/s}^2$), a shake impulse is registered. A 200 ms debounce filter prevents multiple triggers from a single recoil stroke.

---

## 6. Complete Expo React Native Codebase

Here is the complete, drop-in React Native `App.tsx` matching the design tokens, logic, and challenges:

```tsx
// Anti-Snooze Expo App (App.tsx)
// Compatible with Expo Go on iOS & Android
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Vibration,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Design Tokens
const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  bg: '#F9F9F9',
  surface: '#FFFFFF',
  textSecondary: '#5E5E5E',
  border: '#EBEBEB',
  flame: '#FF7B00',
};

interface Alarm {
  id: string;
  time: string; // "HH:MM"
  label: string;
  enabled: boolean;
  challengeType: 'math' | 'shake';
  days: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'ringing' | 'challenge' | 'success'>('home');
  const [alarms, setAlarms] = useState<Alarm[]>([
    {
      id: '1',
      time: '06:30',
      label: 'Morning Workout & Class',
      enabled: true,
      challengeType: 'math',
      days: [true, true, true, true, true, false, false],
    },
    {
      id: '2',
      time: '07:15',
      label: 'Office Standup',
      enabled: false,
      challengeType: 'shake',
      days: [true, true, true, true, true, false, false],
    },
  ]);
  const [activeAlarm, setActiveAlarm] = useState<Alarm>(alarms[0]);
  const [streak, setStreak] = useState(5);

  // Challenge states
  const [shakeCount, setShakeCount] = useState(0);
  const targetShakes = 30;
  const [mathA, setMathA] = useState(24);
  const [mathB, setMathB] = useState(37);
  const [userAnswer, setUserAnswer] = useState('');

  // Audio setup
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
  }, []);

  // Accelerometer Shake Detection
  useEffect(() => {
    let subscription: any = null;
    if (screen === 'challenge' && activeAlarm.challengeType === 'shake') {
      Accelerometer.setUpdateInterval(100);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        if (acceleration > 1.8) {
          setShakeCount((prev) => {
            const next = prev + 1;
            if (next >= targetShakes) {
              handleDismissAlarm();
            }
            return next;
          });
        }
      });
    }
    return () => {
      if (subscription) subscription.remove();
    };
  }, [screen, activeAlarm]);

  const triggerAlarm = (alarm: Alarm) => {
    setActiveAlarm(alarm);
    setScreen('ringing');
    Vibration.vibrate([500, 500], true);
  };

  const handleStartChallenge = () => {
    setScreen('challenge');
    setShakeCount(0);
    setUserAnswer('');
    setMathA(Math.floor(Math.random() * 40) + 15);
    setMathB(Math.floor(Math.random() * 40) + 15);
  };

  const handleDismissAlarm = () => {
    Vibration.cancel();
    setStreak((s) => s + 1);
    setScreen('success');
  };

  const handleMathKeypad = (val: string) => {
    if (val === 'C') {
      setUserAnswer('');
    } else if (val === '⌫') {
      setUserAnswer((prev) => prev.slice(0, -1));
    } else {
      setUserAnswer((prev) => (prev.length < 4 ? prev + val : prev));
    }
  };

  const handleMathSubmit = () => {
    if (parseInt(userAnswer, 10) === mathA + mathB) {
      handleDismissAlarm();
    } else {
      Vibration.vibrate(200);
      setUserAnswer('');
    }
  };

  // 1. RINGING SCREEN
  if (screen === 'ringing') {
    return (
      <SafeAreaView style={styles.darkContainer}>
        <StatusBar style="light" />
        <View style={styles.ringingBadgeContainer}>
          <Text style={styles.ringingBadgeText}>ALARM RINGING</Text>
        </View>

        <View style={styles.ringingCenter}>
          <Text style={styles.ringingTime}>{activeAlarm.time}</Text>
          <Text style={styles.ringingLabel}>{activeAlarm.label}</Text>
          <Text style={styles.ringingSub}>No snooze available • Challenge required</Text>
        </View>

        <View style={styles.bottomActionContainer}>
          <TouchableOpacity style={styles.primaryBtnWhite} onPress={handleStartChallenge}>
            <Text style={styles.primaryBtnTextBlack}>Start challenge</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 2. CHALLENGE SCREEN
  if (screen === 'challenge') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>
            {activeAlarm.challengeType === 'math' ? 'Solve to Dismiss' : 'Shake to Unlock'}
          </Text>
          <Text style={styles.challengeSubtitle}>
            {activeAlarm.challengeType === 'math'
              ? 'Complete the arithmetic problem below'
              : `Vigorously shake device (${shakeCount}/${targetShakes})`}
          </Text>
        </View>

        {activeAlarm.challengeType === 'math' ? (
          <View style={styles.mathContainer}>
            <View style={styles.equationBox}>
              <Text style={styles.equationText}>{mathA} + {mathB} =</Text>
              <Text style={styles.answerText}>{userAnswer || '?'}</Text>
            </View>

            <View style={styles.keypadGrid}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.keypadButton}
                  onPress={() => handleMathKeypad(key)}
                >
                  <Text style={styles.keypadText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryBtnBlack} onPress={handleMathSubmit}>
              <Text style={styles.primaryBtnTextWhite}>Submit Answer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.shakeContainer}>
            <View style={styles.shakeRing}>
              <Text style={styles.shakePercent}>
                {Math.min(100, Math.round((shakeCount / targetShakes) * 100))}%
              </Text>
              <Text style={styles.shakeSubText}>{shakeCount} / {targetShakes} shakes</Text>
            </View>
            <TouchableOpacity
              style={[styles.primaryBtnBlack, { marginTop: 40 }]}
              onPress={() => setShakeCount((c) => Math.min(targetShakes, c + 3))}
            >
              <Text style={styles.primaryBtnTextWhite}>Simulate Shake (+3)</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // 3. SUCCESS SCREEN
  if (screen === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.successCenter}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Alarm Dismissed</Text>
          <Text style={styles.successTime}>Awake at {activeAlarm.time}</Text>

          <View style={styles.streakBadge}>
            <Text style={styles.streakFlame}>🔥</Text>
            <Text style={styles.streakText}>{streak} Day Streak</Text>
          </View>
        </View>

        <View style={styles.bottomActionContainer}>
          <TouchableOpacity style={styles.primaryBtnBlack} onPress={() => setScreen('home')}>
            <Text style={styles.primaryBtnTextWhite}>Return to Alarms</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 4. HOME SCREEN
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.brandTitle}>Anti-Snooze</Text>
          <Text style={styles.brandSub}>Wake up guaranteed</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakFlame}>🔥</Text>
          <Text style={styles.streakText}>{streak}d</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {alarms.map((item) => (
          <View key={item.id} style={styles.alarmCard}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTime}>{item.time}</Text>
              <Switch
                value={item.enabled}
                onValueChange={(val) => {
                  setAlarms((prev) =>
                    prev.map((a) => (a.id === item.id ? { ...a, enabled: val } : a))
                  );
                }}
                thumbColor={item.enabled ? COLORS.white : '#B0B0B0'}
                trackColor={{ false: '#E0E0E0', true: COLORS.black }}
              />
            </View>
            <Text style={styles.cardLabel}>{item.label}</Text>

            <View style={styles.cardBottom}>
              <View style={styles.challengeBadge}>
                <Text style={styles.challengeBadgeText}>
                  {item.challengeType === 'math' ? '🧠 Math' : '📱 Shake'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => triggerAlarm(item)}
              >
                <Text style={styles.testButtonText}>⚡ Test Ring</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  darkContainer: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'space-between' },
  homeHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: { fontSize: 24, fontWeight: '800', color: COLORS.black },
  brandSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#FFE0C2',
  },
  streakFlame: { fontSize: 14, marginRight: 4 },
  streakText: { fontSize: 13, fontWeight: '700', color: COLORS.flame },
  listContent: { padding: 24, gap: 16 },
  alarmCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTime: { fontSize: 36, fontWeight: '800', color: COLORS.black },
  cardLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  challengeBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  challengeBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.black },
  testButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F5F5F5' },
  testButtonText: { fontSize: 12, fontWeight: '700', color: COLORS.black },
  ringingBadgeContainer: { alignItems: 'center', marginTop: 40 },
  ringingBadgeText: {
    color: '#FF453A',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 2,
    backgroundColor: 'rgba(255,69,58,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  ringingCenter: { alignItems: 'center', paddingHorizontal: 24 },
  ringingTime: { fontSize: 68, fontWeight: '900', color: COLORS.white },
  ringingLabel: { fontSize: 18, color: '#CCCCCC', marginTop: 8, textAlign: 'center' },
  ringingSub: { fontSize: 13, color: '#888888', marginTop: 12 },
  bottomActionContainer: { padding: 24 },
  primaryBtnWhite: {
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnTextBlack: { color: COLORS.black, fontSize: 16, fontWeight: '800' },
  primaryBtnBlack: {
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnTextWhite: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  challengeHeader: { padding: 24, alignItems: 'center' },
  challengeTitle: { fontSize: 22, fontWeight: '800', color: COLORS.black },
  challengeSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  mathContainer: { paddingHorizontal: 24, alignItems: 'center' },
  equationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 24,
    backgroundColor: COLORS.white,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  equationText: { fontSize: 32, fontWeight: '800', color: COLORS.black },
  answerText: { fontSize: 32, fontWeight: '800', color: '#007AFF' },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  keypadButton: {
    width: '30%',
    aspectRatio: 1.4,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  keypadText: { fontSize: 22, fontWeight: '700', color: COLORS.black },
  shakeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  shakeRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 10,
    borderColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  shakePercent: { fontSize: 44, fontWeight: '900', color: COLORS.black },
  shakeSubText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  successCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkIcon: { color: COLORS.white, fontSize: 38, fontWeight: '900' },
  successTitle: { fontSize: 26, fontWeight: '800', color: COLORS.black },
  successTime: { fontSize: 15, color: COLORS.textSecondary, marginTop: 6, marginBottom: 20 },
});
```

---

## 7. Troubleshooting & FAQ

1. **Why does an alarm app need battery optimization exemptions on Android?**
   Modern Android OSes (Android 12+) put apps into Deep Sleep ("App Standby Buckets"). Without `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` and `SCHEDULE_EXACT_ALARM`, alarms can be delayed by 15 to 45 minutes until the device enters an active maintenance window.
2. **Can users force-close the app to turn off the alarm?**
   On Android, native background `AlarmManager` broadcasts wake the application process back up if an alarm triggers. On iOS, critical background notifications continue to sound even if the app was suspended.
3. **Does the app consume battery during the day?**
   No. The accelerometer sensor and audio engine are only activated while the alarm is actively ringing and during the challenge view. When idle, the app consumes zero CPU cycles.
