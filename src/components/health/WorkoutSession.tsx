import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowRight, Play, SkipForward, Dumbbell } from 'lucide-react';
import { EXERCISES, Exercise } from '../../constants/health';
import confetti from 'canvas-confetti';

interface WorkoutSessionProps {
  exerciseIds: string[];
  workoutName: string;
  onComplete: (exercisesCount: number, duration: number) => void;
  onClose: () => void;
}

type SessionState = 'exercise' | 'rest' | 'complete';

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({ 
  exerciseIds, 
  workoutName, 
  onComplete, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [sessionState, setSessionState] = useState<SessionState>('exercise');
  const [restTimer, setRestTimer] = useState(60);
  const [startTime] = useState(Date.now());
  const [reps, setReps] = useState(12);

  const currentExercise = EXERCISES[exerciseIds[currentIndex]];

  useEffect(() => {
    if (currentExercise) {
      setReps(parseInt(currentExercise.reps) || 12);
    }
  }, [currentIndex]);

  useEffect(() => {
    let interval: any;
    if (sessionState === 'rest' && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => prev - 1);
      }, 1000);
    } else if (sessionState === 'rest' && restTimer === 0) {
      nextStep();
    }
    return () => clearInterval(interval);
  }, [sessionState, restTimer]);

  const nextStep = () => {
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      setSessionState('exercise');
    } else {
      if (currentIndex < exerciseIds.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentSet(1);
        setSessionState('exercise');
      } else {
        setSessionState('complete');
        triggerConfetti();
      }
    }
  };

  const handleDoneSet = () => {
    setRestTimer(60);
    setSessionState('rest');
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22C55E', '#7C2D12', '#F4F1EB']
    });
  };

  const handleFinish = () => {
    const duration = Math.round((Date.now() - startTime) / 60000);
    onComplete(exerciseIds.length, duration);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 text-white flex flex-col font-health">
      <header className="p-6 flex justify-between items-center bg-zinc-900/50">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
          {sessionState === 'complete' ? 'Workout Finished' : `Exercise ${currentIndex + 1} of ${exerciseIds.length}`}
        </span>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AnimatePresence mode="wait">
          {sessionState === 'exercise' && (
            <motion.div 
              key="exercise"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase tracking-tighter">{currentExercise.name}</h2>
                <div className="w-32 h-32 bg-white/5 rounded-full mx-auto flex items-center justify-center border border-white/10">
                  <Dumbbell size={48} className="text-brand-gold" />
                </div>
                <p className="text-xl font-bold opacity-60">{currentExercise.sets} sets × {currentExercise.reps} reps</p>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <p className="text-xs font-bold italic opacity-40">Tip: {currentExercise.tip}</p>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <span className="text-sm font-black uppercase tracking-widest opacity-40">Set {currentSet} of {currentExercise.sets}</span>
                  <div className="flex items-center gap-8">
                    <button onClick={() => setReps(Math.max(1, reps - 1))} className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black hover:bg-white/20 transition-all">-</button>
                    <span className="text-6xl font-black tabular-nums">{reps}</span>
                    <button onClick={() => setReps(reps + 1)} className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black hover:bg-white/20 transition-all">+</button>
                  </div>
                </div>

                <button 
                  onClick={handleDoneSet}
                  className="w-full h-20 bg-green-500 text-zinc-950 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-green-500/20"
                >
                  <Check size={24} /> Done This Set
                </button>
              </div>
            </motion.div>
          )}

          {sessionState === 'rest' && (
            <motion.div 
              key="rest"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-sm space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-widest opacity-40">Rest Time</h2>
                <div className="text-9xl font-black text-brand-gold tabular-nums transition-all">
                  {restTimer}
                </div>
                <p className="text-lg font-bold">Great set! Keep going.</p>
              </div>

              <button 
                onClick={() => nextStep()}
                className="w-full h-16 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
              >
                Skip Rest <SkipForward size={20} />
              </button>
            </motion.div>
          )}

          {sessionState === 'complete' && (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm space-y-12"
            >
              <div className="space-y-4">
                <div className="text-7xl">🎉</div>
                <h2 className="text-5xl font-black uppercase tracking-tighter">Done!</h2>
                <div className="space-y-1">
                  <p className="text-xl font-bold">{workoutName}</p>
                  <p className="opacity-40 text-sm font-bold uppercase tracking-widest">{exerciseIds.length} exercises completed</p>
                </div>
              </div>

              <div className="bg-brand-gold text-zinc-950 p-6 rounded-3xl">
                <p className="text-4xl font-black leading-none">+50</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-1">Points Earned</p>
              </div>

              <button 
                onClick={handleFinish}
                className="w-full h-20 bg-white text-zinc-950 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                Save & Finish
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
