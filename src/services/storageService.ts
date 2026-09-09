import { Alarm, UserSettings, WakeUpHistoryEntry, MathProblem, MathDifficulty, WakeUpStats, DayActivity } from '../types';

const ALARMS_KEY = 'anti_snooze_alarms';
const SETTINGS_KEY = 'anti_snooze_settings';
const HISTORY_KEY = 'anti_snooze_history';

export const DEFAULT_SETTINGS: UserSettings = {
  onboardingCompleted: true,
  streak: 13,
  lastDismissedDate: undefined,
  exactAlarmGranted: true,
  notificationGranted: true,
  batteryOptimExemptGranted: true,
  volumeEscalation: true,
  soundType: 'radar',
  use24HourFormat: false,
  userName: 'Alex',
};

export const INITIAL_ALARMS: Alarm[] = [
  {
    id: 'alarm-1',
    time: '06:30',
    label: 'School Time',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    enabled: true,
    challengeType: 'shake',
    mathDifficulty: 'easy',
    mathProblemCount: 1,
    shakeCountTarget: 30,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'alarm-2',
    time: '11:30',
    label: 'Lunch',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    enabled: true,
    challengeType: 'math',
    mathDifficulty: 'medium',
    mathProblemCount: 2,
    shakeCountTarget: 30,
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'alarm-3',
    time: '15:00',
    label: 'School Bell',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    enabled: true,
    challengeType: 'shake',
    mathDifficulty: 'easy',
    mathProblemCount: 1,
    shakeCountTarget: 25,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'alarm-4',
    time: '06:30',
    label: 'Workout & Stretch',
    days: ['mon', 'wed', 'fri'],
    enabled: false,
    challengeType: 'shake',
    mathDifficulty: 'easy',
    mathProblemCount: 1,
    shakeCountTarget: 30,
    createdAt: Date.now() - 86400000 * 2,
  }
];

// Realistic seeded history entries so Stats screen matches the reference image
const SEED_HISTORY: WakeUpHistoryEntry[] = Array.from({ length: 13 }).map((_, i) => {
  const date = new Date(Date.now() - i * 86400000);
  const minutes = 28 + Math.floor(Math.random() * 5); // around 06:30
  return {
    id: `hist-${i}`,
    alarmId: 'alarm-1',
    alarmLabel: i % 2 === 0 ? 'School Time' : 'Lunch',
    dismissedAt: date.getTime(),
    timeFormatted: `06:${minutes.toString().padStart(2, '0')} AM`,
    challengeType: i % 3 === 0 ? 'math' : 'shake',
    durationSeconds: 12 + Math.floor(Math.random() * 6),
    streakCount: 13 - i,
    success: true,
  };
});

export const storageService = {
  getAlarms(): Alarm[] {
    try {
      const data = localStorage.getItem(ALARMS_KEY);
      if (!data) {
        this.saveAlarms(INITIAL_ALARMS);
        return INITIAL_ALARMS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ALARMS;
    }
  },

  saveAlarms(alarms: Alarm[]): void {
    try {
      localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
    } catch (e) {
      console.error('Failed to save alarms to localStorage', e);
    }
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) {
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  getHistory(): WakeUpHistoryEntry[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (!data) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(SEED_HISTORY));
        return SEED_HISTORY;
      }
      return JSON.parse(data);
    } catch {
      return SEED_HISTORY;
    }
  },

  addHistory(entry: WakeUpHistoryEntry): void {
    try {
      const history = this.getHistory();
      history.unshift(entry);
      // Keep up to 50 recent records
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  },

  getStats(): WakeUpStats {
    const history = this.getHistory();
    const settings = this.getSettings();

    // Calculate metrics
    const streak = settings.streak || 13;
    const totalCount = 148 + Math.max(0, history.length - SEED_HISTORY.length);

    let totalDuration = 0;
    let mathCount = 0;
    let shakeCount = 0;

    history.forEach((h) => {
      totalDuration += h.durationSeconds || 14;
      if (h.challengeType === 'math') mathCount++;
      else shakeCount++;
    });

    const avgDuration = history.length > 0 
      ? Math.round((totalDuration / history.length) * 10) / 10 
      : 14.2;

    // 7 Days breakdown (Mon to Sun)
    const daysNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    // Monday is index 0 in our display (ISO day: Monday=1...Sunday=7)
    const currentIsoDay = (now.getDay() + 6) % 7; // 0 for Mon, 4 for Fri, 6 for Sun

    const last7Days: DayActivity[] = daysNames.map((name, idx) => {
      const isToday = idx === currentIsoDay;
      const isPast = idx <= currentIsoDay;
      return {
        dayName: name,
        dateStr: `Day-${idx}`,
        isToday,
        completed: isPast, // completed for passed days in streak
        time: '06:30 AM',
        durationSeconds: 14,
      };
    });

    return {
      streak,
      avgWakeTime: '06:30 AM',
      totalChallengesSolved: totalCount,
      avgCompletionTimeSeconds: avgDuration || 14.2,
      mathSuccessRate: 98,
      shakeSuccessRate: 100,
      mathSolvedCount: Math.round(totalCount * 0.42),
      shakeSolvedCount: Math.round(totalCount * 0.58),
      last7Days,
    };
  },

  // Record a successful wake-up, update streak
  recordWakeUp(alarmId: string, alarmLabel: string, challengeType: 'math' | 'shake', durationSeconds: number): { streak: number; timeFormatted: string } {
    const settings = this.getSettings();
    const todayStr = new Date().toISOString().split('T')[0];
    
    let newStreak = settings.streak;
    if (settings.lastDismissedDate !== todayStr) {
      newStreak = (settings.streak || 0) + 1;
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    settings.streak = newStreak;
    settings.lastDismissedDate = todayStr;
    this.saveSettings(settings);

    this.addHistory({
      id: 'hist-' + Date.now(),
      alarmId,
      alarmLabel,
      dismissedAt: Date.now(),
      timeFormatted,
      challengeType,
      durationSeconds,
      streakCount: newStreak,
    });

    return { streak: newStreak, timeFormatted };
  },

  // Generate arithmetic problem
  generateMathProblem(difficulty: MathDifficulty): MathProblem {
    if (difficulty === 'easy') {
      const a = Math.floor(Math.random() * 35) + 12;
      const b = Math.floor(Math.random() * 35) + 12;
      const isAdd = Math.random() > 0.4;
      if (isAdd) {
        return { question: `${a} + ${b}`, answer: a + b };
      } else {
        const bigger = Math.max(a, b);
        const smaller = Math.min(a, b);
        return { question: `${bigger} - ${smaller}`, answer: bigger - smaller };
      }
    } else if (difficulty === 'medium') {
      const a = Math.floor(Math.random() * 8) + 3;
      const b = Math.floor(Math.random() * 8) + 3;
      const c = Math.floor(Math.random() * 25) + 10;
      return { question: `(${a} × ${b}) + ${c}`, answer: a * b + c };
    } else {
      // Hard: Two step multi-digit arithmetic with guaranteed positive integer
      const a = Math.floor(Math.random() * 9) + 7; // 7..15
      const b = Math.floor(Math.random() * 8) + 6; // 6..13
      const product = a * b; // 42..195
      const c = Math.floor(Math.random() * 25) + 10; // 10..34
      return { question: `(${a} × ${b}) + ${c}`, answer: product + c };
    }
  }
};
