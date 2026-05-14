import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav, TabType } from './components/BottomNav';
import { getRandomQuote, Quote } from './services/quoteService';
import { DeenScreen } from './components/deen/DeenScreen';
import { CareerScreen } from './components/career/CareerScreen';
import { HealthScreen } from './components/health/HealthScreen';
import { RewardsScreen } from './components/rewards/RewardsScreen';
import { Onboarding } from './components/auth/Onboarding';
import { useFirebase } from './FirebaseContext';
import { LogIn, Loader2, Shield, Settings as SettingsIcon } from 'lucide-react';
import { getDayAndHijri } from './services/dateService';
import { PrayerSummary } from './components/deen/PrayerSummary';
import { db } from './services/firebase';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { calculateLevel } from './constants/points';
import confetti from 'canvas-confetti';

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
  const [deenStats, setDeenStats] = useState({ done: 0, total: 5 });
  const [careerStats, setCareerStats] = useState({ done: 0, total: 3 });
  const [healthStats, setHealthStats] = useState({ done: 0, total: 4 });
  const [isSyncing, setIsSyncing] = useState(true);

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
        const healthSnap = await getDoc(doc(db, 'daily_logs', docId));
        const habits = healthSnap.exists() ? healthSnap.data().healthHabitsCompleted || [] : [];
        const totalHabits = profile?.healthHabits?.length || 4;
        setHealthStats({ done: habits.length, total: totalHabits });

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
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-brand-forest/10 pb-6 gap-4">
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
            {isSyncing ? 'Syncing your progress...' : (
              <>
                Marhaba, {profile?.name?.split(' ')[0] || 'User'} 
                {profile?.age && ` (${profile.age}y)`} • 
                {profile?.careerGoal ? ` Mission: ${profile.careerGoal}` : ' Your Daily Balance'}
              </>
            )}
          </p>
        </div>
        <div className="flex w-full md:w-auto justify-between md:justify-end items-end gap-3 md:gap-6">
          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg md:text-2xl">🔥</span>
              <span className="text-xl md:text-3xl font-black">{profile?.streak || 0} DAY STREAK</span>
            </div>
            <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-70">
              {getDayAndHijri()}
            </div>
          </div>
          <div className="flex items-center gap-2">
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
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onTabChange('deen')}
          className={`pillar-card bg-brand-forest text-white border-brand-gold relative group transition-all ${isSyncing ? 'animate-pulse' : ''}`}
        >
          <div className="flex justify-between items-start w-full mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Deen Pillar</span>
            <span className="text-2xl">🌙</span>
          </div>
          <h3 className="text-2xl font-black mb-1 w-full text-left">
            {isSyncing ? '--' : deenStats.done} / {deenStats.total}
          </h3>
          <p className="text-[10px] uppercase font-bold opacity-70 w-full text-left">Prayers Completed</p>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none rounded-[32px]" />
        </div>
        
        <div 
          onClick={() => onTabChange('career')}
          className={`pillar-card bg-[#1E3A5F] text-white border-[#3a5a8f] relative group transition-all ${isSyncing ? 'animate-pulse' : ''}`}
        >
          <div className="flex justify-between items-start w-full mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Career Pillar</span>
            <span className="text-2xl">💼</span>
          </div>
          <h3 className="text-2xl font-black mb-1 w-full text-left">
            {isSyncing ? '--' : careerStats.done} / {careerStats.total}
          </h3>
          <p className="text-[10px] uppercase font-bold opacity-70 w-full text-left">Tasks Progress</p>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none rounded-[32px]" />
        </div>

        <div 
          onClick={() => onTabChange('health')}
          className={`pillar-card bg-[#7C2D12] text-white border-[#a34a2c] relative group transition-all ${isSyncing ? 'animate-pulse' : ''}`}
        >
          <div className="flex justify-between items-start w-full mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Health Pillar</span>
            <span className="text-2xl">❤️</span>
          </div>
          <h3 className="text-2xl font-black mb-1 w-full text-left">
            {isSyncing ? '--' : healthStats.done} / {healthStats.total}
          </h3>
          <p className="text-[10px] uppercase font-bold opacity-70 w-full text-left">Habits Logged</p>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none rounded-[32px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <section className="bg-white rounded-2xl shadow-sm border border-brand-forest/10 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3 text-brand-forest">
                Salat Tracker <span className="text-brand-gold italic">|</span> 
                <span className="text-sm font-bold text-brand-forest/40 uppercase tracking-widest">{profile?.country || 'Local'}</span>
              </h2>
              <div className="bg-brand-cream px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-forest">
                {profile?.calculationMethod || 'MWL'} Method
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
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest opacity-40 mb-6 underline underline-offset-8 decoration-brand-gold/30">Total Mizan Points</p>
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

          <QuoteSection />
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

const QuoteSection = () => {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  if (!quote) return null;

  return (
    <div className="bg-brand-forest text-white rounded-2xl p-8 shadow-2xl flex-1 flex flex-col justify-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 -mr-8 -mt-8 rotate-12 scale-150">🌙</div>
      <h3 className="text-sm font-bold uppercase tracking-[0.3em] mb-6 opacity-40 border-b border-white/10 pb-4">Daily Reflection</h3>
      <p className="text-2xl leading-tight font-display font-light italic mb-8">
        "{quote.text}"
      </p>
      <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
        — {quote.author}
      </p>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { user, profile, loading, signIn } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream border-[12px] border-brand-forest">
        <Loader2 className="animate-spin text-brand-gold" size={40} />
      </div>
    );
  }

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
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-brand-forest/40">Balance Your Deen · Career · Health</p>
        </div>

        <button 
          onClick={signIn}
          className="w-full max-w-xs bg-brand-forest text-white py-5 rounded-2xl flex items-center justify-center gap-4 font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-forest/30 active:scale-95 transition-all"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>

        <p className="max-w-[200px] text-[10px] uppercase font-bold tracking-widest text-brand-forest/20 leading-loose">
          The scale of justice for the modern muslim life.
        </p>
      </div>
    );
  }

  if (profile && !profile.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <div className="viewport-border bg-brand-cream overflow-hidden">
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-12 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'home' && <HomeScreen onTabChange={setActiveTab} />}
            {activeTab === 'deen' && <DeenScreen />}
            {activeTab === 'career' && <CareerScreen />}
            {activeTab === 'health' && <HealthScreen />}
            {activeTab === 'rewards' && <RewardsScreen />}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:px-12 lg:pb-8 pointer-events-none">
        <nav className="w-full max-w-lg mx-auto bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-brand-forest/10 p-4 flex items-center justify-between shadow-2xl pointer-events-auto ring-1 ring-brand-forest/5">
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </nav>
      </div>
    </div>
  );
}
