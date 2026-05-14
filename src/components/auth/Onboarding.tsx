import React, { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../../FirebaseContext';
import { motion } from 'motion/react';
import { User, Target, Activity, MapPin } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { user } = useFirebase();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: '',
    age: '',
    currentWeight: '',
    careerGoal: '',
    calculationMethod: 'ISNA',
    country: '',
    fitnessLevel: 'Beginner'
  });

  const finish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        onboardingComplete: true,
        points: 50, // Initial bonus
        level: 1,
        streak: 0,
        lastActive: serverTimestamp()
      });
      window.location.reload(); // Refresh to clear state
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Welcome to Mizan",
      desc: "Let's personalize your balance journey. What should we call you?",
      icon: <User className="text-brand-forest" />,
      fields: (
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Your Full Name"
            value={data.name}
            onChange={e => setData({...data, name: e.target.value})}
            className="w-full bg-white p-4 rounded-2xl border-2 border-brand-forest/10 focus:border-brand-forest transition-all"
          />
          <input 
            type="number" 
            placeholder="Age"
            value={data.age}
            onChange={e => setData({...data, age: e.target.value})}
            className="w-full bg-white p-4 rounded-2xl border-2 border-brand-forest/10 focus:border-brand-forest transition-all"
          />
        </div>
      )
    },
    {
      title: "Health Baseline",
      desc: "To track your physical pillar accurately.",
      icon: <Activity className="text-[#7C2D12]" />,
      fields: (
        <div className="space-y-4">
          <input 
            type="number" 
            placeholder="Current Weight (kg)"
            value={data.currentWeight}
            onChange={e => setData({...data, currentWeight: e.target.value})}
            className="w-full bg-white p-4 rounded-2xl border-2 border-[#7C2D12]/10 focus:border-[#7C2D12] transition-all"
          />
          <select 
            value={data.fitnessLevel}
            onChange={e => setData({...data, fitnessLevel: e.target.value})}
            className="w-full bg-white p-4 rounded-2xl border-2 border-[#7C2D12]/10 focus:border-[#7C2D12] transition-all"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
      )
    },
    {
      title: "Career & Faith",
      desc: "Setting the spiritual and professional foundation.",
      icon: <Target className="text-brand-navy" />,
      fields: (
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Main Career Goal (e.g. Software Engineer)"
            value={data.careerGoal}
            onChange={e => setData({...data, careerGoal: e.target.value})}
            className="w-full bg-white p-4 rounded-2xl border-2 border-brand-navy/10 focus:border-brand-navy transition-all"
          />
          <input 
            type="text" 
            placeholder="Your Country (for Prayer Times)"
            value={data.country}
            onChange={e => setData({...data, country: e.target.value})}
            className="w-full bg-white p-4 rounded-2xl border-2 border-brand-navy/10 focus:border-brand-navy transition-all"
          />
        </div>
      )
    }
  ];

  const current = steps[step - 1];

  return (
    <div className="fixed inset-0 bg-[#F4F1EB] z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white rounded-[40px] p-10 shadow-2xl space-y-8"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-brand-forest/5 flex items-center justify-center">
            {current.icon}
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-brand-forest italic">{current.title}</h2>
          <p className="text-brand-forest/40 font-medium px-4">{current.desc}</p>
        </div>

        <div className="py-2">
          {current.fields}
        </div>

        <div className="flex gap-3">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 rounded-2xl border-2 border-brand-forest/10 font-black text-brand-forest text-xs uppercase tracking-widest"
            >
              Back
            </button>
          )}
          <button 
            onClick={() => step === steps.length ? finish() : setStep(step + 1)}
            disabled={loading}
            className="flex-[2] py-4 rounded-2xl bg-brand-forest text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-forest/20 flex items-center justify-center gap-2"
          >
            {loading ? "Initializing..." : (step === steps.length ? "Begin My Journey" : "Next Step")}
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pt-4">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all ${i + 1 === step ? 'w-8 bg-brand-forest' : 'w-2 bg-brand-forest/10'}`} 
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
