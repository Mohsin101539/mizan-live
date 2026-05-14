import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, Settings, X, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../../FirebaseContext';
import confetti from 'canvas-confetti';

export const FocusTimer: React.FC = () => {
  const { user } = useFirebase();
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft((isBreak ? breakMinutes : focusMinutes) * 60);
    }
  }, [focusMinutes, breakMinutes, isBreak]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
      handleSessionEnd();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionEnd = async () => {
    if (!isBreak) {
      // Completed Focus Session
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            points: increment(25),
            lastActive: serverTimestamp()
          });
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#1B4332', '#D4A853']
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, 'users');
        }
      }
      setIsBreak(true);
      setTimeLeft(breakMinutes * 60);
    } else {
      // Completed Break
      setIsBreak(false);
      setTimeLeft(focusMinutes * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(focusMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-3xl p-8 bg-[#1B4332] text-white relative overflow-hidden shadow-2xl border-2 border-[#D4A853]/30 min-h-[300px]">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Target size={120} />
      </div>

      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-all z-20"
      >
        {showSettings ? <X size={18} /> : <Settings size={18} />}
      </button>
      
      <div className="relative z-10 text-center space-y-6">
        <AnimatePresence mode="wait">
          {!showSettings ? (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-2">
                {isBreak ? (
                  <Coffee size={16} className="text-[#D4A853]" />
                ) : (
                  <Target size={16} className="text-[#D4A853]" />
                )}
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/80">
                  {isBreak ? 'Short Break' : 'Focus Session'}
                </p>
              </div>

              <div className="flex items-center justify-center">
                 <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)]">
                   {formatTime(timeLeft)}
                 </h2>
              </div>

              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={toggleTimer}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#D4A853] text-[#1B4332] shadow-[#D4A853]/40'
                  }`}
                >
                  {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
                
                <button 
                  onClick={resetTimer}
                  className="w-16 h-16 rounded-full bg-white/10 text-white/60 flex items-center justify-center hover:bg-white/20 active:scale-90"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pt-4 space-y-8"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-[#D4A853]">Timer Settings</h3>
              
              <div className="grid grid-cols-1 gap-6 max-w-[240px] mx-auto">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Focus Minutes</p>
                  <div className="flex items-center justify-between bg-white/5 rounded-2xl p-2 px-4 border border-white/10">
                    <button onClick={() => setFocusMinutes(m => Math.max(1, m - 5))} className="p-2 text-[#D4A853]"><Minus size={16} /></button>
                    <span className="text-2xl font-black">{focusMinutes}</span>
                    <button onClick={() => setFocusMinutes(m => Math.min(120, m + 5))} className="p-2 text-[#D4A853]"><Plus size={16} /></button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Break Minutes</p>
                  <div className="flex items-center justify-between bg-white/5 rounded-2xl p-2 px-4 border border-white/10">
                    <button onClick={() => setBreakMinutes(m => Math.max(1, m - 1))} className="p-2 text-[#D4A853]"><Minus size={16} /></button>
                    <span className="text-2xl font-black">{breakMinutes}</span>
                    <button onClick={() => setBreakMinutes(m => Math.min(30, m + 1))} className="p-2 text-[#D4A853]"><Plus size={16} /></button>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowSettings(false)}
                className="bg-[#D4A853] text-[#1B4332] w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#D4A853]/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                Save & Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
