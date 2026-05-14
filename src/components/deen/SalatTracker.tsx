import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getPrayerTimes, PrayerTimeInfo, formatPrayerTime } from '../../services/prayerService';
import { PrayerStatus } from '../../types';
import confetti from 'canvas-confetti';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useFirebase } from '../../FirebaseContext';

export const SalatTracker: React.FC = () => {
  const [prayers, setPrayers] = useState<PrayerTimeInfo[]>([]);
  const [donePrayers, setDonePrayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { user } = useFirebase();

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

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1B4332', '#D4A853', '#F4F1EB']
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'salat_logs');
      setDonePrayers(prev => prev.filter(p => p !== prayerName));
    }
  };

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const times = getPrayerTimes(latitude, longitude);
          setPrayers(times);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location", error);
          const times = getPrayerTimes(51.5074, -0.1278);
          setPrayers(times);
          setLocationError("Using default location (London)");
          setLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      setLoading(false);
      setLocationError("Geolocation not supported");
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="animate-spin text-brand-gold" size={32} />
        <p className="text-brand-forest/60 font-medium">Calculating prayer times...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {locationError && (
        <p className="text-[10px] text-center text-brand-gold font-bold uppercase tracking-widest">{locationError}</p>
      )}
      
      <div className="space-y-3">
        {prayers.map((prayer) => {
          const isDone = donePrayers.includes(prayer.name);
          const now = new Date();
          // Find if this is the "Current" or "Next" prayer
          // Simplified logic: the first prayer after 'now' is Next, one before 'now' is Current
          // In a real app we'd check ranges, here we just find the closest one
          const nextPrayer = prayers.find(p => p.time > now);
          const isCurrent = nextPrayer ? prayers[prayers.indexOf(nextPrayer) - 1]?.name === prayer.name : prayer.name === 'Isha';

          return (
            <div 
              key={prayer.name}
              className={`flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-brand-forest/10 gap-3 sm:gap-0 ${
                isCurrent && !isDone ? 'border-2 border-brand-gold bg-brand-gold/5 shadow-2xl' : 'bg-brand-forest/5'
              }`}
            >
              <div className="flex items-center gap-4 w-full sm:w-1/4">
                <div className={`w-3 h-3 rounded-full shrink-0 ${isDone ? 'bg-green-500' : isCurrent ? 'bg-brand-gold animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="font-black text-brand-forest">{prayer.name}</span>
              </div>
              
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <span className="text-sm font-mono font-black text-brand-forest">{formatPrayerTime(prayer.time)}</span>
                
                {isDone ? (
                  <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em] bg-green-500/10 px-3 py-1 rounded-lg">DONE ✓</span>
                ) : isCurrent ? (
                  <button 
                    onClick={() => celebrate(prayer.name)}
                    className="bg-brand-forest text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-forest/20 active:scale-95 transition-transform"
                  >
                    I PRAYED ✓
                  </button>
                ) : (
                  <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">
                    {prayer.time > now ? 'UPCOMING' : 'MISSED'}
                  </span>
                )}
              </div>
              
              <div className={`hidden sm:block w-1/4 text-right text-[10px] font-black ${isCurrent && !isDone ? 'text-brand-gold underline decoration-2' : 'opacity-20'}`}>
                {isCurrent && !isDone ? 'Current' : isDone ? 'Completed' : '+30 Pts'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
