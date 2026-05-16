import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight, ChevronLeft, RotateCcw, Loader2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../../services/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../../../FirebaseContext';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { ArabicText } from '../../../components/ui/ArabicText';

interface AdhkarItem {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  target: number;
}

const MORNING_ADHKAR: AdhkarItem[] = [
  { id: 'm1', arabic: 'اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ', transliteration: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm", translation: "Allah! There is no god but He, the Living, the Self-subsisting", target: 1 },
  { id: 'm2', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Subhan-Allahi wa bihamdihi', translation: 'Glorified is Allah and praised is He.', target: 100 },
  { id: 'm3', arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ', transliteration: 'Asbahna wa asbahal-mulku lillah...', translation: 'We have reached the morning and at this very time unto Allah belongs all sovereignty...', target: 1 },
  { id: 'm4', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا', transliteration: "Allāhumma bika aṣbaḥnā, wa bika amsaynā", translation: "O Allah, by You we enter the morning and by You we enter the evening", target: 1 },
  { id: 'm5', arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', transliteration: 'Ya Hayyu Ya Qayyumu birahmatika astagheeth', translation: 'O Ever Living One, O Eternal One, by Your mercy I call on You to set right all my affairs...', target: 1 }
];

export const AdhkarSection: React.FC = () => {
  const { t } = useTranslation();
  const [type, setType] = useState<'morning' | 'evening'>('morning');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useFirebase();
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
          const data = snap.data();
          setCounts(data.adhkarCounts?.[type] || {});
        }
      } catch (e) {
        console.error('Error fetching adhkar logs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user, docId, type]);

  const currentItem = MORNING_ADHKAR[currentIndex];
  const currentCount = counts[currentItem.id] || 0;
  const isDone = currentCount >= currentItem.target;

  const handleIncrement = async () => {
    if (isDone) return;
    
    const newCount = currentCount + 1;
    const newCounts = { ...counts, [currentItem.id]: newCount };
    setCounts(newCounts);

    if (user && docId) {
       try {
         const docRef = doc(db, 'daily_logs', docId);
         await setDoc(docRef, {
           userId: user.uid,
           date: today,
           [`adhkarCounts.${type}`]: newCounts,
           lastUpdated: serverTimestamp()
         }, { merge: true });

         if (newCount === currentItem.target && currentIndex === MORNING_ADHKAR.length - 1) {
           await updateDoc(doc(db, 'users', user.uid), {
             points: increment(20),
             lastActive: serverTimestamp()
           });
           confetti({ particleCount: 50, spread: 60, colors: ['#1B4332', '#D4A853'] });
         }
       } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `daily_logs/${docId}`);
       }
    }
  };

  if (loading) return <div className="p-24 flex justify-center"><Loader2 className="animate-spin text-brand-forest" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['morning', 'evening'] as const).map(tName => (
          <button 
            key={tName}
            onClick={() => { setType(tName); setCurrentIndex(0); setCounts({}); }}
            className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${type === tName ? 'bg-brand-forest text-white shadow-lg' : 'bg-brand-forest/5 text-brand-forest/40'}`}
          >
            {t(`deen.adhkar.${tName}`, tName)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-brand-forest/10 p-8 min-h-[450px] flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-forest/5">
          <motion.div 
            className="h-full bg-brand-gold"
            animate={{ width: `${((currentIndex + (isDone ? 1 : 0)) / MORNING_ADHKAR.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center w-full"
          >
            <ArabicText className="text-3xl text-brand-forest mb-4 px-4">
              {t(`deen.adhkar.${currentItem.id}.arabic`, currentItem.arabic)}
            </ArabicText>
            <p className="text-sm font-bold text-brand-gold italic mb-2 tracking-tight">
              {t(`deen.adhkar.${currentItem.id}.transliteration`, currentItem.transliteration)}
            </p>
            <p className="text-[10px] text-brand-forest/40 leading-relaxed max-w-xs italic uppercase font-bold tracking-widest">
              "{t(`deen.adhkar.${currentItem.id}.translation`, currentItem.translation)}"
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 w-full space-y-6">
          <div className="flex items-center justify-center gap-8">
            <button 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(i => i - 1)}
              className="w-12 h-12 rounded-full border border-brand-forest/10 flex items-center justify-center disabled:opacity-20"
            >
              <ChevronLeft size={20} />
            </button>

            <button 
              onClick={handleIncrement}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all active:scale-90 relative ${isDone ? 'bg-green-500 shadow-xl shadow-green-500/20' : 'bg-brand-forest shadow-2xl shadow-brand-forest/30'}`}
            >
              {isDone ? (
                <CheckCircle2 size={40} className="text-white" />
              ) : (
                <>
                  <span className="text-white text-4xl font-black font-mono">{currentCount}</span>
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">/ {currentItem.target}</span>
                </>
              )}
            </button>

            <button 
              disabled={!isDone || currentIndex === MORNING_ADHKAR.length - 1}
              onClick={() => setCurrentIndex(i => i + 1)}
              className="w-12 h-12 rounded-full border border-brand-forest/10 flex items-center justify-center disabled:opacity-20"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button 
             onClick={() => setCounts({ ...counts, [currentItem.id]: 0 })}
             className="text-[10px] font-black uppercase tracking-widest text-brand-forest/20 flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={12} /> {t('deen.adhkar.reset', 'Reset dhikr')}
          </button>
        </div>
      </div>
    </div>
  );
};
