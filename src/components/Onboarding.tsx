import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../FirebaseContext';
import { ArrowRight, Check, MapPin, Target, Activity, Settings, Loader2 } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { user, profile } = useFirebase();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    country: '',
    calculationMethod: 'MuslimWorldLeague',
    careerGoal: '',
    fitnessLevel: 'Beginner'
  });

  const [isCompleting, setIsCompleting] = useState(false);

  const next = () => setStep(s => s + 1);

  const complete = async () => {
    if (!user || isCompleting) return;
    setIsCompleting(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        onboardingComplete: true,
        lastActive: serverTimestamp()
      });
      window.location.reload(); // Quick refresh to update context
    } catch (error) {
      setIsCompleting(false);
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream p-8 flex flex-col justify-center max-w-md mx-auto">
      <div className="mb-12">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(s => (
            <div 
              key={s} 
              className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-brand-gold' : 'bg-brand-forest/10'}`} 
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="s1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="w-16 h-16 bg-brand-forest/10 rounded-2xl flex items-center justify-center text-brand-forest">
              <MapPin size={32} />
            </div>
            <h1 className="text-3xl font-display font-black text-brand-forest">Where are you based?</h1>
            <p className="text-brand-forest/60">We use this to calculate accurate prayer times for your location.</p>
            <input 
              className="w-full bg-white border border-brand-forest/10 p-4 rounded-xl text-lg font-medium outline-none focus:border-brand-gold"
              placeholder="e.g. London, UK"
              value={data.country}
              onChange={e => setData({ ...data, country: e.target.value })}
            />
            <button onClick={next} disabled={!data.country} className="w-full bg-brand-forest text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              Next <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" className="space-y-6">
            <div className="w-16 h-16 bg-brand-forest/10 rounded-2xl flex items-center justify-center text-brand-forest">
              <Settings size={32} />
            </div>
            <h1 className="text-3xl font-display font-black text-brand-forest">Prayer Calculation</h1>
            <p className="text-brand-forest/60">Choose the method most commonly used in your region.</p>
            <div className="space-y-3">
              {['MuslimWorldLeague', 'Egyptian', 'Karachi', 'UmmAlQura'].map(m => (
                <button 
                  key={m}
                  onClick={() => setData({ ...data, calculationMethod: m })}
                  className={`w-full p-4 rounded-xl text-left font-bold transition-all ${data.calculationMethod === m ? 'bg-brand-gold text-brand-forest' : 'bg-white border border-brand-forest/10 text-brand-forest/40'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button onClick={next} className="w-full bg-brand-forest text-white py-4 rounded-xl font-bold">Next</button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" className="space-y-6">
            <div className="w-16 h-16 bg-brand-forest/10 rounded-2xl flex items-center justify-center text-brand-forest">
              <Target size={32} />
            </div>
            <h1 className="text-3xl font-display font-black text-brand-forest">Career Vision</h1>
            <p className="text-brand-forest/60">What is your primary professional focus right now?</p>
            <input 
              className="w-full bg-white border border-brand-forest/10 p-4 rounded-xl text-lg font-medium outline-none focus:border-brand-gold"
              placeholder="e.g. Become a Senior Developer"
              value={data.careerGoal}
              onChange={e => setData({ ...data, careerGoal: e.target.value })}
            />
            <button onClick={next} disabled={!data.careerGoal} className="w-full bg-brand-forest text-white py-4 rounded-xl font-bold">Next</button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" className="space-y-6">
            <div className="w-16 h-16 bg-brand-forest/10 rounded-2xl flex items-center justify-center text-brand-forest">
              <Activity size={32} />
            </div>
            <h1 className="text-3xl font-display font-black text-brand-forest">Fitness Baseline</h1>
            <p className="text-brand-forest/60">Your current level of physical activity.</p>
            <div className="grid grid-cols-1 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                <button 
                  key={l}
                  onClick={() => setData({ ...data, fitnessLevel: l })}
                  className={`w-full p-4 rounded-xl text-left font-bold transition-all ${data.fitnessLevel === l ? 'bg-brand-gold text-brand-forest' : 'bg-white border border-brand-forest/10 text-brand-forest/40'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button onClick={next} className="w-full bg-brand-forest text-white py-4 rounded-xl font-bold">Next</button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="s5" className="space-y-8 text-center py-12">
            <div className="w-24 h-24 bg-brand-gold rounded-full flex items-center justify-center text-brand-forest mx-auto">
              <Check size={48} strokeWidth={3} />
            </div>
            <h1 className="text-4xl font-display font-black text-brand-forest">Bismillah.</h1>
            <p className="text-brand-forest/60">Your Mizan is ready. May Allah bring barakah into your routine.</p>
            <button 
              onClick={complete} 
              disabled={isCompleting}
              className="w-full bg-brand-forest text-white py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {isCompleting ? <Loader2 className="animate-spin" size={20} /> : "Enter Mizan"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
