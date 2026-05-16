import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../../services/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../../../FirebaseContext';
import { getPrayerTimes, formatPrayerTime } from '../../../services/prayerService';
import confetti from 'canvas-confetti';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PrayerSummary: React.FC = () => {
  const { user, profile } = useFirebase();
  const { t } = useTranslation();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [donePrayers, setDonePrayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'salat_logs'),
      where('userId', '==', user.uid),
      where('date', '==', today)
    );
    const snap = await getDocs(q);
    setDonePrayers(snap.docs.map(d => d.data().prayerName));
  };

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  useEffect(() => {
    if (profile?.location?.latitude && profile?.location?.longitude) {
      setPrayers(getPrayerTimes(profile.location.latitude, profile.location.longitude));
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPrayers(getPrayerTimes(latitude, longitude));
        setLoading(true); // Wait for logs? No, loading is for prayer times
        setLoading(false);
      },
      () => {
        setPrayers(getPrayerTimes(51.5074, -0.1278));
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, [profile?.location]);

  const celebrate = async (prayerName: string) => {
    if (!user || donePrayers.includes(prayerName)) return;
    try {
      setDonePrayers(prev => [...prev, prayerName]);
      await addDoc(collection(db, 'salat_logs'), {
        userId: user.uid,
        prayerName,
        date: new Date().toISOString().split('T')[0],
        points: 30,
        timestamp: serverTimestamp()
      });
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'salat_logs');
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-brand-gold" /></div>;

  const now = new Date();
  const nextPrayer = prayers.find(p => p.time > now);
  const currentPrayer = nextPrayer ? prayers[prayers.indexOf(nextPrayer) - 1] : prayers[prayers.length - 1];

  return (
    <div className="space-y-4">
      {prayers.map((prayer) => {
        const isDone = donePrayers.includes(prayer.name);
        const isCurrent = currentPrayer?.name === prayer.name;
        
        if (!isCurrent && !isDone && prayer.time < now && prayer.name !== 'Isha') return null; // Hide missed unless they are Isha or current

        return (
          <div 
            key={prayer.name}
            className={`flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-brand-forest/10 gap-3 ${
              isCurrent && !isDone ? 'border-2 border-brand-gold bg-brand-gold/5 shadow-xl' : 'bg-brand-forest/5'
            }`}
          >
            <div className="flex items-center gap-4 w-full sm:w-1/3">
              <div className={`w-3 h-3 rounded-full ${isDone ? 'bg-green-500' : isCurrent ? 'bg-brand-gold animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="font-black text-brand-forest">{t(`salat.${prayer.name}`, prayer.name)}</span>
            </div>
            
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <span className="text-sm font-mono font-black text-brand-forest">{formatPrayerTime(prayer.time)}</span>
              {isDone ? (
                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-lg">{t('salat.status.done', 'Done ✓')}</span>
              ) : isCurrent ? (
                <button 
                  onClick={() => celebrate(prayer.name)}
                  className="bg-brand-forest text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  {t('salat.status.iPrayed', 'I Prayed ✓')}
                </button>
              ) : (
                <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{t('salat.status.upcoming', 'Upcoming')}</span>
              )}
            </div>
            {isCurrent && !isDone && <div className="hidden sm:block text-[10px] font-black text-brand-gold uppercase tracking-widest underline decoration-2">{t('salat.status.current', 'Current')}</div>}
          </div>
        );
      })}
    </div>
  );
};
