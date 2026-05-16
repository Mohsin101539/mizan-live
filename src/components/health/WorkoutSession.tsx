import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, Dumbbell, SkipForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';

interface WorkoutSessionProps {
  exercises: string[];
  onComplete: (durationMinutes: number, name: string) => void;
  onClose: () => void;
}

const SECONDS_PER_EXERCISE = 60;

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({ 
  exercises, 
  onComplete, 
  onClose 
}) => {
  const { t } = useTranslation();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_EXERCISE);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const currentExercise = exercises[currentExerciseIndex] || 'Rest';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleNext();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setTimeLeft(SECONDS_PER_EXERCISE);
    } else {
      setIsRunning(false);
      handleFinish();
    }
  };

  const [finalDuration, setFinalDuration] = useState(exercises.length);

  const handleFinish = () => {
    setIsRunning(false);
    setIsFinished(true);
    setFinalDuration(exercises.length);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22C55E', '#7C2D12', '#F4F1EB']
    });
  };

  const handleSaveComplete = () => {
    onComplete(finalDuration, 'Daily Workout');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 text-white flex flex-col font-health">
      <header className="p-6 flex justify-between items-center bg-zinc-900/50">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
          {t('health.dailyWorkout', 'Daily Workout')}
        </span>
        <div className="w-10 text-[10px] font-black text-brand-gold">
          {currentExerciseIndex + 1}/{exercises.length}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center w-full max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full space-y-12"
            >
              <div className="space-y-4">
                <div className="w-24 h-24 bg-brand-gold/10 text-brand-gold rounded-full mx-auto flex items-center justify-center border border-brand-gold/20 mb-6 shadow-inner shadow-brand-gold/5">
                  <Dumbbell size={40} />
                </div>
                
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                  {currentExercise}
                </h2>
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest pb-4">
                  Exercise {currentExerciseIndex + 1} of {exercises.length}
                </p>
              </div>

              <div className="space-y-8 pb-4">
                <div className="relative w-64 h-64 mx-auto flex flex-col items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle 
                      cx="128" 
                      cy="128" 
                      r="120" 
                      className="stroke-white/10" 
                      strokeWidth="6" 
                      fill="none" 
                    />
                    <motion.circle 
                      cx="128" 
                      cy="128" 
                      r="120" 
                      className="stroke-brand-gold" 
                      strokeWidth="6" 
                      fill="none" 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: 2 * Math.PI * 120, strokeDashoffset: 0 }}
                      animate={{ 
                        strokeDashoffset: 2 * Math.PI * 120 * (1 - (timeLeft / SECONDS_PER_EXERCISE)) 
                      }}
                      style={{
                        strokeDasharray: 2 * Math.PI * 120,
                        filter: 'drop-shadow(0 0 12px rgba(234,179,8,0.3))'
                      }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </svg>
                  
                  <div className="flex flex-col items-center justify-center relative z-10 w-full -mt-2">
                    <span className="text-6xl font-black tabular-nums tracking-tighter" style={{ fontFamily: 'JetBrains Mono, SFMono-Regular, monospace' }}>
                      {formatTime(timeLeft)}
                    </span>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <button 
                        onClick={() => setTimeLeft(prev => Math.max(0, prev - 10))}
                        className="w-12 h-10 border border-white/20 text-white/50 rounded-full flex items-center justify-center text-xs font-bold hover:bg-white/10 hover:text-white transition-colors active:scale-95"
                      >
                        -10s
                      </button>
                      <button 
                        onClick={() => setTimeLeft(prev => prev + 30)}
                        className="w-12 h-10 border border-white/20 text-white/50 rounded-full flex items-center justify-center text-xs font-bold hover:bg-white/10 hover:text-white transition-colors active:scale-95"
                      >
                        +30s
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 pt-4">
                  <button 
                    onClick={handleFinish}
                    className="w-14 h-14 bg-red-500/10 text-red-500/80 rounded-full flex items-center justify-center transition-all hover:bg-red-500/20 hover:text-red-400 active:scale-95"
                    title="End Workout Manually"
                  >
                    <X size={24} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={toggleTimer}
                    className="w-24 h-24 bg-brand-gold text-zinc-950 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(234,179,8,0.3)]"
                  >
                    <motion.div animate={{ scale: isRunning ? 0.9 : 1 }} transition={{ type: 'spring' }}>
                      {isRunning ? <Pause className="fill-current" size={36} /> : <Play className="fill-current ml-2" size={36} />}
                    </motion.div>
                  </button>
                  <button 
                    onClick={handleNext}
                    className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center transition-all hover:bg-white/20 active:scale-95"
                    title="Skip to Next"
                  >
                    <SkipForward size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-12 max-w-sm mx-auto"
            >
              <div className="space-y-4">
                <div className="text-7xl">🎉</div>
                <h2 className="text-5xl font-black uppercase tracking-tighter">{t('career.focusTimer.done', 'Done!')}</h2>
                <div className="space-y-1">
                  <p className="text-xl font-bold">Daily Workout Complete</p>
                  <p className="opacity-40 text-sm font-bold uppercase tracking-widest">{exercises.length} Exercises Crushed</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Time (Minutes)</label>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => setFinalDuration(prev => Math.max(1, prev - 1))}
                    className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-bold text-xl hover:bg-white/10"
                  >
                    -
                  </button>
                  <span className="text-5xl font-black text-brand-gold w-24 text-center">{finalDuration}</span>
                  <button 
                    onClick={() => setFinalDuration(prev => prev + 1)}
                    className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-bold text-xl hover:bg-white/10"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSaveComplete}
                  className="w-full h-16 bg-brand-gold text-zinc-950 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-brand-gold/20"
                >
                  Save Log (+{finalDuration * 2} pts)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
