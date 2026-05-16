import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, ArrowRight, CheckCircle2, Edit2, X, Plus } from 'lucide-react';
import { WorkoutPlan, Exercise, EXERCISES } from '../../constants/health';
import { useTranslation } from 'react-i18next';

interface HealthPlanProps {
  plan: WorkoutPlan;
  isRestDay: boolean;
  todaysExercises: string[];
  workoutDone: boolean;
  exercisesCompleted: number;
  onStartWorkout: () => void;
  onLogWalk: () => void;
  onUpdateRoutine: (exercises: string[]) => void;
}

export const HealthPlan: React.FC<HealthPlanProps> = ({ 
  plan, 
  isRestDay, 
  todaysExercises, 
  workoutDone, 
  exercisesCompleted,
  onStartWorkout,
  onLogWalk,
  onUpdateRoutine
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for editing
  const [draftExercises, setDraftExercises] = useState<string[]>([]);
  
  const handleEditClick = () => {
    // Map raw IDs to readable names for editing
    const drafts = todaysExercises.map(exId => {
       const ex = EXERCISES[exId];
       if (ex) return `${ex.sets || 3}x${ex.reps || 10} ${ex.name}`;
       return exId;
    });
    setDraftExercises(drafts);
    setIsEditing(true);
  };

  const handleUpdateDraft = (index: number, val: string) => {
    const newDraft = [...draftExercises];
    newDraft[index] = val;
    setDraftExercises(newDraft);
  };
  
  const handleRemoveDraft = (index: number) => {
    const newDraft = draftExercises.filter((_, i) => i !== index);
    setDraftExercises(newDraft);
  };

  const handleAddDraft = () => {
    setDraftExercises([...draftExercises, '']);
  };

  const handleSavePlan = () => {
    const validExercises = draftExercises.filter(ex => ex.trim() !== '');
    onUpdateRoutine(validExercises);
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-br from-white to-[#FAF6F3] rounded-[24px] p-6 sm:p-8 shadow-xl shadow-[#7C2D12]/5 border border-[#7C2D12]/10 font-health relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] -mr-8 -mt-8 rotate-12 scale-150 pointer-events-none transition-transform duration-700 group-hover:scale-125">
        <Dumbbell className="w-64 h-64 text-[#7C2D12]" />
      </div>
      
      <div className="flex justify-between items-start gap-4 mb-6 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 w-full">
            <h3 className="text-xl font-black flex items-center gap-3 tracking-tight text-[#3A2E2A]">
              <span className="p-2 bg-[#7C2D12]/10 text-[#7C2D12] rounded-xl"><Dumbbell size={20} /></span>
              {t('health.exercisePlan', 'Exercise Plan')}
            </h3>
            
            <div className="flex items-center gap-2">
              {!isEditing && !workoutDone && (
                <button onClick={handleEditClick} className="text-[#7C2D12]/40 hover:text-[#7C2D12] transition-colors p-2 bg-white shadow-sm border border-black/5 hover:border-[#7C2D12]/20 rounded-full" title="Edit Plan">
                  <Edit2 size={14} />
                </button>
              )}
              {workoutDone && (
                <div className="bg-[#7C2D12]/10 text-[#7C2D12] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center backdrop-blur-sm">
                  Done
                </div>
              )}
            </div>
          </div>
          <p className="text-sm opacity-60 font-bold mt-2 text-[#3A2E2A] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C2D12] flex-shrink-0"></span>
            <span className="whitespace-nowrap">{plan.name} {t('health.plan', 'Plan')}</span>
            <span className="opacity-40">·</span>
            <span className="line-clamp-1">{plan.description}</span>
          </p>
        </div>
      </div>

      {plan.banner && !isEditing && (
        <div className="bg-brand-forest/5 p-3 rounded-xl mb-6 flex items-center gap-3">
          <span className="text-xl">🕌</span>
          <p className="text-[10px] font-bold opacity-60 leading-tight">{plan.banner}</p>
        </div>
      )}

      {isEditing ? (
        <div className="flex flex-col space-y-4 relative z-20">
          <div className="max-h-56 overflow-y-auto pr-2 space-y-3 pb-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {draftExercises.map((exName, index) => (
                <motion.div 
                  key={index} 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0, marginTop: 0 }}
                  className="flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={exName}
                    onChange={(e) => handleUpdateDraft(index, e.target.value)}
                    placeholder="e.g. 3x10 Bench Press"
                    className="flex-1 w-0 min-w-0 p-3.5 rounded-xl bg-white border border-[#7C2D12]/20 font-black text-sm outline-none focus:border-[#7C2D12]/50 focus:ring-4 focus:ring-[#7C2D12]/10 text-[#3A2E2A] placeholder-[#7C2D12]/30 transition-all shadow-sm"
                    autoFocus={index === draftExercises.length - 1 && exName === ''}
                  />
                  <button
                    onClick={() => handleRemoveDraft(index)}
                    className="shrink-0 p-3.5 text-red-500/80 hover:text-red-600 bg-red-50/50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <button
              onClick={handleAddDraft}
              className="w-full shrink-0 flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-[#7C2D12]/20 text-[#7C2D12]/60 hover:text-[#7C2D12] hover:bg-[#7C2D12]/5 hover:border-[#7C2D12]/30 transition-all font-black mt-2"
            >
              <Plus size={16} />
              <span className="text-xs uppercase tracking-widest">Add Exercise</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 shrink-0 z-20">
             <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 h-[52px] bg-white border border-black/5 hover:border-black/10 text-[#3A2E2A] rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center transition-all shadow-sm"
             >
                Cancel
             </button>
             <button 
                onClick={handleSavePlan}
                className="flex-1 h-[52px] bg-[#7C2D12] text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:shadow-[#7C2D12]/30 hover:-translate-y-0.5 active:translate-y-0"
             >
                Save Mix
             </button>
          </div>
        </div>
      ) : isRestDay ? (
        <div className="space-y-4">
          <div className="p-4 bg-brand-forest/5 rounded-2xl border border-brand-forest/5">
            <p className="text-sm font-black italic">{t('health.restDay', 'Today is a Rest Day 😴')}</p>
            <p className="text-xs font-bold opacity-60 mt-1">{t('health.restTip', 'Recovery is part of your growth. Perhaps a gentle walk?')}</p>
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
          <div className="space-y-3 relative z-10">
            {todaysExercises.slice(0, 3).map((exId, i) => {
              const ex = EXERCISES[exId];
              return (
                <div key={`${exId}-${i}`} className="flex items-center justify-between p-4 bg-white/60 hover:bg-white backdrop-blur-md border border-[#7C2D12]/5 hover:border-[#7C2D12]/20 rounded-2xl transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#7C2D12]/5 flex items-center justify-center text-[10px] font-black text-[#7C2D12]/40">{i + 1}</div>
                    <p className="text-sm font-black text-[#3A2E2A]">{ex?.name || exId}</p>
                  </div>
                  {ex && (
                    <p className="text-xs font-bold text-[#7C2D12]/50 bg-[#7C2D12]/5 px-3 py-1 rounded-lg">{ex.sets} × {ex.reps}</p>
                  )}
                </div>
              );
            })}
            {todaysExercises.length > 3 && (
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-[#7C2D12]/40 pt-2">
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
              <div className="flex flex-col items-center justify-center py-4 text-green-600 bg-green-50 rounded-2xl relative z-10 border border-green-100">
                <CheckCircle2 size={32} className="mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">Workout Complete!</p>
              </div>
            ) : (
              <button 
                onClick={onStartWorkout}
                className="w-full h-[56px] relative z-10 bg-[#7C2D12] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-[#7C2D12]/20 hover:shadow-[#7C2D12]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {t('health.startWorkout', 'Start Session')} <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
