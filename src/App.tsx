import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { TabType } from './components/BottomNav';
import { getRandomHadith, HadithRef } from './services/quoteService';
import { Onboarding } from './components/auth/Onboarding';
import { useFirebase } from './FirebaseContext';
import { LogIn, Loader2, Shield, Settings as SettingsIcon, Globe, Zap, Moon, Briefcase, Heart, CheckCircle, Bookmark } from 'lucide-react';
import { getDayAndHijri } from './services/dateService';
import { PrayerSummary } from './features/deen/components/PrayerSummary';
import { db, handleFirestoreError, OperationType } from './services/firebase';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { calculateLevel } from './constants/points';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { ArabicText } from './components/ui/ArabicText';
import { MainLayout } from './layouts/MainLayout';
import { AIInsightCard } from './components/dashboard/AIInsightCard';
import { generateDailyInsight } from './services/insightsEngine';

// Lazy loaded routes
const DeenScreen = lazy(() => import('./features/deen/components/DeenScreen').then(m => ({ default: m.DeenScreen })));
const CareerScreen = lazy(() => import('./components/career/CareerScreen').then(m => ({ default: m.CareerScreen })));
const HealthScreen = lazy(() => import('./components/health/HealthScreen').then(m => ({ default: m.HealthScreen })));
const RewardsScreen = lazy(() => import('./components/rewards/RewardsScreen').then(m => ({ default: m.RewardsScreen })));

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { user } = useFirebase();

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'bn' : 'en';
    await i18n.changeLanguage(newLang);
    
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { language: newLang });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      }
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-3 rounded-xl bg-brand-forest/5 text-brand-forest/80 hover:text-brand-forest transition-colors flex items-center gap-2 font-bold text-xs"
      title="Toggle Language"
    >
      <Globe size={18} />
      <span>{i18n.language === 'bn' ? 'BN' : 'EN'}</span>
    </button>
  );
};

const celebrate = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#1B4332', '#D4A853', '#F4F1EB']
  });
};

const HomeScreen = ({ onTabChange }: { onTabChange: (tab: TabType) => void }) => {
  const { user, profile, signOut } = useFirebase();
  const { t, i18n } = useTranslation();
  const [deenStats, setDeenStats] = useState({ done: 0, total: 5 });
  const [careerStats, setCareerStats] = useState({ done: 0, total: 3 });
  const [healthStats, setHealthStats] = useState({ done: 0, total: 4 });
  const [isSyncing, setIsSyncing] = useState(true);
  const [dailyInsight, setDailyInsight] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setIsSyncing(true);
      const today = new Date().toISOString().split('T')[0];
      const docId = `${user.uid}_${today}`;

      try {
        // Deen Stats
        const deenSnap = await getDocs(query(
          collection(db, 'salat_logs'),
          where('userId', '==', user.uid),
          where('date', '==', today)
        ));
        setDeenStats({ done: deenSnap.size, total: 5 });

        // Health Stats
        const healthDailySnap = await getDoc(doc(db, 'health_daily', docId));
        let sleepHours = undefined;
        let doneHealth = 0;
        if (healthDailySnap.exists()) {
          const data = healthDailySnap.data();
          sleepHours = data.sleep_hours;
          if (data.workout_done) doneHealth++;
          if (data.glasses_water) doneHealth++;
          if (data.sleep_hours) doneHealth++;
          if (data.energy_level) doneHealth++;
        }
        
        const healthSnap = await getDoc(doc(db, 'daily_logs', docId));
        const habits = healthSnap.exists() ? healthSnap.data().healthHabitsCompleted || [] : [];
        const totalHabits = profile?.healthHabits?.length || 4;
        setHealthStats({ done: doneHealth > 0 ? doneHealth : habits.length, total: totalHabits });

        const fajrLog = deenSnap.docs.find(d => d.data().prayerName === 'Fajr');
        const insight = generateDailyInsight(
          { sleep_hours: sleepHours },
          { fajrCompleted: !!fajrLog }
        );
        setDailyInsight(insight);

        // Career Stats
        const careerSnap = await getDocs(query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('isCompleted', '==', true)
        ));
        setCareerStats({ done: careerSnap.size, total: Math.max(careerSnap.size, 3) });
      } catch (e) {
        console.error('Error fetching dashboard stats:', e);
      } finally {
        setIsSyncing(false);
      }
    };
    fetchStats();
  }, [user, profile]);

  const levelInfo = calculateLevel(profile?.points || 0);
  const progress = Math.min(100, ((profile?.points || 0) / levelInfo.next) * 100);
  
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-brand-forest/10 pb-6 gap-4 pr-14 lg:pr-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-[14px] bg-brand-forest flex items-center justify-center text-brand-gold shadow-lg rotate-3">
                <span className="font-black text-xl italic">M</span>
             </div>
             <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-forest flex items-baseline gap-2">
               MIZAN <span className="text-brand-gold font-light italic text-xl md:text-2xl">ميزان</span>
             </h1>
          </div>
          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-forest/60 max-w-[400px] md:max-w-none">
            {isSyncing ? t('dashboard.syncing', 'Syncing your progress...') : (
              <>
                {t('dashboard.greeting', 'Marhaba')}, {profile?.name?.split(' ')[0] || t('dashboard.traveler', 'Traveler')} 
                {profile?.age && ` (${profile.age}y)`} • 
                {profile?.careerGoal ? ` ${t('dashboard.mission', 'Mission:')} ${profile.careerGoal}` : ` ${t('dashboard.dailyBalance', 'Your Daily Balance')}`}
              </>
            )}
          </p>
        </div>
        <div className="flex w-full md:w-auto justify-between md:justify-end items-end gap-3 md:gap-6">
          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center gap-2 mb-1 text-brand-gold">
              <Zap className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
              <span className="text-xl md:text-3xl font-black text-brand-forest">
                {new Intl.NumberFormat(i18n.language === 'bn' ? 'bn-BD' : 'en-US').format(profile?.streak || 0)} {t('dashboard.streak', 'DAY STREAK')}
              </span>
            </div>
            <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-70">
              {getDayAndHijri()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button 
              onClick={() => onTabChange('rewards')}
              className="p-3 rounded-xl bg-brand-forest/5 text-brand-forest/40 hover:text-brand-forest transition-colors"
              title="Settings"
            >
              <SettingsIcon size={20} />
            </button>
            <button 
              onClick={() => signOut()}
              className="px-4 py-3 rounded-xl bg-brand-forest text-white hover:bg-brand-forest/90 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              {t('dashboard.logout', 'Logout')}
            </button>
          </div>
        </div>
      </header>

      {dailyInsight && <AIInsightCard insight={dailyInsight} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onTabChange('deen')}
          className={`pillar-card bg-brand-forest text-white border-brand-gold relative group transition-all ${isSyncing ? 'animate-pulse' : ''}`}
        >
          <div className="flex justify-between items-start w-full mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{t('dashboard.pillars.deen', 'Deen Pillar')}</span>
            <Moon className="w-6 h-6 text-brand-gold" />
          </div>
          <h3 className="text-2xl font-black mb-1 w-full text-left">
            {isSyncing ? '--' : deenStats.done} / {deenStats.total}
          </h3>
          <p className="text-[10px] uppercase font-bold opacity-70 w-full text-left">{t('dashboard.pillars.prayers', 'Prayers Completed')}</p>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none rounded-[32px]" />
        </div>
        
        <div 
          onClick={() => onTabChange('career')}
          className={`pillar-card bg-[#1E3A5F] text-white border-[#3a5a8f] relative group transition-all ${isSyncing ? 'animate-pulse' : ''}`}
        >
          <div className="flex justify-between items-start w-full mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{t('dashboard.pillars.career', 'Career Pillar')}</span>
            <Briefcase className="w-6 h-6 text-[#8eaee0]" />
          </div>
          <h3 className="text-2xl font-black mb-1 w-full text-left">
            {isSyncing ? '--' : careerStats.done} / {careerStats.total}
          </h3>
          <p className="text-[10px] uppercase font-bold opacity-70 w-full text-left">{t('dashboard.pillars.tasks', 'Tasks Progress')}</p>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none rounded-[32px]" />
        </div>

        <div 
          onClick={() => onTabChange('health')}
          className={`pillar-card bg-[#7C2D12] text-white border-[#a34a2c] relative group transition-all ${isSyncing ? 'animate-pulse' : ''}`}
        >
          <div className="flex justify-between items-start w-full mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{t('dashboard.pillars.health', 'Health Pillar')}</span>
            <Heart className="w-6 h-6 text-[#fca5a5]" />
          </div>
          <h3 className="text-2xl font-black mb-1 w-full text-left">
            {isSyncing ? '--' : healthStats.done} / {healthStats.total}
          </h3>
          <p className="text-[10px] uppercase font-bold opacity-70 w-full text-left">{t('dashboard.pillars.habits', 'Habits Logged')}</p>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none rounded-[32px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <section className="bg-white rounded-2xl shadow-sm border border-brand-forest/10 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3 text-brand-forest">
                {t('dashboard.salatTracker', 'Salat Tracker')} <span className="text-brand-gold italic">|</span> 
                <span className="text-sm font-bold text-brand-forest/40 uppercase tracking-widest">{profile?.country || t('dashboard.local', 'Local')}</span>
              </h2>
              <div className="bg-brand-cream px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-forest">
                {profile?.calculationMethod || 'MWL'} {t('dashboard.method', 'Method')}
              </div>
            </div>
            
            <DeenSummarySection />
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-brand-forest/10 p-6 md:p-8 flex flex-col items-center text-center">
            <h3 className="text-brand-gold text-4xl md:text-5xl font-black mb-1 italic tracking-tighter">
              {profile?.points?.toLocaleString() || 0}
            </h3>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest opacity-40 mb-6 underline underline-offset-8 decoration-brand-gold/30">{t('dashboard.totalPoints', 'Total Mizan Points')}</p>
            <div className="w-full bg-brand-forest/5 h-3 rounded-full mb-4 overflow-hidden border border-brand-forest/5 shadow-inner">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className="bg-brand-gold h-full shadow-[0_0_15px_rgba(212,168,83,0.4)]"
               />
            </div>
            <div className="flex justify-between w-full text-[9px] md:text-[10px] font-black tracking-widest uppercase text-brand-forest/60">
              <span className="text-brand-gold">LVL {levelInfo.level}: {levelInfo.title}</span>
              <span className="opacity-30">LVL {levelInfo.level + 1}</span>
            </div>
          </div>

          <HadithSection />
        </div>
      </div>
    </div>
  );
};

// Extracted for clean rendering in homeostasis
const DeenSummarySection = () => {
  return (
    <div className="space-y-4">
      <PrayerSummary />
    </div>
  );
};

const HadithSection = () => {
  const { t } = useTranslation();
  const { user } = useFirebase();
  const [hadith, setHadith] = useState<HadithRef | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [savedToVault, setSavedToVault] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHadith(getRandomHadith());
  }, []);

  if (!hadith) return null;

  const handlePressStart = () => {
    setIsPressing(true);
    timerRef.current = setTimeout(async () => {
      if (typeof navigator.vibrate === 'function') {
        navigator.vibrate([50, 50, 50]);
      }
      setSavedToVault(true);
      
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'vault', hadith.id), {
            id: hadith.id,
            arabic: hadith.arabic,
            timestamp: serverTimestamp()
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/vault/${hadith.id}`);
        }
      }
      
      setTimeout(() => setSavedToVault(false), 2000);
    }, 800);
  };

  const handlePressEnd = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="relative flex flex-col flex-1">
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        className={`bg-brand-forest text-white rounded-2xl p-8 shadow-2xl flex-1 flex flex-col justify-center relative overflow-hidden group select-none touch-pan-y transition-colors duration-300 ${savedToVault ? 'bg-brand-gold/20' : ''}`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 -mr-8 -mt-8 rotate-12 scale-150">
          <Moon className="w-64 h-64" />
        </div>
        
        <div className="flex items-center justify-between border-b border-white/10 mb-6 pb-4 relative z-10">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.3em] opacity-40">
              {t('dashboard.dailyReflection', 'Daily Reflection')}
            </h3>
          </div>
          <AnimatePresence>
            {savedToVault ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="px-3 py-1 bg-brand-gold/20 text-brand-gold rounded-full text-[10px] font-black tracking-widest flex items-center gap-1"
              >
                <CheckCircle size={12} />
                SAVED TO VAULT
              </motion.div>
            ) : isPressing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-1 bg-white/5 text-white/50 rounded-full text-[10px] font-bold tracking-widest flex items-center gap-1"
              >
                HOLD TO SAVE
              </motion.div>
            ) : (
              <div className="px-3 py-1 text-white/20 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                <Bookmark size={12} className="opacity-50" />
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Dual Language Hadith Architecture */}
        <div className="space-y-6 flex flex-col items-center relative z-10">
          <p className="text-3xl arabic-text text-brand-gold border-b border-white/10 w-full text-center mb-2 pb-4">
            {hadith.arabic}
          </p>
          <p className="text-lg leading-relaxed font-display font-light inline-block text-center w-full">
            {t(`hadith.${hadith.id}` as any).split('\n').map((line: string, i: number) => (
               <React.Fragment key={i}>
                  {line}
                  <br />
               </React.Fragment>
            ))}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const { user, profile, loading, isDeleting, signIn } = useFirebase();
  const { t } = useTranslation();

  // Strict state checks for authentication and onboarding
  if (loading || isDeleting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream border-[12px] border-brand-forest relative overflow-hidden">
        {/* Subtle background pattern/glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-gold/10 via-transparent to-transparent opacity-50" />
        
        <div className="flex flex-col items-center gap-8 relative z-10 p-12 bg-white rounded-[3rem] shadow-2xl border border-brand-forest/5 max-w-sm w-full mx-4 text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-brand-forest/5 rounded-3xl flex items-center justify-center mb-4 relative z-10 rotate-12">
              <Loader2 className="animate-spin text-brand-gold -rotate-12" size={40} />
            </div>
            {/* Pulsing ring behind the icon */}
            <div className="absolute inset-0 bg-brand-gold/20 rounded-3xl animate-ping opacity-50" />
          </div>

          <div className="space-y-3 px-4">
            <h2 className="text-2xl font-black text-brand-forest italic tracking-tighter">
              {isDeleting ? t('loading.sayingGoodbye', "Saying Goodbye") : t('loading.justAMoment', "Just a Moment")}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-forest/40 leading-relaxed">
              {isDeleting 
                ? t('loading.wipingRecords', "Securely wiping all your records and resetting your progress...") 
                : t('loading.loadingBalance', "Loading your balance...")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 1. No user -> Always go to Login
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-8 text-center space-y-12 border-[12px] border-brand-forest">
        <div className="w-32 h-32 bg-brand-forest rounded-[2rem] flex items-center justify-center text-brand-gold rotate-12 shadow-2xl relative">
          <motion.div
            animate={{ rotate: -12 }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <Shield size={64} fill="currentColor" className="opacity-10 absolute pointer-events-none" />
            <div className="font-display font-black text-6xl italic leading-none">M</div>
            <div className="text-[8px] font-black tracking-[0.5em] mt-1 -mr-1">MIZAN</div>
          </motion.div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-6xl font-display font-black text-brand-forest tracking-tighter italic">MIZAN</h1>
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-brand-forest/40">{t('auth.balance', 'Balance Your Deen · Career · Health')}</p>
        </div>

        <button 
          onClick={signIn}
          className="w-full max-w-xs bg-brand-forest text-white py-5 rounded-2xl flex items-center justify-center gap-4 font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-forest/30 active:scale-95 transition-all"
        >
          <LogIn size={20} />
          {t('auth.signInWithGoogle', 'Sign in with Google')}
        </button>

        <p className="max-w-[200px] text-[10px] uppercase font-bold tracking-widest text-brand-forest/20 leading-loose">
          {t('auth.tagline', 'The scale of justice for the modern muslim life.')}
        </p>
      </div>
    );
  }

  // 2. User exists but no profile or incomplete profile -> Onboarding
  if (!profile || !profile.onboardingComplete) {
    return <Onboarding key="onboarding" />;
  }

  // HomeScreen Wrapper to inject navigate
  const HomeScreenWrapper = () => {
    const navigate = useNavigate();
    return <HomeScreen onTabChange={(tab) => {
      if (tab === 'home') navigate('/');
      else navigate(`/${tab}`);
    }} />;
  };

  // 3. User exists and onboarding is complete -> Dashboard
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeScreenWrapper />} />
          <Route path="/deen" element={<DeenScreen />} />
          <Route path="/career" element={<CareerScreen />} />
          <Route path="/health" element={<HealthScreen />} />
          <Route path="/rewards" element={<RewardsScreen />} />
        </Route>
      </Routes>
    </Router>
  );
}
