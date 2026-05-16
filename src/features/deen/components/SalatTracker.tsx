import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPrayerTimes, PrayerTimeInfo, formatPrayerTime } from '../../../services/prayerService';
import { PrayerStatus } from '../../../types';
import confetti from 'canvas-confetti';
import { useFirebase } from '../../../FirebaseContext';
import { useTranslation } from 'react-i18next';
import { useUpdatePrayer } from '../hooks/useUpdatePrayer';

export interface SalatTrackerProps {
  donePrayers: string[];
  loadingStats: boolean;
}

export const SalatTracker: React.FC<SalatTrackerProps> = ({ donePrayers, loadingStats }) => {
  const [prayers, setPrayers] = useState<PrayerTimeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { profile } = useFirebase();
  const { mutate } = useUpdatePrayer();

  const handleCelebrate = (prayerName: string) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#1B4332', '#D4A853', '#F4F1EB']
    });
    mutate(prayerName); // Optimistic UI: no need to await or show loading spinner!
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Priority: 1. Profile Location, 2. Geolocation, 3. Default (Dhaka)
    if (profile?.location?.latitude && profile?.location?.longitude) {
      const times = getPrayerTimes(profile.location.latitude, profile.location.longitude);
      setPrayers(times);
      setLoading(false);
      return;
    }

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
          const times = getPrayerTimes(23.8103, 90.4125); // Dhaka
          setPrayers(times);
          setLocationError("Using default location (Dhaka). Set city in settings for accuracy.");
          setLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      setPrayers(getPrayerTimes(23.8103, 90.4125)); // Dhaka
      setLoading(false);
      setLocationError("Geolocation not supported. Using Dhaka.");
    }
  }, [profile?.location]);

  if (loading || loadingStats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="animate-spin text-brand-gold" size={32} />
        <p className="text-brand-forest/60 font-medium">Calculating prayer times...</p>
      </div>
    );
  }

  const sortedPrayers = [...prayers].sort((a, b) => {
    const aDone = donePrayers.includes(a.name);
    const bDone = donePrayers.includes(b.name);
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1;
  });

  return (
    <div className="space-y-4">
      {locationError && (
        <p className="text-[10px] text-center text-brand-gold font-bold uppercase tracking-widest">{locationError}</p>
      )}
      
      <div className="space-y-3 relative">
        <AnimatePresence mode="popLayout">
          {sortedPrayers.map((prayer) => {
            const isDone = donePrayers.includes(prayer.name);
            const now = currentTime;
            // Find if this is the "Current" or "Next" prayer
            // Simplified logic: the first prayer after 'now' is Next, one before 'now' is Current
            // In a real app we'd check ranges, here we just find the closest one
            const nextPrayer = prayers.find(p => p.time > now);
            const isCurrent = nextPrayer ? prayers[prayers.indexOf(nextPrayer) - 1]?.name === prayer.name : prayer.name === 'Isha';

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key={prayer.name}
                className={`flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border gap-3 sm:gap-0 ${
                  isCurrent && !isDone 
                    ? 'border-brand-gold bg-brand-gold/10 shadow-[inset_0_0_20px_rgba(212,168,83,0.15)] shadow-brand-gold/20' 
                    : 'border-brand-forest/10 bg-brand-forest/5'
                }`}
              >
                <div className="flex items-center gap-4 w-full sm:w-1/4">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${isDone ? 'bg-green-500' : isCurrent ? 'bg-brand-gold animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="font-black text-brand-forest">{t(`salat.${prayer.name}`, prayer.name)}</span>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <span className="text-sm font-mono font-black text-brand-forest">{formatPrayerTime(prayer.time)}</span>
                  
                  {isDone ? (
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em] bg-green-500/10 px-3 py-1 rounded-lg">
                      {t('salat.status.done', 'DONE ✓')}
                    </span>
                  ) : isCurrent ? (
                    <button 
                      onClick={() => handleCelebrate(prayer.name)}
                      className="bg-brand-forest text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-forest/20 active:scale-95 transition-transform"
                    >
                      {t('salat.status.iPrayed', 'I PRAYED ✓')}
                    </button>
                  ) : (
                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">
                      {prayer.time > now ? t('salat.status.upcoming', 'UPCOMING') : t('salat.status.missed', 'MISSED')}
                    </span>
                  )}
                </div>
                
                <div className={`hidden sm:block w-1/4 text-right text-[10px] font-black ${isCurrent && !isDone ? 'text-brand-gold underline decoration-2' : 'opacity-20'}`}>
                  {isCurrent && !isDone ? t('salat.status.current', 'Current') : isDone ? t('salat.status.completed', 'Completed') : '+30 Pts'}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
