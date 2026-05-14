export const MIZAN_POINTS = {
  SALAT_FARD: 20,
  SALAT_SUNNAH: 10,
  WATER_GOAL: 15,
  HEALTH_HABIT: 10,
  WORKOUT: 50,
  CAREER_TASK: 25,
  DAILY_LOG: 10,
  ADHKAR_SET: 15,
};

export const calculateLevel = (points: number) => {
  if (points < 500) return { title: 'Mubtadi', level: 1, next: 500 };
  if (points < 1500) return { title: 'Talib', level: 2, next: 1500 };
  if (points < 3000) return { title: 'Salik', level: 3, next: 3000 };
  if (points < 6000) return { title: 'Mujtahid', level: 4, next: 6000 };
  if (points < 12000) return { title: 'Muttaqi', level: 5, next: 12000 };
  return { title: 'Rabbani', level: 6, next: 999999 };
};
