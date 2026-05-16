import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../../../services/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { useFirebase } from '../../../FirebaseContext';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';

interface SunnahAct {
  id: string;
  title: string;
  description: string;
  points: number;
}

const SUNNAH_ACTS: SunnahAct[] = [
  { id: 's1', title: 'Miswak / Brushing Teeth', description: 'Sunnah of purification before prayer', points: 10 },
  { id: 's2', title: 'Daily Sadaqah', description: 'Give even a small amount for the sake of Allah', points: 10 },
  { id: 's3', title: 'Reading 3 Quls', description: 'Before sleeping for protection', points: 10 },
  { id: 's4', title: 'Using Right Hand', description: 'For eating and drinking', points: 5 },
  { id: 's5', title: 'Wudu before Sleep', description: 'Purify yourself before rest', points: 10 },
  { id: 's6', title: 'Salawat on Prophet (ﷺ)', description: 'Send blessings upon the Messenger', points: 5 }
];

export const SunnahTracker: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useFirebase();
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];
  const docId = user ? `${user.uid}_${today}` : '';

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user || !docId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'daily_logs', docId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setCompleted(snap.data().sunnahActsCompleted || []);
        }
      } catch (e) {
        console.error('Error fetching sunnah logs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user, docId]);

  const toggleAct = async (act: SunnahAct) => {
    if (completed.includes(act.id)) return;

    setCompleted(prev => [...prev, act.id]);
    
    if (user && docId) {
      try {
        const docRef = doc(db, 'daily_logs', docId);
        await setDoc(docRef, {
          userId: user.uid,
          date: today,
          sunnahActsCompleted: arrayUnion(act.id),
          lastUpdated: serverTimestamp()
        }, { merge: true });

        await updateDoc(doc(db, 'users', user.uid), {
          points: increment(act.points),
          lastActive: serverTimestamp()
        });
        confetti({ 
            particleCount: 30, 
            spread: 40, 
            origin: { y: 0.8 },
            colors: ['#D4A853', '#1B4332'] 
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `daily_logs/${docId}`);
        setCompleted(prev => prev.filter(id => id !== act.id));
      }
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-gold" /></div>;

  return (
    <div className="space-y-4">
      {SUNNAH_ACTS.map((act) => {
        const isDone = completed.includes(act.id);
        
        return (
          <motion.div
            key={act.id}
            whileHeader={{ scale: 1.01 }}
            onClick={() => toggleAct(act)}
            className={`glass-card p-5 cursor-pointer flex items-center justify-between transition-all rounded-2xl border ${isDone ? 'bg-brand-forest/5 border-brand-forest/10 opacity-60' : 'bg-white border-brand-forest/10 hover:border-brand-gold'}`}
          >
            <div className="flex-1">
              <h3 className={`font-black text-lg ${isDone ? 'text-brand-forest/40 line-through' : 'text-brand-forest'}`}>
                {t(`deen.sunnah.${act.id}.title`, act.title)}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-forest/40 mt-1">
                {t(`deen.sunnah.${act.id}.description`, act.description)}
              </p>
            </div>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDone ? 'bg-green-500 text-white' : 'bg-brand-forest/5 text-brand-forest/20'}`}>
              {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
