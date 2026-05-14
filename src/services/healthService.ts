import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { OperationType } from './firebase';

export interface HealthDaily {
  userId: string;
  date: string;
  workout_done: boolean;
  exercises_completed: number;
  workout_duration_minutes: number;
  glasses_water: number;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  snack: boolean;
  sleep_hours: number;
  energy_level: number;
  weight?: number;
  points_today: number;
  perfect_day_bonus_awarded?: boolean;
}

const handleFirestoreError = (error: any, type: OperationType, path: string) => {
  console.error(`Firestore Error [${type}] at ${path}:`, error);
  throw error;
};

export const getHealthDaily = async (userId: string, date: string): Promise<HealthDaily | null> => {
  const docId = `${userId}_${date}`;
  try {
    const snap = await getDoc(doc(db, 'health_daily', docId));
    if (snap.exists()) {
      return snap.data() as HealthDaily;
    }
    return null;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, `health_daily/${docId}`);
    return null;
  }
};

export const createHealthDaily = async (userId: string, date: string): Promise<HealthDaily> => {
  const docId = `${userId}_${date}`;
  const newData: HealthDaily = {
    userId,
    date,
    workout_done: false,
    exercises_completed: 0,
    workout_duration_minutes: 0,
    glasses_water: 0,
    breakfast: false,
    lunch: false,
    dinner: false,
    snack: false,
    sleep_hours: 7,
    energy_level: 3,
    points_today: 0,
    perfect_day_bonus_awarded: false
  };
  try {
    await setDoc(doc(db, 'health_daily', docId), newData);
    return newData;
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, `health_daily/${docId}`);
    return newData;
  }
};

export const updateHealthDaily = async (userId: string, date: string, data: Partial<HealthDaily>, pointsToAdd: number = 0) => {
  const docId = `${userId}_${date}`;
  try {
    const updateData = { ...data };
    if (pointsToAdd !== 0) {
      (updateData as any).points_today = increment(pointsToAdd);
    }
    await updateDoc(doc(db, 'health_daily', docId), updateData);
    
    if (pointsToAdd !== 0) {
      await updateDoc(doc(db, 'users', userId), {
        points: increment(pointsToAdd)
      });
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `health_daily/${docId}`);
  }
};
