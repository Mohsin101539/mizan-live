import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Edit2, X } from 'lucide-react';
import { WorkoutPlanId, HealthDailyLog, Exercise } from '../../types';
import { WORKOUT_PLANS } from '../../constants/workoutPlans';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { PlanPickerSheet } from './PlanPickerSheet';
import { WorkoutSessionPlayer } from './WorkoutSessionPlayer';

type CardView = 'default' | 'edit';

interface ExercisePlanCardProps {
  userId: string;
  selectedPlanId: WorkoutPlanId;
  onPlanChange: (id: WorkoutPlanId) => void;
  todayLog: HealthDailyLog | null;
  onWorkoutComplete: (session: any) => void;
}

export const ExercisePlanCard: React.FC<ExercisePlanCardProps> = ({
  userId,
  selectedPlanId,
  onPlanChange,
  todayLog,
  onWorkoutComplete
}) => {
  const [view, setView] = useState<CardView>('default');
  const [showPlayer, setShowPlayer] = useState(false);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [customExName, setCustomExName] = useState('');

  // Compute today's workout
  const todayDayOfWeek = new Date().getDay();
  const plan = WORKOUT_PLANS.find(p => p.id === selectedPlanId) || WORKOUT_PLANS[0];
  const todayPlan = plan.schedule.find(d => d.dayOfWeek === todayDayOfWeek);
  
  const isRestDay = todayPlan?.isRestDay ?? true;
  const workoutName = todayPlan?.workoutName ?? 'Rest Day';
  
  const [todayExercises, setTodayExercises] = useState<Exercise[]>(todayPlan?.exercises ?? []);

  // Use props for done state
  const isWorkoutDone = todayLog?.workoutDone ?? false;
  const hasWalkLogged = todayLog?.walkLogged ?? false;

  const estimatedDuration = Math.ceil(
    todayExercises.reduce((acc, ex) => {
      const activeTime = ex.type === 'duration' ? (ex.durationSeconds || 0) : ((ex.reps || 10) * 3); // Approx 3s per rep
      return acc + (activeTime * ex.sets) + (ex.restSeconds * ex.sets);
    }, 0) / 60
  );

  const handleLogWalk = async () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const docRef = doc(db, 'health_daily', `${userId}_${dateStr}`);
    
    try {
      await setDoc(docRef, {
        userId,
        date: dateStr,
        walkLogged: true,
        workoutDone: true,
        pointsFromHealth: increment(20)
      }, { merge: true });
      await updateDoc(doc(db, 'users', userId), {
        points: increment(20)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCustomExercise = () => {
    if (!customExName.trim()) return;
    const customExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: customExName,
      category: 'upper',
      type: 'reps',
      sets: 1, 
      reps: 1, 
      restSeconds: 60,
      tip: 'Custom exercise — you know what to do!',
      isCustom: true
    };
    setTodayExercises(prev => [...prev, customExercise]);
    setCustomExName('');
  };

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-xl shadow-[#7C2D12]/5 border border-black/5 font-health relative overflow-hidden group">
      {/* Decorative */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] -mr-8 -mt-8 rotate-12 scale-150 pointer-events-none transition-transform duration-700 group-hover:scale-125">
        <Dumbbell className="w-64 h-64 text-[#7C2D12]" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-black flex items-center gap-3 tracking-tight text-gray-900">
              <span className="p-2 bg-[#7C2D12]/10 text-[#7C2D12] rounded-xl"><Dumbbell size={20} /></span>
              Exercise Plan
              {isWorkoutDone && (
                <span className="ml-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Done
                </span>
              )}
            </h3>
            <p className="text-sm font-medium text-gray-500 mt-2">
              {plan.name} <span className="opacity-40">·</span> {plan.daysPerWeek} days/week
            </p>
          </div>

          {!isRestDay && !isWorkoutDone && view === 'default' && (
            <button 
              onClick={() => setView('edit')} 
              className="text-gray-400 hover:text-gray-900 transition-colors p-2 bg-gray-50 rounded-xl"
              title="Edit Plan"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>

        <div className="border-t border-gray-100 my-4"></div>

        {isRestDay ? (
          <div className="space-y-6">
             <div className="text-center py-6">
               <div className="text-4xl mb-4">😴</div>
               <h4 className="text-lg font-black text-gray-900 mb-2">Today is a Rest Day</h4>
               <p className="text-sm text-gray-500 leading-relaxed max-w-[250px] mx-auto">
                 Recovery is part of your growth. Your body repairs during rest.
               </p>
             </div>

             <AnimatePresence mode="wait">
               {hasWalkLogged || isWorkoutDone ? (
                 <motion.div
                   key="done"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="w-full h-[52px] bg-green-50 text-green-700 rounded-xl font-black uppercase tracking-widest flex items-center justify-center border border-green-100 shadow-sm"
                 >
                   ✅ Walk Logged Today! +20 pts
                 </motion.div>
               ) : (
                 <motion.button
                   key="log"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   whileTap={{ scale: 0.97 }}
                   onClick={handleLogWalk}
                   className="w-full h-[52px] bg-[#1B4332] text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center shadow-lg shadow-[#1B4332]/20"
                 >
                   🚶 Log 20-Minute Walk (+20 pts)
                 </motion.button>
               )}
             </AnimatePresence>
          </div>
        ) : isWorkoutDone ? (
          <div className="space-y-4">
             <h4 className="font-black text-gray-900 text-lg flex items-center gap-2">
               ✅ {workoutName} — Complete!
             </h4>
             <p className="text-sm text-gray-500 font-medium">
               {todayLog?.workoutSession?.totalDurationMinutes || estimatedDuration} minutes · {todayExercises.length} exercises · +{todayLog?.workoutSession?.pointsEarned || 50} pts earned
             </p>
             <p className="text-sm text-gray-600 mt-4 font-playfair italic">
               Great work! Rest up and come back tomorrow 💪
             </p>
          </div>
        ) : view === 'edit' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-gray-900 text-lg">✏ Edit Today's Workout</h4>
              <button 
                onClick={() => setView('default')}
                className="px-4 py-2 bg-green-50 text-green-700 font-black uppercase tracking-widest text-xs rounded-xl"
              >
                ✓ Save Mix
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {todayExercises.map((ex, index) => (
                  <motion.div
                    key={ex.id + '-' + index}
                    layout
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{ex.name}</span>
                      <span className="font-bold text-gray-400 text-xs">
                        {ex.sets} × {ex.type === 'reps' ? `${ex.reps} reps` : `${ex.durationSeconds} sec`}
                      </span>
                    </div>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        const newEx = [...todayExercises];
                        newEx.splice(index, 1);
                        setTodayExercises(newEx);
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-[#7C2D12]/10 text-[#7C2D12] rounded-full"
                    >
                       <X size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="pt-4 border-t border-gray-100">
               <p className="text-sm font-black text-gray-900 mb-2">+ Add Custom Exercise</p>
               <div className="flex gap-2">
                 <input 
                   value={customExName}
                   onChange={e => setCustomExName(e.target.value)}
                   placeholder='e.g. "4x10 Bulgarian Split Squats"' 
                   className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                 />
                 <button 
                   onClick={handleAddCustomExercise}
                   className="px-4 py-3 bg-[#7C2D12] text-white rounded-xl font-bold text-sm"
                 >
                   Add
                 </button>
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="font-black text-gray-900 text-lg">{todayDayOfWeek === 0 ? 'Sunday' : todayDayOfWeek === 1 ? 'Monday' : todayDayOfWeek === 2 ? 'Tuesday' : todayDayOfWeek === 3 ? 'Wednesday' : todayDayOfWeek === 4 ? 'Thursday' : todayDayOfWeek === 5 ? 'Friday' : 'Saturday'}: {workoutName}</h4>
              <p className="text-sm text-gray-500">{todayExercises.length} exercises · ~{estimatedDuration} mins</p>
            </div>

            <div className="space-y-3">
              {todayExercises.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-600">
                  <p className="font-bold mb-1">💪 No exercises set for today.</p>
                  <p>Tap "Edit" to add your own, or switch your plan.</p>
                </div>
              ) : (
                todayExercises.map((ex, index) => (
                  <div key={`${ex.id}-${index}`} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[#7C2D12] rounded-full"></div>
                      <span className="font-medium text-gray-700">{ex.name}</span>
                    </div>
                    <span className="font-bold text-gray-400 text-xs">
                      {ex.sets} × {ex.type === 'reps' ? `${ex.reps} reps` : `${ex.durationSeconds} sec`}
                    </span>
                  </div>
                ))
              )}
            </div>

            <motion.button 
              whileTap={{ scale: 0.97 }}
              whileHover={{ filter: 'brightness(1.05)' }}
              onClick={() => setShowPlayer(true)}
              disabled={todayExercises.length === 0}
              className="w-full h-[52px] bg-[#7C2D12] text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[#7C2D12]/20 disabled:opacity-50"
            >
              ▶ Start Session
            </motion.button>
          </div>
        )}

        {view === 'default' && (
          <div className="mt-8">
            <button 
              onClick={() => setShowPlanPicker(true)}
              className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              Switch Plan ↓
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPlanPicker && (
          <PlanPickerSheet 
            selectedPlanId={selectedPlanId}
            onSelect={onPlanChange}
            onClose={() => setShowPlanPicker(false)}
          />
        )}
        {showPlayer && (
          <WorkoutSessionPlayer
            userId={userId}
            planId={selectedPlanId}
            workoutName={workoutName}
            exercises={todayExercises}
            onClose={() => setShowPlayer(false)}
            onSessionComplete={onWorkoutComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
