import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Exercise, ActiveSet, WorkoutPlanId, WorkoutSession } from '../../types';
import { X } from 'lucide-react';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface WorkoutSessionPlayerProps {
  userId: string;
  planId: WorkoutPlanId;
  workoutName: string;
  exercises: Exercise[];
  onClose: () => void;
  onSessionComplete: (session: WorkoutSession) => void;
}

type SessionPhase = 'exercise' | 'rest' | 'complete';

export const WorkoutSessionPlayer: React.FC<WorkoutSessionPlayerProps> = ({
  userId,
  planId,
  workoutName,
  exercises,
  onClose,
  onSessionComplete
}) => {
  const [phase, setPhase] = useState<SessionPhase>('exercise');
  const [exIndex, setExIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<ActiveSet[]>([]);
  
  const currentEx = exercises[exIndex];
  
  const [currentReps, setCurrentReps] = useState(currentEx?.reps || 10);
  const [timeLeft, setTimeLeft] = useState(currentEx?.durationSeconds || 30);
  const [timerRunning, setTimerRunning] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);

  const [adjustedDuration, setAdjustedDuration] = useState(0);

  // Restart settings when exercise changes
  useEffect(() => {
    if (phase === 'exercise' && currentEx) {
      setCurrentReps(currentEx.reps || 10);
      setTimeLeft(currentEx.durationSeconds || 30);
      setTimerRunning(true);
    }
  }, [exIndex, phase, currentEx]);

  // Elapsed timer
  useEffect(() => {
    elapsedRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  // Exercise & Rest countdown timer
  useEffect(() => {
    if ((phase === 'exercise' && currentEx?.type === 'duration') || phase === 'rest') {
      if (timerRunning && timeLeft > 0) {
        intervalRef.current = setInterval(() => {
          setTimeLeft(t => {
            if (t <= 1) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              handleTimerComplete();
              return 0;
            }
            return t - 1;
          });
        }, 1000);
      } else if (!timerRunning) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timeLeft, phase, currentEx]);

  const handleTimerComplete = () => {
    if (phase === 'exercise') {
      handleDoneSet();
    } else if (phase === 'rest') {
      handleSkipRest();
    }
  };

  const handleDoneSet = () => {
    const newSet: ActiveSet = {
      exerciseId: currentEx.id,
      setNumber: setIndex + 1,
      completedReps: currentEx.type === 'reps' ? currentReps : undefined,
      completedDurationSeconds: currentEx.type === 'duration' ? currentEx.durationSeconds : undefined,
      completedAt: new Date()
    };
    setCompletedSets(prev => [...prev, newSet]);

    if (setIndex + 1 >= currentEx.sets) {
      if (exIndex + 1 >= exercises.length) {
        goToComplete();
      } else {
        startRest();
      }
    } else {
      startRest();
    }
  };

  const startRest = () => {
    if (currentEx.restSeconds > 0) {
      setPhase('rest');
      setTimeLeft(currentEx.restSeconds);
      setTimerRunning(true);
    } else {
      handleSkipRest();
    }
  };

  const handleSkipRest = () => {
    if (setIndex + 1 >= currentEx.sets) {
      setSetIndex(0);
      setExIndex(i => i + 1);
    } else {
      setSetIndex(i => i + 1);
    }
    setPhase('exercise');
  };

  const goToComplete = () => {
    setPhase('complete');
    setAdjustedDuration(Math.max(1, Math.round(elapsedSeconds / 60)));
  };

  const skipExercise = () => {
    if (exIndex + 1 >= exercises.length) {
      goToComplete();
    } else {
      setExIndex(i => i + 1);
      setSetIndex(0);
      setPhase('exercise');
    }
  };

  const prevExercise = () => {
    if (exIndex > 0) {
      setExIndex(i => i - 1);
      setSetIndex(0);
      setPhase('exercise');
    }
  };

  const handleSaveLog = async () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const session: WorkoutSession = {
      planId,
      workoutName,
      startedAt: new Date(Date.now() - elapsedSeconds * 1000),
      completedAt: new Date(),
      totalDurationMinutes: adjustedDuration,
      exercisesCompleted: exercises.length, // assuming all for simplicity, could refine
      totalExercises: exercises.length,
      pointsEarned: 50,
      isComplete: true,
      completedSets
    };

    try {
      await setDoc(doc(db, 'health_daily', `${userId}_${dateStr}`), {
        userId,
        date: dateStr,
        workoutDone: true,
        workoutSession: session,
        pointsFromHealth: increment(50)
      }, { merge: true });

      await updateDoc(doc(db, 'users', userId), {
        points: increment(50)
      });
      
      onSessionComplete(session);
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const progress = totalSets === 0 ? 0 : completedSets.length / totalSets;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="fixed inset-0 z-50 bg-[#1A1A1A] text-white flex flex-col font-health"
    >
      {/* Progress Bar & Header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#333333] z-50">
        <motion.div 
          animate={{ width: `${progress * 100}%` }} 
          transition={{ duration: 0.4 }}
          className="h-full bg-[#D4A853]"
        />
      </div>

      {phase !== 'complete' && (
         <div className="flex items-center justify-between p-4 pt-6 shrink-0">
           <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
             <X size={20} />
           </button>
           <div className="flex items-center gap-4 text-gray-400 text-sm font-jetbrains">
             <span className="truncate max-w-[150px]">{currentEx?.name} ({setIndex + 1}/{currentEx?.sets})</span>
             <span>⏱ {formatTime(elapsedSeconds)}</span>
           </div>
         </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {phase === 'exercise' && currentEx && (
            <motion.div
              key={`ex-${currentEx.id}-${setIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm flex flex-col items-center"
            >
              <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl mb-6 text-center">
                <h2 className="font-playfair text-3xl mb-1">{currentEx.name.toUpperCase()}</h2>
                <div className="inline-block bg-white/10 text-white/70 px-3 py-1 rounded-lg text-xs tracking-widest uppercase">
                  {currentEx.category} · {currentEx.type}
                </div>
              </div>
              <p className="text-gray-400 text-center text-[13px] mb-8 min-h-[40px] px-4">"{currentEx.tip}"</p>
              
              <div className="w-full border-t border-white/10 mb-8" />
              
              <p className="text-[#D4A853] font-semibold text-sm tracking-widest uppercase mb-8">
                Set {setIndex + 1} of {currentEx.sets}
              </p>

              {currentEx.type === 'reps' ? (
                <div className="flex items-center justify-center gap-6 mb-12">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentReps(r => Math.max(1, r - 1))}
                    className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl hover:bg-white/20"
                  >
                    −
                  </motion.button>
                  <div className="flex flex-col items-center w-24">
                    <motion.div key={currentReps} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="font-jetbrains text-5xl">
                      {currentReps}
                    </motion.div>
                    <span className="text-gray-400 text-sm mt-1">reps</span>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentReps(r => r + 1)}
                    className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl hover:bg-white/20"
                  >
                    +
                  </motion.button>
                </div>
              ) : (
                <div className="flex flex-col items-center mb-12 relative w-64 h-64 justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-[0_0_8px_#D4A853]">
                     <circle cx="128" cy="128" r="100" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                     <motion.circle 
                       cx="128" cy="128" r="100" 
                       stroke="#D4A853" 
                       strokeWidth="6" 
                       fill="none" 
                       strokeDasharray={2 * Math.PI * 100}
                       strokeDashoffset={2 * Math.PI * 100 * (1 - (timeLeft / (currentEx.durationSeconds || 1)))}
                       transition={{ duration: 1, ease: 'linear' }}
                       strokeLinecap="round"
                     />
                  </svg>
                  <motion.div key={timeLeft} initial={{ scale: 1.05 }} animate={{ scale: 1 }} className="font-jetbrains text-6xl relative z-10">
                    {formatTime(timeLeft)}
                  </motion.div>

                  <div className="flex items-center gap-4 mt-8 relative z-10">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTimeLeft(t => Math.max(1, t - 10))} className="px-4 py-2 bg-white/10 rounded-full font-bold text-sm">
                      − 10s
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTimerRunning(!timerRunning)} className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                      {timerRunning ? '⏸' : '▶'}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTimeLeft(t => t + 30)} className="px-4 py-2 bg-white/10 rounded-full font-bold text-sm">
                      + 30s
                    </motion.button>
                  </div>
                </div>
              )}

              <div className="w-full border-t border-white/10 mb-8" />
              
              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={handleDoneSet}
                className="w-full h-[52px] bg-[#22C55E] text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-[#22C55E]/20 mb-8"
              >
                ✓ DONE THIS SET
              </motion.button>

              <div className="flex items-center justify-between w-full">
                <button onClick={prevExercise} className="text-sm font-bold text-gray-500 hover:text-white px-4 py-2">
                  ← PREV
                </button>
                <button onClick={skipExercise} className="text-sm font-bold text-gray-500 hover:text-white px-4 py-2">
                  SKIP →
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'rest' && (
            <motion.div
              key="rest"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-sm flex flex-col items-center justify-center h-full"
            >
              <h2 className="font-playfair text-2xl text-center mb-8">REST TIME</h2>
              <div className="font-jetbrains text-7xl text-gray-400 mb-8">
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-gray-300 mb-12">
                Next: {currentEx?.name} — {currentEx?.sets} × {currentEx?.type === 'reps' ? currentEx?.reps : formatTime(currentEx?.durationSeconds || 0)}
              </p>
              
              <div className="w-full border-t border-white/10 mb-8" />

              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={handleSkipRest}
                className="w-full h-[52px] bg-transparent border border-[#7C2D12] text-[#7C2D12] rounded-xl font-black uppercase tracking-widest hover:bg-[#7C2D12]/10"
              >
                SKIP REST →
              </motion.button>
            </motion.div>
          )}

          {phase === 'complete' && (
             <WorkoutCompleteView 
               adjustedDuration={adjustedDuration}
               setAdjustedDuration={setAdjustedDuration}
               exercisesCompleted={exercises.length}
               completedSetsCount={completedSets.length}
               onSave={handleSaveLog}
             />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const WorkoutCompleteView = ({ adjustedDuration, setAdjustedDuration, exercisesCompleted, completedSetsCount, onSave }: any) => {
  useEffect(() => {
    // Basic Confetti effect Simulation
    const particles = Array.from({ length: 30 }).map((_, i) => {
      const el = document.createElement('div');
      el.className = 'fixed w-3 h-3 rounded-sm pointer-events-none z-50';
      const colors = ['#D4A853', '#22C55E', '#7C2D12', '#1B4332', '#F4F1EB'];
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.left = `${Math.random() * 100}vw`;
      el.style.top = `-20px`;
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(el);
      
      const duration = 1500 + Math.random() * 1500;
      el.animate([
        { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(${window.innerHeight}px) rotate(${720 + Math.random() * 360}deg)`, opacity: 0 }
      ], { duration, easing: 'cubic-bezier(.37,0,.63,1)' }).onfinish = () => el.remove();
      
      return el;
    });
    return () => particles.forEach(p => p.remove());
  }, []);

  return (
    <motion.div
      key="complete"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm flex flex-col items-center"
    >
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="font-playfair text-4xl mb-8 text-center">WORKOUT COMPLETE!</h2>
      
      <div className="w-full border-t border-white/10 mb-6" />
      
      <div className="w-full space-y-4 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Exercises</span>
          <span className="font-bold">{exercisesCompleted} completed</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Sets</span>
          <span className="font-bold">{completedSetsCount} completed</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Points</span>
          <span className="font-bold text-[#D4A853]">+50 pts</span>
        </div>
      </div>

      <div className="w-full mb-8">
        <p className="text-gray-400 text-center mb-2 text-sm">Total Time:</p>
        <div className="flex items-center justify-center gap-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setAdjustedDuration((d:any) => Math.max(1, d - 1))} className="w-12 h-12 bg-white/10 rounded-xl font-bold flex items-center justify-center text-xl">
            −
          </motion.button>
          <div className="w-24 text-center text-white font-jetbrains text-2xl">
            {adjustedDuration} <span className="text-sm">mins</span>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setAdjustedDuration((d:any) => d + 1)} className="w-12 h-12 bg-white/10 rounded-xl font-bold flex items-center justify-center text-xl">
            +
          </motion.button>
        </div>
      </div>
      
      <div className="w-full border-t border-white/10 mb-8" />
      
      <motion.button 
        whileTap={{ scale: 0.97 }}
        onClick={onSave}
        className="w-full h-[56px] bg-[#22C55E] text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-[#22C55E]/20"
      >
        💾 SAVE LOG (+50 pts)
      </motion.button>
    </motion.div>
  );
};
