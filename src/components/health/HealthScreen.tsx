import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart,
  Droplets,
  Utensils,
  Dumbbell,
  Zap,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useFirebase } from '../../FirebaseContext';
import { getHealthDaily, createHealthDaily, updateHealthDaily, HealthDaily } from '../../services/healthService';
import { WORKOUT_PLANS, EXERCISES } from '../../constants/health';
import { format } from 'date-fns';
import { WaterTracker } from './WaterTracker';
import { HealthPlan } from './HealthPlan';
import { BodyLog } from './BodyLog';
import { WorkoutSession } from './WorkoutSession';

export const HealthScreen: React.FC = () => {
  const { user, profile } = useFirebase();
  const [data, setData] = useState<HealthDaily | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWorkout, setShowWorkout] = useState(false);
  const [pointsToast, setPointsToast] = useState<{ show: boolean, text: string }>({ show: false, text: '' });

  const today = format(new Date(), 'yyyy-MM-dd');
  const dayOfWeek = new Date().getDay();
  const planId = profile?.fitnessLevel?.toLowerCase() || 'beginner';
  const plan = WORKOUT_PLANS[planId] || WORKOUT_PLANS.beginner;
  const todaysExercises = plan.schedule[dayOfWeek] || [];
  const isRestDay = todaysExercises.length === 0;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let dailyData = await getHealthDaily(user.uid, today);
        if (!dailyData) {
          dailyData = await createHealthDaily(user.uid, today);
        }
        setData(dailyData);
      } catch (e) {
        console.error("Health fetch error:", e);
      }
      setLoading(false);
    };
    fetchData();
  }, [user, today]);

  const showToast = useCallback((text: string) => {
    setPointsToast({ show: true, text });
    setTimeout(() => setPointsToast({ show: false, text: '' }), 2000);
  }, []);

  const handleUpdate = useCallback(async (updates: Partial<HealthDaily>, points: number = 0) => {
    if (!user || !data) return;
    const newData = { ...data, ...updates };
    if (points > 0) newData.points_today += points;
    setData(newData);
    await updateHealthDaily(user.uid, today, updates, points);
    if (points > 0) showToast(`+${points} pts · Mizan Balanced`);
  }, [user, data, today, showToast]);

  const addWater = useCallback(() => {
    if (!data) return;
    const newCount = Math.min(8, data.glasses_water + 1);
    if (newCount === data.glasses_water) return;
    const points = newCount === 8 ? 25 : 5; // 20 bonus + 5 standard
    handleUpdate({ glasses_water: newCount }, points);
  }, [data, handleUpdate]);

  const toggleMeal = useCallback((mealKey: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (!data) return;
    const isNowDone = !data[mealKey];
    handleUpdate({ [mealKey]: isNowDone }, isNowDone ? 15 : -15);
  }, [data, handleUpdate]);

  const updateWeight = useCallback((val: number) => {
    handleUpdate({ weight: val });
  }, [handleUpdate]);

  const updateSleep = useCallback((delta: number) => {
    if (!data) return;
    const newSleep = Math.max(0, Math.min(24, data.sleep_hours + delta));
    handleUpdate({ sleep_hours: newSleep });
  }, [data, handleUpdate]);

  const updateEnergy = useCallback((val: number) => {
    handleUpdate({ energy_level: val });
  }, [handleUpdate]);

  const onWorkoutComplete = useCallback(async (exercisesCount: number, duration: number) => {
    setShowWorkout(false);
    await handleUpdate({
      workout_done: true,
      exercises_completed: exercisesCount,
      workout_duration_minutes: duration
    }, 50);
  }, [handleUpdate]);

  const onLogWalk = useCallback(() => {
    handleUpdate({ workout_done: true }, 20);
  }, [handleUpdate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="animate-spin text-brand-gold" size={40} />
      </div>
    );
  }

  const workoutProgress = isRestDay ? 1 : (data?.workout_done ? 1 : (data?.exercises_completed || 0) / (todaysExercises.length || 1));
  const waterProgress = (data?.glasses_water || 0) / 8;
  const mealsCount = [data?.breakfast, data?.lunch, data?.dinner, data?.snack].filter(Boolean).length;
  const mealsProgress = mealsCount / 4;
  const overallPercent = Math.round(((workoutProgress + waterProgress + mealsProgress) / 3) * 100);

  return (
    <div className="pt-4 space-y-10 pb-24 font-health">
      {/* Points Toast */}
      <AnimatePresence>
        {pointsToast.show && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-brand-forest text-white px-6 py-3 rounded-full font-black text-sm shadow-2xl flex items-center gap-2"
          >
            {pointsToast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-start px-2">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-forest italic leading-none">Health Pillar</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/30 mt-2">Vitality & Prophetic Wellness</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#7C2D12]/10 flex items-center justify-center text-[#7C2D12]">
          <Heart size={24} />
        </div>
      </header>

      {/* Overview Card */}
      <section className="bg-[#7C2D12] text-white rounded-3xl p-6 shadow-xl shadow-[#7C2D12]/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Daily Mizan Score</span>
            <span className="text-3xl font-black">{overallPercent}%</span>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-[10px] font-black opacity-40 uppercase tracking-widest">
                <span>Hydration</span>
                <span>{data?.glasses_water}/8</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${waterProgress * 100}%` }} className="h-full bg-blue-400" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-[10px] font-black opacity-40 uppercase tracking-widest">
                <span>Vitality</span>
                <span>{data?.workout_done ? '1/1' : '0/1'}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${workoutProgress * 100}%` }} className="h-full bg-green-400" />
              </div>
            </div>
          </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </section>

      <section>
        <WaterTracker glasses={data?.glasses_water || 0} onAdd={addWater} />
      </section>

      <section>
        <HealthPlan 
          plan={plan}
          isRestDay={isRestDay}
          todaysExercises={todaysExercises}
          workoutDone={data?.workout_done || false}
          exercisesCompleted={data?.exercises_completed || 0}
          onStartWorkout={() => setShowWorkout(true)}
          onLogWalk={onLogWalk}
        />
      </section>

      {/* Meals Checklist - Quick Access */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-brand-forest/5 font-health">
         <h3 className="text-lg font-black flex items-center gap-2 mb-6">
            <Utensils className="text-orange-500" size={20} /> Today's Meals
          </h3>
          <div className="grid grid-cols-2 gap-3">
             {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => (
               <button 
                key={meal}
                onClick={() => toggleMeal(meal)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${data?.[meal] ? 'bg-green-50 border-green-200 text-green-700' : 'bg-brand-forest/5 border-transparent opacity-40'}`}
               >
                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data?.[meal] ? 'bg-green-500 border-green-500 text-white' : 'border-current'}`}>
                    {data?.[meal] && <CheckCircle2 size={12} />}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">{meal}</span>
               </button>
             ))}
          </div>
      </section>

      <section className="pb-12">
        <BodyLog 
          weight={data?.weight}
          sleep={data?.sleep_hours || 7}
          energy={data?.energy_level || 3}
          onUpdateWeight={updateWeight}
          onUpdateSleep={updateSleep}
          onUpdateEnergy={updateEnergy}
          onSave={() => handleUpdate({}, 10)}
        />
      </section>

      {/* Workout Session Modal */}
      {showWorkout && (
        <WorkoutSession 
          exerciseIds={todaysExercises}
          workoutName={plan.name}
          onComplete={onWorkoutComplete}
          onClose={() => setShowWorkout(false)}
        />
      )}
    </div>
  );
};
