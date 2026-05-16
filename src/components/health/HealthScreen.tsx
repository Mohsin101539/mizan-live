import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Droplets, Dumbbell, Loader2 } from 'lucide-react';
import { useFirebase } from '../../FirebaseContext';
import { WORKOUT_PLANS } from '../../constants/health';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { WaterTracker } from './WaterTracker';
import { ExercisePlanCard } from './ExercisePlanCard';
import { BodyLog } from './BodyLog';
import { BodyProgress } from './BodyProgress';
import { WorkoutSession } from './WorkoutSession';
import { NutritionVault } from './NutritionVault';
import { useTranslation } from 'react-i18next';
import { useHealthDaily } from '../../features/health/hooks/useHealthDaily';
import { useUpdateHealthStat } from '../../features/health/hooks/useUpdateHealthStat';
import { authorizeWearable, syncDailyHealthData } from '../../services/wearableService';

export const HealthScreen: React.FC = () => {
  const { user, profile } = useFirebase();
  const { t } = useTranslation();
  
  const { data, isLoading: loading } = useHealthDaily();
  const { mutate: updateHealth } = useUpdateHealthStat();

  const [showWorkout, setShowWorkout] = useState(false);
  const [pointsToast, setPointsToast] = useState<{ show: boolean, text: string }>({ show: false, text: '' });
  const [connectingWearable, setConnectingWearable] = useState(false);

  const dayOfWeek = new Date().getDay();
  const planId = profile?.fitnessLevel?.toLowerCase() || 'beginner';

  const handleConnectWearable = async (provider: 'apple_health' | 'google_fit') => {
    if (!user) return;
    setConnectingWearable(true);
    try {
      const { token } = await authorizeWearable(provider);
      const syncedData = await syncDailyHealthData();
      
      // Update profile
      await updateDoc(doc(db, 'users', user.uid), {
        wearableConnected: true,
        wearableProvider: provider
      });
      
      // Update today's data
      handleUpdate({
        steps: syncedData.steps,
        sleep_hours: syncedData.sleep_hours
      });
      
      showToast(`Connected to ${provider === 'apple_health' ? 'Apple Health' : 'Google Fit'}!`);
    } catch (e) {
      console.error(e);
      showToast('Connection failed');
    } finally {
      setConnectingWearable(false);
    }
  };
  const plan = WORKOUT_PLANS[planId] || WORKOUT_PLANS.beginner;
  const todaysExercises = profile?.customRoutines?.[dayOfWeek] || plan.schedule[dayOfWeek] || [];
  const isRestDay = todaysExercises.length === 0;

  const handleUpdateRoutine = async (exercises: string[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        customRoutines: {
          [dayOfWeek]: exercises
        }
      }, { merge: true });
    } catch (e) {
      console.error("Failed to update routine", e);
    }
  };

  const showToast = useCallback((text: string) => {
    setPointsToast({ show: true, text });
    setTimeout(() => setPointsToast({ show: false, text: '' }), 2000);
  }, []);

  const handleUpdate = useCallback((updates: any, points: number = 0) => {
    updateHealth({ updates, points }, {
      onSuccess: () => {
        if (points > 0) showToast(`+${points} pts · Mizan Balanced`);
      }
    });
  }, [updateHealth, showToast]);

  const addWater = useCallback(() => {
    if (!data) return;
    const newCount = Math.min(8, data.glasses_water + 1);
    if (newCount === data.glasses_water) return;
    const points = newCount === 8 ? 25 : 5;
    handleUpdate({ glasses_water: newCount }, points);
  }, [data, handleUpdate]);

  const updatePinnedFoods = useCallback(async (newPinned: string[]) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { pinnedFoods: newPinned });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
    }
  }, [user]);

  const onLogFood = useCallback((food: string) => {
    if (!data) return;
    const currentMeals = data.meals_logged || [];
    handleUpdate({ meals_logged: [...currentMeals, food] }, 10);
  }, [data, handleUpdate]);

  const updateWeight = useCallback((val: number) => {
    handleUpdate({ weight: val });
  }, [handleUpdate]);

  const updateHeight = useCallback(async (val: number) => {
    if (!user) return;
    handleUpdate({ height: val });
    try {
      await updateDoc(doc(db, 'users', user.uid), { height: val });
    } catch (e) {
      console.error("Profile height update error:", e);
    }
  }, [user, handleUpdate]);

  const updateSleep = useCallback((delta: number) => {
    if (!data) return;
    const newSleep = Math.max(0, Math.min(24, data.sleep_hours + delta));
    handleUpdate({ sleep_hours: newSleep });
  }, [data, handleUpdate]);

  const updateEnergy = useCallback((val: number) => {
    handleUpdate({ energy_level: val });
  }, [handleUpdate]);

  const updateSteps = useCallback((val: number) => {
    handleUpdate({ steps: val });
  }, [handleUpdate]);

  const handlePlanChange = useCallback(async (newPlanId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { selectedPlanId: newPlanId });
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const onWorkoutSessionComplete = useCallback((session: any) => {
    setShowWorkout(false);
    // State is expected to be updated by the component itself ideally or we refresh.
  }, []);

  const onWorkoutComplete = useCallback((duration: number, name: string) => {
    setShowWorkout(false);
    handleUpdate({
      workout_done: true,
      exercises_completed: todaysExercises.length || 1,
      workout_duration_minutes: duration
    }, duration); // 1 point per 1 min
  }, [handleUpdate, todaysExercises.length]);

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
  const mealsCount = data?.meals_logged?.length || 0;
  const mealsProgress = Math.min(mealsCount / 3, 1);
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

      <header className="flex justify-between items-start px-2 pr-14 lg:pr-2">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-forest italic leading-none">{t('health.pillarTitle', 'Health Pillar')}</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/30 mt-2">{t('health.pillarSubtitle', 'Vitality & Prophetic Wellness')}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#7C2D12]/10 flex items-center justify-center text-[#7C2D12]">
          <Heart size={24} />
        </div>
      </header>

      {/* Overview Card */}
      <section className="bg-[#7C2D12] text-white rounded-3xl p-6 shadow-xl shadow-[#7C2D12]/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{t('health.dailyScore', 'Daily Mizan Score')}</span>
            <span className="text-3xl font-black">{overallPercent}%</span>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-[10px] font-black opacity-40 uppercase tracking-widest">
                <span>{t('health.water', 'Hydration')}</span>
                <span>{data?.glasses_water}/8</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${waterProgress * 100}%` }} className="h-full bg-blue-400" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-[10px] font-black opacity-40 uppercase tracking-widest">
                <span>{t('health.workout', 'Vitality')}</span>
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
        <BodyProgress weight={data?.weight || profile?.currentWeight} height={data?.height || profile?.height} />
      </section>

      <section>
        <WaterTracker glasses={data?.glasses_water || 0} onAdd={addWater} />
      </section>

      <section>
        <ExercisePlanCard 
          userId={user?.uid || ''}
          selectedPlanId={(profile?.selectedPlanId as any) || 'beginner'}
          onPlanChange={handlePlanChange}
          todayLog={data as any}
          onWorkoutComplete={onWorkoutSessionComplete}
        />
      </section>

      {/* Quick-Add Nutrition Vault */}
      <section>
        <NutritionVault 
          pinnedFoods={profile?.pinnedFoods || ['Oatmeal', 'Dates', 'Protein Shake']}
          mealsLogged={data?.meals_logged || []}
          onLogFood={onLogFood}
          onUpdatePinned={updatePinnedFoods}
        />
      </section>

      <section className="pb-12">
        <BodyLog 
          weight={data?.weight || profile?.currentWeight}
          height={data?.height || profile?.height}
          steps={data?.steps}
          sleep={data?.sleep_hours || 7}
          energy={data?.energy_level || 3}
          wearableConnected={profile?.wearableConnected}
          wearableProvider={profile?.wearableProvider}
          connectingWearable={connectingWearable}
          onConnectWearable={handleConnectWearable}
          onUpdateWeight={updateWeight}
          onUpdateHeight={updateHeight}
          onUpdateSteps={updateSteps}
          onUpdateSleep={updateSleep}
          onUpdateEnergy={updateEnergy}
          onSave={() => handleUpdate({}, 10)}
        />
      </section>

      {/* Workout Session Modal */}
      {showWorkout && (
        <WorkoutSession 
          exercises={todaysExercises}
          onComplete={onWorkoutComplete}
          onClose={() => setShowWorkout(false)}
        />
      )}
    </div>
  );
};
