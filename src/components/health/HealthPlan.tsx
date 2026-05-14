import React from 'react';
import { motion } from 'motion/react';
import { Dumbbell, ArrowRight, CheckCircle2 } from 'lucide-react';
import { WorkoutPlan, Exercise, EXERCISES } from '../../constants/health';

interface HealthPlanProps {
  plan: WorkoutPlan;
  isRestDay: boolean;
  todaysExercises: string[];
  workoutDone: boolean;
  exercisesCompleted: number;
  onStartWorkout: () => void;
  onLogWalk: () => void;
}

export const HealthPlan: React.FC<HealthPlanProps> = ({ 
  plan, 
  isRestDay, 
  todaysExercises, 
  workoutDone, 
  exercisesCompleted,
  onStartWorkout,
  onLogWalk
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-forest/5 font-health">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-black flex items-center gap-2">
            <Dumbbell className="text-[#7C2D12]" size={20} /> Exercise Plan
          </h3>
          <p className="text-xs opacity-60 font-bold">{plan.name} Plan · {plan.description}</p>
        </div>
        {workoutDone && (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Done
          </div>
        )}
      </div>

      {plan.banner && (
        <div className="bg-brand-forest/5 p-3 rounded-xl mb-6 flex items-center gap-3">
          <span className="text-xl">🕌</span>
          <p className="text-[10px] font-bold opacity-60 leading-tight">{plan.banner}</p>
        </div>
      )}

      {isRestDay ? (
        <div className="space-y-4">
          <div className="p-4 bg-brand-forest/5 rounded-2xl border border-brand-forest/5">
            <p className="text-sm font-black italic">Today is a Rest Day 😴</p>
            <p className="text-xs font-bold opacity-60 mt-1">Recovery is part of your growth. Perhaps a gentle walk?</p>
          </div>
          <button 
            onClick={onLogWalk}
            disabled={workoutDone}
            className="w-full h-[52px] bg-brand-forest text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            Log 20-min Walk (+20 pts)
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            {todaysExercises.slice(0, 3).map((exId, i) => {
              const ex = EXERCISES[exId];
              return (
                <div key={exId} className="flex items-center justify-between p-3 bg-brand-forest/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black opacity-20">{i + 1}</span>
                    <p className="text-xs font-black">{ex.name}</p>
                  </div>
                  <p className="text-[10px] font-bold opacity-40">{ex.sets} × {ex.reps}</p>
                </div>
              );
            })}
            {todaysExercises.length > 3 && (
              <p className="text-center text-[10px] font-black uppercase tracking-widest opacity-20 underline">
                + {todaysExercises.length - 3} more exercises
              </p>
            )}
          </div>

          <div className="space-y-4">
            {!workoutDone && (
              <div className="h-2 w-full bg-brand-forest/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(exercisesCompleted / todaysExercises.length) * 100}%` }}
                  className="h-full bg-brand-forest"
                />
              </div>
            )}
            
            {workoutDone ? (
              <div className="flex flex-col items-center justify-center py-2 text-green-600">
                <CheckCircle2 size={32} className="mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">Workout Complete! (+50 pts)</p>
              </div>
            ) : (
              <button 
                onClick={onStartWorkout}
                className="w-full h-[52px] bg-[#7C2D12] text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#7C2D12]/20 active:scale-95 transition-all"
              >
                Start Session <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
