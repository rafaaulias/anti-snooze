export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type ChallengeType = 'math' | 'shake';

export type MathDifficulty = 'easy' | 'medium' | 'hard';

export type NavTab = 'alarms' | 'stats' | 'settings';

export interface CustomRingtone {
  name: string;
  dataUrl: string; // base64 data url for audio
  createdAt: number;
}

export interface Alarm {
  id: string;
  time: string; // "HH:MM" in 24-hour format e.g. "06:30"
  label: string;
  days: DayOfWeek[];
  enabled: boolean;
  challengeType: ChallengeType;
  mathDifficulty: MathDifficulty;
  mathProblemCount: number; // typically 1 to 3
  shakeCountTarget: number; // e.g. 30
  createdAt: number;
  soundType?: 'digital' | 'siren' | 'radar' | 'custom';
  volume?: number; // 5 to 100 per-alarm volume level
}

export interface WakeUpHistoryEntry {
  id: string;
  alarmId: string;
  alarmLabel: string;
  dismissedAt: number;
  timeFormatted: string;
  challengeType: ChallengeType;
  durationSeconds: number;
  streakCount: number;
  success?: boolean;
}

export interface DayActivity {
  dayName: string; // "Mon", "Tue", ...
  dateStr: string; // "YYYY-MM-DD"
  isToday: boolean;
  completed: boolean;
  time?: string;
  durationSeconds?: number;
}

export interface WakeUpStats {
  streak: number;
  avgWakeTime: string; // e.g. "06:30 AM"
  totalChallengesSolved: number;
  avgCompletionTimeSeconds: number;
  mathSuccessRate: number; // percentage e.g. 98
  shakeSuccessRate: number; // percentage e.g. 100
  mathSolvedCount: number;
  shakeSolvedCount: number;
  last7Days: DayActivity[];
}

export interface UserSettings {
  onboardingCompleted: boolean;
  streak: number;
  lastDismissedDate?: string; // YYYY-MM-DD
  exactAlarmGranted: boolean;
  notificationGranted: boolean;
  batteryOptimExemptGranted: boolean;
  volumeEscalation: boolean;
  volume: number; // 0 to 100
  soundType: 'digital' | 'siren' | 'radar' | 'custom';
  customRingtone?: CustomRingtone;
  use24HourFormat: boolean;
  userName?: string;
  language?: 'en' | 'id';
  keepScreenAwake?: boolean;
}

export interface MathProblem {
  question: string;
  answer: number;
}
