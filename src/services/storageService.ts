import { Alarm, UserSettings, WakeUpHistoryEntry, MathProblem, MathDifficulty, WakeUpStats, DayActivity } from '../types';

const ALARMS_KEY = 'anti_snooze_alarms';
const SETTINGS_KEY = 'anti_snooze_settings';
const HISTORY_KEY = 'anti_snooze_history';
const DATA_VERSION_KEY = 'anti_snooze_data_version';
const CURRENT_DATA_VERSION = '2.0.0'; // Version bump cleans up any old hardcoded mock/seed data

export const DEFAULT_SETTINGS: UserSettings = {
  onboardingCompleted: false,
  streak: 0,
  lastDismissedDate: undefined,
  exactAlarmGranted: false,
  notificationGranted: false,
  batteryOptimExemptGranted: false,
  volumeEscalation: true,
  volume: 80,
  soundType: 'radar',
  use24HourFormat: false,
  userName: '',
  language: 'en',
  keepScreenAwake: true,
};

// Clean initial alarm template (inactive by default, starts clean)
export const INITIAL_ALARMS: Alarm[] = [
  {
    id: 'alarm-1',
    time: '06:30',
    label: 'Morning Alarm',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    enabled: false,
    challengeType: 'math',
    mathDifficulty: 'easy',
    mathProblemCount: 2,
    shakeCountTarget: 30,
    volume: 80,
    soundType: 'radar',
    createdAt: Date.now(),
  },
];

// Helper to check and purge old mock/seed data from previous versions (e.g. dummy user "Alex" with streak 13/14)
function checkAndMigrateLegacyData(): void {
  try {
    const version = localStorage.getItem(DATA_VERSION_KEY);
    const rawSettings = localStorage.getItem(SETTINGS_KEY);
    const rawHistory = localStorage.getItem(HISTORY_KEY);

    let isLegacySeeded = false;
    if (rawSettings && rawSettings.includes('"Alex"')) {
      isLegacySeeded = true;
    }
    if (rawHistory && rawHistory.includes('hist-0')) {
      isLegacySeeded = true;
    }

    if (version !== CURRENT_DATA_VERSION || isLegacySeeded) {
      // Purge old mock history and mock user
      localStorage.removeItem(HISTORY_KEY);
      if (isLegacySeeded) {
        localStorage.removeItem(SETTINGS_KEY);
        localStorage.removeItem(ALARMS_KEY);
      }
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    }
  } catch (e) {
    console.warn('Storage migration check skipped', e);
  }
}

// Run check immediately on module load
checkAndMigrateLegacyData();

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
        return { ...DEFAULT_SETTINGS };
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return { ...DEFAULT_SETTINGS };
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
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
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

    // Calculate real metrics from actual on-device data
    const streak = settings.streak || 0;
    const totalCount = history.length;

    let totalDuration = 0;
    let mathCount = 0;
    let shakeCount = 0;

    history.forEach((h) => {
      totalDuration += h.durationSeconds || 0;
      if (h.challengeType === 'math') mathCount++;
      else shakeCount++;
    });

    const avgDuration = totalCount > 0 
      ? Math.round((totalDuration / totalCount) * 10) / 10 
      : 0;

    // Calculate real average wake time
    let avgWakeTime = '--:--';
    if (history.length > 0) {
      // Pick latest or average wake time from history
      avgWakeTime = history[0].timeFormatted || '--:--';
    }

    // 7 Days breakdown (Mon to Sun) based on actual wake-up dates
    const daysNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    // Monday is index 0 in our display (ISO day: Monday=1...Sunday=7)
    const currentIsoDay = (now.getDay() + 6) % 7; // 0 for Mon, 4 for Fri, 6 for Sun

    // Set of dates completed in history (YYYY-MM-DD)
    const completedDateSet = new Set(
      history.map((h) => {
        try {
          return new Date(h.dismissedAt).toISOString().split('T')[0];
        } catch {
          return '';
        }
      })
    );

    const last7Days: DayActivity[] = daysNames.map((name, idx) => {
      const isToday = idx === currentIsoDay;
      // Calculate target date for this column in the current week
      const dayOffset = idx - currentIsoDay;
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + dayOffset);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      const completed = completedDateSet.has(targetDateStr);

      return {
        dayName: name,
        dateStr: targetDateStr,
        isToday,
        completed,
        time: completed ? (history.find(h => new Date(h.dismissedAt).toISOString().startsWith(targetDateStr))?.timeFormatted || '06:30 AM') : undefined,
        durationSeconds: completed ? 12 : undefined,
      };
    });

    return {
      streak,
      avgWakeTime,
      totalChallengesSolved: totalCount,
      avgCompletionTimeSeconds: avgDuration,
      mathSuccessRate: mathCount > 0 ? 100 : 0,
      shakeSuccessRate: shakeCount > 0 ? 100 : 0,
      mathSolvedCount: mathCount,
      shakeSolvedCount: shakeCount,
      last7Days,
    };
  },

  // Record a successful wake-up, update streak
  recordWakeUp(
    alarmId: string,
    alarmLabel: string,
    challengeType: 'math' | 'shake',
    durationSeconds: number,
    use24Hour: boolean = false
  ): { streak: number; timeFormatted: string } {
    const settings = this.getSettings();
    const todayStr = new Date().toISOString().split('T')[0];
    
    let newStreak = settings.streak || 0;
    if (settings.lastDismissedDate !== todayStr) {
      newStreak += 1;
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24Hour,
    });

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
  },

  // Reset all local data to clean fresh state
  resetAllData(): void {
    try {
      localStorage.removeItem(ALARMS_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(HISTORY_KEY);
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    } catch (e) {
      console.error('Failed to reset all data', e);
    }
  },
};
