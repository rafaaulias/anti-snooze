import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Smartphone } from 'lucide-react';

interface ExpoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpoExportModal: React.FC<ExpoExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'app' | 'package' | 'appjson' | 'instructions'>('app');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const EXPO_APP_CODE = `// Anti-Snooze Expo App (App.tsx)
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
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Design tokens
const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  bg: '#F9F9F9',
  gray: '#5E5E5E',
  border: '#E5E5E5',
  flame: '#FF7B00', // Exclusive streak flame
};

export default function App() {
  const [screen, setScreen] = useState<'home' | 'ringing' | 'challenge' | 'success'>('home');
  const [streak, setStreak] = useState(3);
  const [challengeType, setChallengeType] = useState<'math' | 'shake'>('math');
  const [shakeCount, setShakeCount] = useState(0);
  const targetShakes = 30;

  // Math State
  const [mathA, setMathA] = useState(24);
  const [mathB, setMathB] = useState(37);
  const [userAnswer, setUserAnswer] = useState('');

  // Sound Player
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Request audio permissions & setup
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
  }, []);

  // Accelerometer shake detection for Expo Go
  useEffect(() => {
    let subscription: any = null;
    if (screen === 'challenge' && challengeType === 'shake') {
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
  }, [screen, challengeType]);

  const handleStartAlarm = () => {
    setScreen('ringing');
    Vibration.vibrate([500, 500], true);
  };

  const handleStartChallenge = () => {
    setScreen('challenge');
    setShakeCount(0);
    setUserAnswer('');
    setMathA(Math.floor(Math.random() * 30) + 12);
    setMathB(Math.floor(Math.random() * 30) + 12);
  };

  const handleDismissAlarm = () => {
    Vibration.cancel();
    setStreak((s) => s + 1);
    setScreen('success');
  };

  const handleMathSubmit = () => {
    if (parseInt(userAnswer, 10) === mathA + mathB) {
      handleDismissAlarm();
    } else {
      Vibration.vibrate(200);
      setUserAnswer('');
    }
  };

  if (screen === 'ringing') {
    return (
      <SafeAreaView style={styles.darkContainer}>
        <StatusBar style="light" />
        <View style={styles.ringingHeader}>
          <Text style={styles.ringingBadge}>ALARM RINGING</Text>
        </View>
        <View style={styles.ringingCenter}>
          <Text style={styles.ringingTime}>06:30</Text>
          <Text style={styles.ringingLabel}>Morning Class Prep</Text>
          <Text style={styles.ringingSub}>Snooze disabled • Challenge required</Text>
        </View>
        <TouchableOpacity style={styles.primaryBtnWhite} onPress={handleStartChallenge}>
          <Text style={styles.primaryBtnTextBlack}>Start challenge</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (screen === 'challenge') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <Text style={styles.challengeTitle}>
          {challengeType === 'math' ? 'Solve Arithmetic' : 'Shake Device'}
        </Text>
        {challengeType === 'math' ? (
          <View style={styles.mathBox}>
            <Text style={styles.mathQuestion}>{mathA} + {mathB} = ?</Text>
            <Text style={styles.mathAnswer}>{userAnswer || 'Enter answer'}</Text>
            <View style={styles.keypad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <TouchableOpacity
                  key={k}
                  style={styles.keyBtn}
                  onPress={() => {
                    if (k === 'C') setUserAnswer('');
                    else if (k === '⌫') setUserAnswer((p) => p.slice(0, -1));
                    else setUserAnswer((p) => p + k);
                  }}
                >
                  <Text style={styles.keyText}>{k}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleMathSubmit}>
              <Text style={styles.primaryBtnText}>Submit Answer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.shakeBox}>
            <Text style={styles.shakeCount}>{shakeCount} / {targetShakes}</Text>
            <Text style={styles.shakeSub}>Shake your phone until 100%</Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                setShakeCount((p) => {
                  const n = p + 5;
                  if (n >= targetShakes) handleDismissAlarm();
                  return n;
                });
              }}
            >
              <Text style={styles.primaryBtnText}>Tap / Shake Phone</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (screen === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centerBox}>
          <Text style={styles.successTitle}>Alarm dismissed</Text>
          <Text style={styles.successSub}>You beat snooze again!</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFlame}>🔥</Text>
            <Text style={styles.streakText}>{streak} Day Streak</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setScreen('home')}>
          <Text style={styles.primaryBtnText}>Done</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Home Alarm List
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.homeHeader}>
        <Text style={styles.brandTitle}>Anti-Snooze</Text>
        <View style={styles.streakPill}>
          <Text style={styles.streakFlame}>🔥</Text>
          <Text style={styles.streakPillText}>{streak}d</Text>
        </View>
      </View>

      <ScrollView style={styles.list}>
        <View style={styles.alarmCard}>
          <View>
            <Text style={styles.alarmTime}>06:30 AM</Text>
            <Text style={styles.alarmLabel}>Morning Class Prep</Text>
            <Text style={styles.alarmBadge}>Math Challenge</Text>
          </View>
          <Switch value={true} trackColor={{ true: COLORS.black, false: COLORS.border }} />
        </View>

        <TouchableOpacity style={styles.testBtn} onPress={handleStartAlarm}>
          <Text style={styles.testBtnText}>⚡ Test Alarm Ringing Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 20 },
  darkContainer: { flex: 1, backgroundColor: COLORS.black, padding: 20, justifyContent: 'space-between' },
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brandTitle: { fontSize: 24, fontWeight: '800', color: COLORS.black },
  streakPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  streakFlame: { color: COLORS.flame, marginRight: 4 },
  streakPillText: { fontWeight: '700', fontSize: 13 },
  list: { flex: 1 },
  alarmCard: { backgroundColor: COLORS.white, padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  alarmTime: { fontSize: 28, fontWeight: '800', color: COLORS.black },
  alarmLabel: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  alarmBadge: { fontSize: 11, fontWeight: '600', color: COLORS.black, marginTop: 6 },
  testBtn: { backgroundColor: COLORS.black, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  testBtnText: { color: COLORS.white, fontWeight: '700' },
  primaryBtn: { backgroundColor: COLORS.black, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  primaryBtnWhite: { backgroundColor: COLORS.white, padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  primaryBtnTextBlack: { color: COLORS.black, fontWeight: '800', fontSize: 16 },
  ringingHeader: { alignItems: 'center', marginTop: 20 },
  ringingBadge: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: 12, letterSpacing: 2 },
  ringingCenter: { alignItems: 'center' },
  ringingTime: { fontSize: 72, fontWeight: '900', color: COLORS.white },
  ringingLabel: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginTop: 8 },
  ringingSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  challengeTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginVertical: 12 },
  mathBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mathQuestion: { fontSize: 44, fontWeight: '900', marginBottom: 12 },
  mathAnswer: { fontSize: 28, fontWeight: '700', color: COLORS.black, height: 48, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, width: '100%', textAlign: 'center', lineHeight: 48, backgroundColor: COLORS.white, marginBottom: 16 },
  keypad: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  keyBtn: { width: '31%', height: 56, backgroundColor: COLORS.white, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  keyText: { fontSize: 20, fontWeight: '700' },
  shakeBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shakeCount: { fontSize: 56, fontWeight: '900', color: COLORS.black },
  shakeSub: { fontSize: 14, color: COLORS.gray, marginTop: 8, marginBottom: 24 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: 28, fontWeight: '800' },
  successSub: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 12, marginTop: 20, borderWidth: 1, borderColor: COLORS.border },
  streakText: { fontSize: 16, fontWeight: '700', color: COLORS.black },
});
`;

  const PACKAGE_JSON_CODE = `{
  "name": "anti-snooze-expo",
  "version": "1.0.0",
  "main": "expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "^52.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "expo-sensors": "~14.0.0",
    "expo-av": "~15.0.0",
    "expo-notifications": "~0.29.0",
    "@react-native-async-storage/async-storage": "1.23.1"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~18.3.12",
    "typescript": "^5.3.3"
  },
  "private": true
}`;

  const APP_JSON_CODE = `{
  "expo": {
    "name": "Anti-Snooze",
    "slug": "anti-snooze",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FFFFFF"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.antisnooze.app",
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.antisnooze.app",
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "SCHEDULE_EXACT_ALARM",
        "USE_EXACT_ALARM",
        "VIBRATE",
        "WAKE_LOCK"
      ]
    }
  }
}`;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'app':
        return EXPO_APP_CODE;
      case 'package':
        return PACKAGE_JSON_CODE;
      case 'appjson':
        return APP_JSON_CODE;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div 
        id="expo-export-dialog"
        className="w-full max-w-[620px] bg-[#FFFFFF] rounded-[24px] shadow-2xl border border-[#E5E5E5] flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-[8px] bg-[#000000] text-white flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#000000]">
                React Native Expo Code & Project
              </h3>
              <p className="text-[11px] text-[#5E5E5E]">
                Ready to run directly in Expo Go on iOS & Android
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F9F9F9] flex items-center justify-center text-[#5E5E5E] hover:text-[#000000]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-4 pt-3 space-x-1 border-b border-[#F0F0F0] bg-[#F9F9F9]">
          <button
            onClick={() => setActiveTab('app')}
            className={`px-3 py-1.5 rounded-t-[8px] text-xs font-bold transition-colors ${
              activeTab === 'app'
                ? 'bg-white text-black border-t border-x border-[#E5E5E5]'
                : 'text-[#5E5E5E] hover:text-black'
            }`}
          >
            App.tsx
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`px-3 py-1.5 rounded-t-[8px] text-xs font-bold transition-colors ${
              activeTab === 'package'
                ? 'bg-white text-black border-t border-x border-[#E5E5E5]'
                : 'text-[#5E5E5E] hover:text-black'
            }`}
          >
            package.json
          </button>
          <button
            onClick={() => setActiveTab('appjson')}
            className={`px-3 py-1.5 rounded-t-[8px] text-xs font-bold transition-colors ${
              activeTab === 'appjson'
                ? 'bg-white text-black border-t border-x border-[#E5E5E5]'
                : 'text-[#5E5E5E] hover:text-black'
            }`}
          >
            app.json
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-3 py-1.5 rounded-t-[8px] text-xs font-bold transition-colors ${
              activeTab === 'instructions'
                ? 'bg-white text-black border-t border-x border-[#E5E5E5]'
                : 'text-[#5E5E5E] hover:text-black'
            }`}
          >
            Quick Setup (Expo Go)
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#141414] text-white font-mono text-xs no-scrollbar">
          {activeTab === 'instructions' ? (
            <div className="space-y-4 font-sans text-sm text-gray-200 p-2">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span>Running in Expo Go on your mobile phone:</span>
              </div>
              <ol className="list-decimal list-inside space-y-3 text-xs leading-relaxed text-gray-300">
                <li>
                  <strong className="text-white">Install Expo Go:</strong> Download the free Expo Go app from the iOS App Store or Android Google Play Store.
                </li>
                <li>
                  <strong className="text-white">Initialize project:</strong> In your computer terminal, run:
                  <div className="mt-1 p-2 bg-black rounded border border-gray-800 font-mono text-emerald-400">
                    npx create-expo-app anti-snooze -t blank-typescript
                  </div>
                </li>
                <li>
                  <strong className="text-white">Install dependencies:</strong> Inside the project folder:
                  <div className="mt-1 p-2 bg-black rounded border border-gray-800 font-mono text-emerald-400">
                    npx expo install expo-sensors expo-av expo-notifications @react-native-async-storage/async-storage
                  </div>
                </li>
                <li>
                  <strong className="text-white">Paste code:</strong> Copy the <code className="text-emerald-400">App.tsx</code> tab content into your project's <code className="text-emerald-400">App.tsx</code>.
                </li>
                <li>
                  <strong className="text-white">Start dev server:</strong>
                  <div className="mt-1 p-2 bg-black rounded border border-gray-800 font-mono text-emerald-400">
                    npx expo start
                  </div>
                </li>
                <li>
                  <strong className="text-white">Scan QR Code:</strong> Open Expo Go on your phone and scan the QR code in your terminal. Anti-Snooze runs natively on your physical phone!
                </li>
              </ol>
            </div>
          ) : (
            <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed text-gray-200 select-all">
              {getActiveCode()}
            </pre>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#FFFFFF] border-t border-[#F0F0F0] flex items-center justify-between">
          <span className="text-[11px] text-[#5E5E5E] font-sans">
            TypeScript • React Native Expo (SDK 51, 52 & upcoming) • Offline-first
          </span>
          {activeTab !== 'instructions' && (
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-[8px] bg-[#000000] text-white text-xs font-bold flex items-center space-x-1.5 hover:bg-[#222222] active:scale-95 transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
