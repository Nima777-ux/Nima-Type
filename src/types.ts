export type TestMode = 'time' | 'words' | 'quote' | 'code' | 'custom';

export type TimeDuration = 15 | 30 | 60 | 120;
export type WordCount = 10 | 25 | 50 | 100;
export type QuoteLength = 'all' | 'short' | 'medium' | 'long';
export type CodeLanguage = 'javascript' | 'python' | 'html';

export type SoundProfile = 'cherry_blue' | 'cherry_brown' | 'cherry_red' | 'cyber_laser' | 'typewriter' | 'off';

export type ColorTheme = 'nima_custom';

export type FingerName =
  | 'left_pinky'
  | 'left_ring'
  | 'left_middle'
  | 'left_index'
  | 'thumb'
  | 'right_index'
  | 'right_middle'
  | 'right_ring'
  | 'right_pinky';

export type ErrorType = 'substitution' | 'transposition' | 'intrusion' | 'omission' | 'case';

export interface KeystrokeEvent {
  key: string;
  code: string;
  expected: string;
  timestamp: number;
  latencyMs: number;
  isCorrect: boolean;
  finger: FingerName;
  errorType?: ErrorType;
}

export interface FingerStat {
  finger: FingerName;
  label: string;
  hand: 'left' | 'right' | 'thumb';
  count: number;
  errors: number;
  avgLatencyMs: number;
  percentage: number;
  accuracy: number;
}

export interface AdvancedMetrics {
  meanLatencyMs: number;
  latencyJitterMs: number;
  consistencyScore: number;
  errorDistribution: {
    substitution: number;
    transposition: number;
    intrusion: number;
    omission: number;
    case: number;
  };
  fingerDistribution: Record<FingerName, FingerStat>;
  handBalance: {
    leftPercent: number;
    rightPercent: number;
    thumbPercent: number;
  };
  slowestKeys: { key: string; avgLatencyMs: number }[];
  highestErrorKeys: { key: string; errors: number; total: number; errorRate: number }[];
  latencyHistogram: { bin: string; count: number; rangeMin: number; rangeMax: number }[];
  burstWpm: number;
}

export interface WpmPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
  instantLatencyMs?: number;
}

export interface TestResult {
  id: string;
  timestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  testMode: TestMode;
  modeDetail: string;
  durationSeconds: number;
  characters: {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
    total: number;
  };
  keyStats: Record<string, { total: number; errors: number; totalLatencyMs: number }>;
  timeline: WpmPoint[];
  highestStreak: number;
  advancedMetrics: AdvancedMetrics;
}

export type AppLanguage = 'en' | 'fa';
export type ThemeMode = 'dark' | 'light';

export interface KeyCapInfo {
  code: string;
  label: string;
  subLabel?: string;
  width: number;
  row: number;
  col: number;
  finger: FingerName;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  verified: boolean;
  createdAt: number;
  lastLoginAt: number;
  stats?: {
    testsCompleted: number;
    highestWpm: number;
    averageWpm: number;
    totalTimeSeconds: number;
  };
}

export interface AuthSession {
  user: UserAccount;
  token: string;
  loginAt: number;
}
