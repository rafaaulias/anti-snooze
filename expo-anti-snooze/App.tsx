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
  TextInput,
  Modal,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior for incoming alarms
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// --- TYPES & INTERFACES ---
export interface Alarm {
  id: string;
  time: string; // "HH:MM" in 24h format (e.g. "06:30")
  label: string;
  enabled: boolean;
  challengeType: 'math' | 'shake';
  difficulty: 'easy' | 'medium' | 'hard';
  days: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

const STORAGE_KEYS = {
  ALARMS: '@anti_snooze_alarms_v1',
  STREAK: '@anti_snooze_streak_v1',
  ONBOARDING: '@anti_snooze_onboarding_v1',
};

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const FULL_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// --- COLOR PALETTE (Strict Minimalist Monochrome + Orange Flame) ---
const COLORS = {
  black: '#0A0A0A',
  white: '#FFFFFF',
  bg: '#F9F9F9',
  card: '#FFFFFF',
  subtle: '#F2F2F2',
  border: '#E8E8E8',
  textSecondary: '#6A6A6A',
  textMuted: '#9E9E9E',
  flame: '#FF7B00',
  flameBg: '#FFF3E8',
  flameBorder: '#FFD9B3',
  danger: '#E53935',
};

export default function App() {
  // Navigation & Modal states
  const [screen, setScreen] = useState<'onboarding' | 'home' | 'ringing' | 'challenge' | 'success'>('home');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);

  // Core Data
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [streak, setStreak] = useState(3);
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [wakeTime, setWakeTime] = useState('07:00 AM');

  // Form State for Create / Edit Modal
  const [formHour, setFormHour] = useState(7);
  const [formMinute, setFormMinute] = useState(0);
  const [formPeriod, setFormPeriod] = useState<'AM' | 'PM'>('AM');
  const [formLabel, setFormLabel] = useState('Morning Alarm');
  const [formChallenge, setFormChallenge] = useState<'math' | 'shake'>('math');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formDays, setFormDays] = useState<boolean[]>([true, true, true, true, true, false, false]);

  // Challenge States
  const [mathA, setMathA] = useState(24);
  const [mathB, setMathB] = useState(38);
  const [mathOp, setMathOp] = useState<'+' | '-' | '×'>('+');
  const [mathAnswer, setMathAnswer] = useState(62);
  const [userMathInput, setUserMathInput] = useState('');
  const [mathError, setMathError] = useState(false);

  const [shakeCount, setShakeCount] = useState(0);
  const targetShakes = formDifficulty === 'easy' ? 20 : formDifficulty === 'hard' ? 45 : 30;

  // Sound instance ref
  const soundRef = useRef<Audio.Sound | null>(null);

  // 1. Initial Load from AsyncStorage
  useEffect(() => {
    async function loadData() {
      try {
        const storedOnboarding = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
        if (!storedOnboarding) {
          setScreen('onboarding');
        }

        const storedAlarms = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS);
        if (storedAlarms) {
          setAlarms(JSON.parse(storedAlarms));
        } else {
          // Default initial alarms
          const defaultAlarms: Alarm[] = [
            {
              id: '1',
              time: '06:30',
              label: 'Morning Workout & Run',
              enabled: true,
              challengeType: 'math',
              difficulty: 'medium',
              days: [true, true, true, true, true, false, false],
            },
            {
              id: '2',
              time: '07:15',
              label: 'Work Standup',
              enabled: false,
              challengeType: 'shake',
              difficulty: 'easy',
              days: [true, true, true, true, true, false, false],
            },
          ];
          setAlarms(defaultAlarms);
          await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(defaultAlarms));
        }

        const storedStreak = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
        if (storedStreak) {
          setStreak(parseInt(storedStreak, 10));
        }
      } catch (err) {
        console.warn('Failed to load local storage:', err);
      } finally {
        setHasLoaded(true);
      }
    }

    loadData();
  }, []);

  // 2. Audio & Notifications Configuration
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
    }).catch((e) => console.warn(e));

    // Setup high-priority Android Notification Channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('anti-snooze-alarms', {
        name: 'Anti-Snooze Alarms',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: 'default',
        bypassDnd: true,
      });
    }

    // Listener for when user taps the notification from their lock screen or banner
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.alarmId) {
        const matching = alarms.find((a) => a.id === data.alarmId);
        if (matching) {
          triggerAlarm(matching);
        }
      }
    });

    return () => {
      responseSub.remove();
    };
  }, [alarms]);

  // Sync scheduled native notifications with enabled alarms
  const scheduleNativeAlarms = async (activeAlarms: Alarm[]) => {
    try {
      // Cancel previous scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      for (const alarm of activeAlarms) {
        if (!alarm.enabled) continue;
        const [h, m] = alarm.time.split(':').map(Number);

        // Schedule for each selected active day
        alarm.days.forEach(async (isActive, dayIdx) => {
          if (!isActive) return;
          // In Expo Notifications, Sunday = 1, Monday = 2 ... Saturday = 7
          const weekday = dayIdx === 6 ? 1 : dayIdx + 2;

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '⏰ WAKE UP! Challenge Required',
              body: `${alarm.label} — Tap immediately to start ${
                alarm.challengeType === 'math' ? 'Math Puzzle' : 'Shake'
              } challenge!`,
              data: { alarmId: alarm.id },
              sound: true,
              priority: Notifications.AndroidNotificationPriority.MAX,
            },
            trigger: {
              hour: h,
              minute: m,
              repeats: true,
              weekday,
              channelId: 'anti-snooze-alarms',
            },
          });
        });
      }
    } catch (err) {
      console.warn('Failed to schedule native notifications:', err);
    }
  };

  // 3. Save Alarms whenever modified
  const saveAlarms = async (newAlarms: Alarm[]) => {
    setAlarms(newAlarms);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(newAlarms));
      await scheduleNativeAlarms(newAlarms);
    } catch (err) {
      console.warn('Failed to save alarms:', err);
    }
  };

  // 4. Background Alarm Checker (Triggers when app is open in foreground)
  useEffect(() => {
    const timer = setInterval(() => {
      if (screen !== 'home') return;
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentH}:${currentM}`;
      const dayIndex = (now.getDay() + 6) % 7; // Convert Sun=0 to Mon=0..Sun=6

      for (const alarm of alarms) {
        if (alarm.enabled && alarm.time === currentTimeStr && alarm.days[dayIndex]) {
          triggerAlarm(alarm);
          break;
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [alarms, screen]);

  // Trigger Ringing Screen & Loud Siren
  const triggerAlarm = async (alarm: Alarm) => {
    setActiveAlarm(alarm);
    setScreen('ringing');

    // Escalating Vibration pattern
    Vibration.vibrate([600, 400, 600, 400], true);

    // Provide immediate haptic notification
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    // Start Real Siren Sound (loops continuously until challenge is solved)
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      soundRef.current = sound;
    } catch (err) {
      console.warn('Failed to play alarm audio:', err);
    }
  };

  // Stop siren helper
  const stopSiren = async () => {
    Vibration.cancel();
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (err) {
        console.warn('Failed to stop audio:', err);
      } finally {
        soundRef.current = null;
      }
    }
  };

  // Start the Assigned Challenge
  const handleStartChallenge = () => {
    Vibration.cancel();
    if (!activeAlarm) return;

    if (activeAlarm.challengeType === 'math') {
      generateMathProblem(activeAlarm.difficulty);
      setUserMathInput('');
      setMathError(false);
    } else {
      setShakeCount(0);
    }
    setScreen('challenge');
  };

  // Generate Math Problem according to difficulty
  const generateMathProblem = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (difficulty === 'easy') {
      const a = Math.floor(Math.random() * 30) + 12;
      const b = Math.floor(Math.random() * 30) + 12;
      setMathA(a);
      setMathB(b);
      setMathOp('+');
      setMathAnswer(a + b);
    } else if (difficulty === 'medium') {
      const isSub = Math.random() > 0.5;
      if (isSub) {
        const a = Math.floor(Math.random() * 50) + 35;
        const b = Math.floor(Math.random() * 30) + 10;
        setMathA(a);
        setMathB(b);
        setMathOp('-');
        setMathAnswer(a - b);
      } else {
        const a = Math.floor(Math.random() * 45) + 25;
        const b = Math.floor(Math.random() * 45) + 20;
        setMathA(a);
        setMathB(b);
        setMathOp('+');
        setMathAnswer(a + b);
      }
    } else {
      // Hard: multiplication + addition
      const a = Math.floor(Math.random() * 8) + 3;
      const b = Math.floor(Math.random() * 8) + 4;
      setMathA(a);
      setMathB(b);
      setMathOp('×');
      setMathAnswer(a * b);
    }
  };

  // Accelerometer Shake Detection
  useEffect(() => {
    let subscription: any = null;
    if (screen === 'challenge' && activeAlarm?.challengeType === 'shake') {
      Accelerometer.setUpdateInterval(90);
      let lastShake = 0;

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        // Vector magnitude > 1.8G with 200ms debounce
        if (magnitude > 1.75 && now - lastShake > 200) {
          lastShake = now;
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          setShakeCount((prev) => {
            const next = prev + 1;
            if (next >= targetShakes) {
              handleDismissSuccess();
            }
            return next;
          });
        }
      });
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, [screen, activeAlarm, targetShakes]);

  // Math Keypad Click
  const handleKeypadPress = (val: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMathError(false);

    if (val === 'C') {
      setUserMathInput('');
    } else if (val === '⌫') {
      setUserMathInput((prev) => prev.slice(0, -1));
    } else {
      setUserMathInput((prev) => (prev.length < 5 ? prev + val : prev));
    }
  };

  // Math Submit
  const handleMathSubmit = () => {
    const userVal = parseInt(userMathInput, 10);
    if (userVal === mathAnswer) {
      handleDismissSuccess();
    } else {
      setMathError(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Vibration.vibrate(300);
      setUserMathInput('');
    }
  };

  // Alarm Successfully Dismissed
  const handleDismissSuccess = async () => {
    await stopSiren();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const now = new Date();
    const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWakeTime(formatted);

    const newStreak = streak + 1;
    setStreak(newStreak);
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString());

    setScreen('success');
  };

  // Open Edit / Create Modal
  const openCreateModal = () => {
    setEditingAlarmId(null);
    setFormHour(7);
    setFormMinute(0);
    setFormPeriod('AM');
    setFormLabel('Morning Alarm');
    setFormChallenge('math');
    setFormDifficulty('medium');
    setFormDays([true, true, true, true, true, false, false]);
    setIsModalOpen(true);
  };

  const openEditModal = (alarm: Alarm) => {
    setEditingAlarmId(alarm.id);
    const [hStr, mStr] = alarm.time.split(':');
    let hNum = parseInt(hStr, 10);
    const mNum = parseInt(mStr, 10);
    const p = hNum >= 12 ? 'PM' : 'AM';
    if (hNum === 0) hNum = 12;
    else if (hNum > 12) hNum -= 12;

    setFormHour(hNum);
    setFormMinute(mNum);
    setFormPeriod(p);
    setFormLabel(alarm.label);
    setFormChallenge(alarm.challengeType);
    setFormDifficulty(alarm.difficulty);
    setFormDays([...alarm.days]);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    let hour24 = formHour;
    if (formPeriod === 'PM' && hour24 < 12) hour24 += 12;
    if (formPeriod === 'AM' && hour24 === 12) hour24 = 0;

    const timeStr = `${hour24.toString().padStart(2, '0')}:${formMinute.toString().padStart(2, '0')}`;

    if (editingAlarmId) {
      const updated = alarms.map((a) =>
        a.id === editingAlarmId
          ? {
              ...a,
              time: timeStr,
              label: formLabel.trim() || 'Alarm',
              challengeType: formChallenge,
              difficulty: formDifficulty,
              days: formDays,
            }
          : a
      );
      saveAlarms(updated);
    } else {
      const newAlarm: Alarm = {
        id: Date.now().toString(),
        time: timeStr,
        label: formLabel.trim() || 'Alarm',
        enabled: true,
        challengeType: formChallenge,
        difficulty: formDifficulty,
        days: formDays,
      };
      saveAlarms([...alarms, newAlarm]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteAlarm = (id: string) => {
    Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const filtered = alarms.filter((a) => a.id !== id);
          saveAlarms(filtered);
        },
      },
    ]);
  };

  const formatDisplayTime = (time24: string) => {
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const p = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return {
      time: `${h.toString().padStart(2, '0')}:${mStr}`,
      period: p,
    };
  };

  if (!hasLoaded) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: COLORS.bg }]}>
        <Text style={styles.brandTitle}>Anti-Snooze</Text>
      </View>
    );
  }

  // ==========================================
  // 1. ONBOARDING / PERMISSIONS SCREEN
  // ==========================================
  if (screen === 'onboarding') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.onboardingContent}>
          <View style={styles.onboardingHeader}>
            <View style={styles.appIconBadge}>
              <Text style={{ fontSize: 28 }}>⏰</Text>
            </View>
            <Text style={styles.onboardingTitle}>Guaranteed Wake Up</Text>
            <Text style={styles.onboardingDesc}>
              Anti-Snooze enforces physical and cognitive challenges before silencing. To guarantee
              it rings even when your phone is sleeping, we need these permissions:
            </Text>
          </View>

          <View style={styles.permissionList}>
            <View style={styles.permissionCard}>
              <Text style={styles.permissionIcon}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.permissionTitle}>Exact Alarms</Text>
                <Text style={styles.permissionText}>
                  Bypasses Android deep sleep to ring at the exact second scheduled.
                </Text>
              </View>
            </View>

            <View style={styles.permissionCard}>
              <Text style={styles.permissionIcon}>🔋</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.permissionTitle}>Battery Optimization Exemption</Text>
                <Text style={styles.permissionText}>
                  Prevents OEM task killers from terminating the alarm in background.
                </Text>
              </View>
            </View>

            <View style={styles.permissionCard}>
              <Text style={styles.permissionIcon}>📱</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.permissionTitle}>Motion & Sensors</Text>
                <Text style={styles.permissionText}>
                  Powers real accelerometer shake verification to wake your body.
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtnBlack}
            onPress={async () => {
              await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
              setScreen('home');
            }}
          >
            <Text style={styles.primaryBtnTextWhite}>Grant Access & Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 2. RINGING SCREEN (Dark Mode, Pulsing)
  // ==========================================
  if (screen === 'ringing' && activeAlarm) {
    const { time, period } = formatDisplayTime(activeAlarm.time);
    return (
      <SafeAreaView style={styles.ringingScreen}>
        <StatusBar style="light" />
        <View style={styles.ringingTopBadge}>
          <Text style={styles.ringingBadgeText}>ALARM RINGING</Text>
        </View>

        <View style={styles.ringingBody}>
          <View style={styles.ringingTimeWrapper}>
            <Text style={styles.ringingTimeText}>{time}</Text>
            <Text style={styles.ringingPeriodText}>{period}</Text>
          </View>
          <Text style={styles.ringingLabel}>{activeAlarm.label}</Text>
          <Text style={styles.ringingWarning}>
            No snooze shortcut • {activeAlarm.challengeType === 'math' ? 'Math Challenge' : 'Shake Challenge'} required
          </Text>
        </View>

        <View style={styles.ringingBottom}>
          <TouchableOpacity style={styles.primaryBtnWhite} onPress={handleStartChallenge}>
            <Text style={styles.primaryBtnTextBlack}>Start challenge</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 3. CHALLENGE SCREEN (Math & Shake)
  // ==========================================
  if (screen === 'challenge' && activeAlarm) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>
            {activeAlarm.challengeType === 'math' ? 'Solve to Dismiss' : 'Shake to Unlock'}
          </Text>
          <Text style={styles.challengeSub}>
            {activeAlarm.challengeType === 'math'
              ? 'Complete the arithmetic problem below'
              : 'Vigorously shake device to fill the ring'}
          </Text>
        </View>

        {activeAlarm.challengeType === 'math' ? (
          <View style={styles.mathSection}>
            {/* Equation Box */}
            <View style={[styles.equationBox, mathError && styles.equationBoxError]}>
              <Text style={styles.equationPrompt}>
                {mathA} {mathOp} {mathB} =
              </Text>
              <Text style={styles.equationInput}>{userMathInput || '?'}</Text>
            </View>

            {/* Custom On-Screen Keypad */}
            <View style={styles.keypadGrid}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.keypadKey}
                  onPress={() => handleKeypadPress(key)}
                >
                  <Text style={styles.keypadKeyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryBtnBlack} onPress={handleMathSubmit}>
              <Text style={styles.primaryBtnTextWhite}>Submit Answer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.shakeSection}>
            <View style={styles.shakeProgressOuter}>
              <Text style={styles.shakeProgressPercent}>
                {Math.min(100, Math.round((shakeCount / targetShakes) * 100))}%
              </Text>
              <Text style={styles.shakeProgressLabel}>
                {shakeCount} / {targetShakes} Shakes
              </Text>
            </View>

            <Text style={styles.shakeInstructions}>
              Shake phone up and down vigorously
            </Text>

            <TouchableOpacity
              style={styles.shakeSimulateBtn}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                setShakeCount((prev) => {
                  const next = prev + 3;
                  if (next >= targetShakes) {
                    handleDismissSuccess();
                  }
                  return next;
                });
              }}
            >
              <Text style={styles.shakeSimulateText}>Simulate Shakes (+3)</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ==========================================
  // 4. SUCCESS SCREEN
  // ==========================================
  if (screen === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.successContent}>
          <View style={styles.successCheckCircle}>
            <Text style={styles.successCheckText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Alarm Dismissed</Text>
          <Text style={styles.successTimeText}>Awake at {wakeTime}</Text>

          <View style={styles.streakBadge}>
            <Text style={{ fontSize: 16 }}>🔥</Text>
            <Text style={styles.streakBadgeText}>{streak} Day Streak</Text>
          </View>
          <Text style={styles.streakMotivation}>
            Challenge completed. You conquered morning snooze!
          </Text>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.primaryBtnBlack} onPress={() => setScreen('home')}>
            <Text style={styles.primaryBtnTextWhite}>Return to Alarms</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 5. HOME SCREEN (Alarm List & FAB)
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.brandTitle}>Anti-Snooze</Text>
          <Text style={styles.brandSub}>Wake up guaranteed</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={{ fontSize: 14 }}>🔥</Text>
          <Text style={styles.streakBadgeText}>{streak}d</Text>
        </View>
      </View>

      {/* Alarm Cards List */}
      <ScrollView contentContainerStyle={styles.alarmListContent} showsVerticalScrollIndicator={false}>
        {alarms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 44 }}>⏰</Text>
            <Text style={styles.emptyTitle}>No Alarms Scheduled</Text>
            <Text style={styles.emptySub}>Tap the button below to set your first wake-up challenge</Text>
          </View>
        ) : (
          alarms.map((item) => {
            const { time, period } = formatDisplayTime(item.time);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.alarmCard, !item.enabled && styles.alarmCardDisabled]}
                onPress={() => openEditModal(item)}
                activeOpacity={0.8}
              >
                <View style={styles.alarmCardHeader}>
                  <View style={styles.timeGroup}>
                    <Text style={[styles.alarmCardTime, !item.enabled && { color: COLORS.textMuted }]}>
                      {time}
                    </Text>
                    <Text style={[styles.alarmCardPeriod, !item.enabled && { color: COLORS.textMuted }]}>
                      {period}
                    </Text>
                  </View>

                  <Switch
                    value={item.enabled}
                    onValueChange={(val) => {
                      const updated = alarms.map((a) => (a.id === item.id ? { ...a, enabled: val } : a));
                      saveAlarms(updated);
                    }}
                    thumbColor={COLORS.white}
                    trackColor={{ false: '#D4D4D4', true: COLORS.black }}
                  />
                </View>

                <Text style={styles.alarmCardLabel}>{item.label}</Text>

                {/* Day Chips */}
                <View style={styles.daysRow}>
                  {DAY_NAMES.map((d, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dayChip,
                        item.days[idx] && item.enabled && styles.dayChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayChipText,
                          item.days[idx] && item.enabled && styles.dayChipTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Card Footer Actions */}
                <View style={styles.alarmCardFooter}>
                  <View style={styles.challengeBadge}>
                    <Text style={styles.challengeBadgeText}>
                      {item.challengeType === 'math' ? '🧠 Math' : '📱 Shake'} • {item.difficulty}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={styles.cardActionBtn}
                      onPress={() => triggerAlarm(item)}
                    >
                      <Text style={styles.cardActionBtnText}>⚡ Test</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cardActionBtnDanger}
                      onPress={() => handleDeleteAlarm(item.id)}
                    >
                      <Text style={styles.cardActionBtnDangerText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button (+) */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* ========================================== */}
      {/* CREATE / EDIT MODAL                         */}
      {/* ========================================== */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalSheet}>
            {/* Modal Bar */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingAlarmId ? 'Edit Alarm' : 'New Alarm'}
              </Text>
              <TouchableOpacity onPress={handleSaveModal}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Time Control Card */}
              <View style={styles.timeSelectCard}>
                <View style={styles.timeSelectRow}>
                  {/* Hours */}
                  <View style={styles.timeDigitBox}>
                    <TouchableOpacity
                      onPress={() => setFormHour((h) => (h >= 12 ? 1 : h + 1))}
                    >
                      <Text style={styles.arrowText}>▲</Text>
                    </TouchableOpacity>
                    <Text style={styles.timeDigitText}>
                      {formHour.toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setFormHour((h) => (h <= 1 ? 12 : h - 1))}
                    >
                      <Text style={styles.arrowText}>▼</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.colonText}>:</Text>

                  {/* Minutes */}
                  <View style={styles.timeDigitBox}>
                    <TouchableOpacity
                      onPress={() => setFormMinute((m) => (m >= 55 ? 0 : m + 5))}
                    >
                      <Text style={styles.arrowText}>▲</Text>
                    </TouchableOpacity>
                    <Text style={styles.timeDigitText}>
                      {formMinute.toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setFormMinute((m) => (m <= 0 ? 55 : m - 5))}
                    >
                      <Text style={styles.arrowText}>▼</Text>
                    </TouchableOpacity>
                  </View>

                  {/* AM / PM Toggle */}
                  <View style={styles.amPmPill}>
                    <TouchableOpacity
                      style={[styles.amPmBtn, formPeriod === 'AM' && styles.amPmBtnActive]}
                      onPress={() => setFormPeriod('AM')}
                    >
                      <Text
                        style={[
                          styles.amPmBtnText,
                          formPeriod === 'AM' && styles.amPmBtnTextActive,
                        ]}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.amPmBtn, formPeriod === 'PM' && styles.amPmBtnActive]}
                      onPress={() => setFormPeriod('PM')}
                    >
                      <Text
                        style={[
                          styles.amPmBtnText,
                          formPeriod === 'PM' && styles.amPmBtnTextActive,
                        ]}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Repeat Days */}
              <Text style={styles.fieldHeading}>Repeat Days</Text>
              <View style={styles.repeatDaysRow}>
                {FULL_DAY_NAMES.map((name, i) => (
                  <TouchableOpacity
                    key={name}
                    style={[styles.repeatDayPill, formDays[i] && styles.repeatDayPillActive]}
                    onPress={() => {
                      const updated = [...formDays];
                      updated[i] = !updated[i];
                      setFormDays(updated);
                    }}
                  >
                    <Text
                      style={[
                        styles.repeatDayPillText,
                        formDays[i] && styles.repeatDayPillTextActive,
                      ]}
                    >
                      {DAY_NAMES[i]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Label */}
              <Text style={styles.fieldHeading}>Label</Text>
              <TextInput
                style={styles.labelInput}
                value={formLabel}
                onChangeText={setFormLabel}
                placeholder="e.g. Work, Gym, Class"
                placeholderTextColor="#9E9E9E"
              />

              {/* Challenge Type */}
              <Text style={styles.fieldHeading}>Dismiss Challenge</Text>
              <View style={styles.challengeGrid}>
                <TouchableOpacity
                  style={[
                    styles.challengeCard,
                    formChallenge === 'math' && styles.challengeCardActive,
                  ]}
                  onPress={() => setFormChallenge('math')}
                >
                  <Text style={styles.challengeCardIcon}>🧠</Text>
                  <Text style={styles.challengeCardTitle}>Math Puzzle</Text>
                  <Text style={styles.challengeCardSub}>
                    Solve arithmetic problems via on-screen keypad
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.challengeCard,
                    formChallenge === 'shake' && styles.challengeCardActive,
                  ]}
                  onPress={() => setFormChallenge('shake')}
                >
                  <Text style={styles.challengeCardIcon}>📱</Text>
                  <Text style={styles.challengeCardTitle}>Shake Phone</Text>
                  <Text style={styles.challengeCardSub}>
                    Vigorously shake device to silence siren
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Difficulty */}
              <Text style={styles.fieldHeading}>Challenge Difficulty</Text>
              <View style={styles.difficultyRow}>
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.diffPill,
                      formDifficulty === diff && styles.diffPillActive,
                    ]}
                    onPress={() => setFormDifficulty(diff)}
                  >
                    <Text
                      style={[
                        styles.diffPillText,
                        formDifficulty === diff && styles.diffPillTextActive,
                      ]}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// NATIVE STYLESHEET
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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
    gap: 4,
    backgroundColor: COLORS.flameBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.flameBorder,
  },
  streakBadgeText: { fontSize: 13, fontWeight: '700', color: COLORS.flame },

  alarmListContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100, gap: 14 },
  alarmCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  alarmCardDisabled: { opacity: 0.55 },
  alarmCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeGroup: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  alarmCardTime: { fontSize: 38, fontWeight: '800', color: COLORS.black },
  alarmCardPeriod: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
  alarmCardLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },

  daysRow: { flexDirection: 'row', gap: 6, marginTop: 14 },
  dayChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayChipActive: { backgroundColor: COLORS.black },
  dayChipText: { fontSize: 11, fontWeight: '700', color: '#888' },
  dayChipTextActive: { color: COLORS.white },

  alarmCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  challengeBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  challengeBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.black },
  cardActionBtn: { backgroundColor: '#F4F4F4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  cardActionBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.black },
  cardActionBtnDanger: { backgroundColor: '#FBEBEB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  cardActionBtnDangerText: { fontSize: 12, fontWeight: '700', color: COLORS.danger },

  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  fabText: { color: COLORS.white, fontSize: 32, fontWeight: '300', marginTop: -2 },

  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  emptySub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40 },

  // Ringing Screen
  ringingScreen: { flex: 1, backgroundColor: '#090909', justifyContent: 'space-between' },
  ringingTopBadge: { alignItems: 'center', marginTop: 32 },
  ringingBadgeText: {
    color: '#FF453A',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 2,
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  ringingBody: { alignItems: 'center', paddingHorizontal: 24 },
  ringingTimeWrapper: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  ringingTimeText: { fontSize: 68, fontWeight: '900', color: COLORS.white },
  ringingPeriodText: { fontSize: 24, fontWeight: '800', color: '#999999' },
  ringingLabel: { fontSize: 18, color: '#D4D4D4', marginTop: 8, textAlign: 'center' },
  ringingWarning: { fontSize: 13, color: '#777777', marginTop: 12 },
  ringingBottom: { padding: 24 },

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

  // Challenge Screen
  challengeHeader: { padding: 24, alignItems: 'center' },
  challengeTitle: { fontSize: 22, fontWeight: '800', color: COLORS.black },
  challengeSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  mathSection: { paddingHorizontal: 24 },
  equationBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 16,
  },
  equationBoxError: { borderColor: COLORS.danger, backgroundColor: '#FFF5F5' },
  equationPrompt: { fontSize: 32, fontWeight: '800', color: COLORS.black },
  equationInput: { fontSize: 32, fontWeight: '800', color: '#007AFF' },
  keypadGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  keypadKey: {
    width: '31%',
    aspectRatio: 1.4,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  keypadKeyText: { fontSize: 22, fontWeight: '700', color: COLORS.black },

  // Shake Section
  shakeSection: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  shakeProgressOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 10,
    borderColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  shakeProgressPercent: { fontSize: 44, fontWeight: '900', color: COLORS.black },
  shakeProgressLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  shakeInstructions: { fontSize: 14, color: COLORS.textSecondary, marginTop: 24 },
  shakeSimulateBtn: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
  },
  shakeSimulateText: { fontSize: 13, fontWeight: '700', color: COLORS.black },

  // Success Screen
  successContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successCheckText: { color: COLORS.white, fontSize: 38, fontWeight: '900' },
  successTitle: { fontSize: 26, fontWeight: '800', color: COLORS.black },
  successTimeText: { fontSize: 15, color: COLORS.textSecondary, marginTop: 6, marginBottom: 16 },
  streakMotivation: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 12 },
  bottomBar: { padding: 24 },

  // Onboarding
  onboardingContent: { flex: 1, padding: 24, justifyContent: 'space-between' },
  onboardingHeader: { alignItems: 'center', marginTop: 20 },
  appIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  onboardingTitle: { fontSize: 26, fontWeight: '800', color: COLORS.black },
  onboardingDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  permissionList: { gap: 14, marginVertical: 20 },
  permissionCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  permissionIcon: { fontSize: 24 },
  permissionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  permissionText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, lineHeight: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.black },
  modalCancelText: { fontSize: 15, color: COLORS.textSecondary },
  modalSaveText: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  modalContent: { padding: 20, gap: 16, paddingBottom: 40 },

  timeSelectCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  timeSelectRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeDigitBox: { alignItems: 'center' },
  arrowText: { fontSize: 14, color: '#888', padding: 4 },
  timeDigitText: { fontSize: 44, fontWeight: '800', color: COLORS.black },
  colonText: { fontSize: 36, fontWeight: '800', color: COLORS.black, marginHorizontal: -4 },
  amPmPill: { backgroundColor: '#ECECEC', borderRadius: 12, padding: 3, gap: 2, marginLeft: 12 },
  amPmBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9 },
  amPmBtnActive: { backgroundColor: COLORS.black },
  amPmBtnText: { fontSize: 11, fontWeight: '800', color: '#777' },
  amPmBtnTextActive: { color: COLORS.white },

  fieldHeading: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  repeatDaysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  repeatDayPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatDayPillActive: { backgroundColor: COLORS.black },
  repeatDayPillText: { fontSize: 13, fontWeight: '700', color: '#777' },
  repeatDayPillTextActive: { color: COLORS.white },

  labelInput: {
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.black,
  },
  challengeGrid: { flexDirection: 'row', gap: 12 },
  challengeCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
  },
  challengeCardActive: { borderColor: COLORS.black, backgroundColor: '#FFFFFF' },
  challengeCardIcon: { fontSize: 24, marginBottom: 6 },
  challengeCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  challengeCardSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, lineHeight: 15 },

  difficultyRow: { flexDirection: 'row', gap: 10 },
  diffPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },
  diffPillActive: { backgroundColor: COLORS.black },
  diffPillText: { fontSize: 13, fontWeight: '700', color: '#777' },
  diffPillTextActive: { color: COLORS.white },
});
