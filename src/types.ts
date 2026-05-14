export type Pillar = 'deen' | 'career' | 'health';

// DEEN
export type PrayerStatus = 'upcoming' | 'current' | 'missed' | 'done';

export interface SalatLog {
  id: string;
  prayerName: string;
  time: string;
  status: PrayerStatus;
  pointsEarned: number;
  timestamp: number;
}

export interface AdhkarItem {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  countRequired: number;
  currentCount: number;
}

// CAREER
export interface CareerGoal {
  id: string;
  title: string;
  targetDate: string;
  isCompleted: boolean;
  progress: number;
}

export interface CareerTask {
  id: string;
  goalId: string;
  title: string;
  isCompleted: boolean;
  points: number;
}

// HEALTH
export interface Habit {
  id: string;
  title: string;
  icon: string;
  isCompleted: boolean;
  points: number;
}

export interface HealthLog {
  waterGlasses: number;
  weight: number;
  sleepHours: number;
  energyLevel: number; // 1-5
}

// REWARDS
export interface UserProfile {
  name: string;
  points: number;
  streak: number;
  level: number;
  badges: string[];
}
