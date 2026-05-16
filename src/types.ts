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
  streakFreezes?: number;
  level: number;
  badges: string[];
  height?: number;
  currentWeight?: number;
  city?: string;
  country?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  age?: number;
  careerGoal?: string;
  fitnessLevel?: string;
  calculationMethod?: string;
  language?: string;
  wearableConnected?: boolean;
  wearableProvider?: 'google_fit' | 'apple_health' | null;
  pinnedFoods?: string[];
  customRoutines?: Record<number, string[]>;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  adminUid: string;
  createdAt: any;
}

export interface GroupMember {
  uid: string;
  name: string;
  points: number;
  streak: number;
  joinedAt: any;
}

export type WorkoutPlanId = 'beginner' | 'intermediate' | 'sunnah';

export interface Exercise {
  id: string;
  name: string;
  category: 'upper' | 'lower' | 'core' | 'cardio' | 'recovery';
  type: 'reps' | 'duration'; // reps = count-based, duration = time-based
  sets: number;
  reps?: number;           // for type 'reps'
  durationSeconds?: number; // for type 'duration'
  restSeconds: number;     // rest between sets
  tip: string;
  isCustom?: boolean;      // true if user added it manually
}

export interface DayPlan {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday, 1=Monday...
  isRestDay: boolean;
  workoutName: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: WorkoutPlanId;
  name: string;
  description: string;
  daysPerWeek: number;
  schedule: DayPlan[];
}

export interface ActiveSet {
  exerciseId: string;
  setNumber: number;
  completedReps?: number;
  completedDurationSeconds?: number;
  completedAt: Date;
}

export interface WorkoutSession {
  planId: WorkoutPlanId;
  workoutName: string;
  startedAt: Date;
  completedAt?: Date;
  totalDurationMinutes: number;
  completedSets: ActiveSet[];
  exercisesCompleted: number;
  totalExercises: number;
  pointsEarned: number;
  isComplete: boolean;
}

export interface HealthDailyLog {
  userId: string;
  date: string; // "YYYY-MM-DD"
  workoutDone: boolean;
  workoutSession?: WorkoutSession;
  walkLogged: boolean;
  glassesDrunk: number;
  mealsLogged: string[];
  pointsFromHealth: number;
}
