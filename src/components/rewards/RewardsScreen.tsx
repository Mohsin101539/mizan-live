import React from 'react';
import { useFirebase } from '../../FirebaseContext';
import { Trophy, Star, Medal, Target, Flame, Moon, Book, Heart, Settings, MapPin, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { calculateLevel } from '../../constants/points';
import { BADGES } from '../../constants/badges';

export const RewardsScreen: React.FC = () => {
  const { user, profile, signOut } = useFirebase();
  const points = profile?.points || 0;

  const levelInfo = calculateLevel(points);
  const currentLevelIndex = Math.min(5, levelInfo.level - 1);
  const progress = Math.min(100, (points / levelInfo.next) * 100);

  const updateField = async (field: string, current: string) => {
    const val = prompt(`Enter new ${field}:`, current);
    if (val && user) {
       try {
         await updateDoc(doc(db, 'users', user.uid), { [field]: val });
       } catch (e) {
         console.error(e);
       }
    }
  };

  return (
    <div className="pt-4 space-y-12 pb-24 text-brand-forest">
      <header>
        <h1 className="text-4xl font-display font-black text-brand-forest italic leading-none">Profile</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/30 mt-2">Achievements & Account Settings</p>
      </header>

      <section className="bg-brand-forest text-white rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 -mr-12 -mt-12 scale-150 rotate-12">
            <Trophy size={160} />
        </div>
        
        <div className="relative z-10 text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Your Current Title</p>
          <h2 className="text-4xl md:text-6xl font-display font-black italic text-brand-gold tracking-tighter">{levelInfo.title}</h2>
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">Level {levelInfo.level}</p>
          
          <div className="pt-8 space-y-3">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-brand-gold">{points} XP</span>
                <span className="opacity-40">{levelInfo.next - points > 0 ? `${levelInfo.next - points} XP For Next Level` : 'Max Level'}</span>
             </div>
             <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-brand-gold shadow-[0_0_20px_rgba(212,168,83,0.5)]" 
                />
             </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/40 mb-6 px-2">Badge Collection</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGES.map(badge => {
            const Icon = badge.icon;
            const isUnlocked = points > 100; 

            return (
              <div 
                key={badge.id}
                className={`bg-white rounded-3xl p-6 border border-brand-forest/10 flex flex-col items-center text-center transition-all ${!isUnlocked && 'opacity-30 grayscale'}`}
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-brand-forest/5 flex items-center justify-center mb-4 ${badge.color}`}>
                  <Icon size={24} className="md:w-8 md:h-8" />
                </div>
                <h4 className="font-black text-[10px] md:text-sm text-brand-forest leading-tight uppercase tracking-widest">{badge.name}</h4>
                <p className="text-[8px] md:text-[9px] font-bold text-brand-forest/40 uppercase tracking-tight mt-1">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/40 px-2 flex items-center gap-2">
          <Settings size={14} /> Account Settings
        </h3>
        
        <div className="bg-white rounded-3xl border border-brand-forest/10 overflow-hidden divide-y divide-brand-forest/5">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-forest/5 flex items-center justify-center text-brand-forest/40">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Your Location</p>
                <p className="font-bold text-brand-forest">{profile?.country || 'Not Set'}</p>
              </div>
            </div>
            <button 
              onClick={() => updateField('country', profile?.country || '')}
              className="text-[10px] font-black uppercase tracking-widest text-brand-gold"
            >
              Change
            </button>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-forest/5 flex items-center justify-center text-brand-forest/40">
                <Settings size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Calc Method</p>
                <p className="font-bold text-brand-forest">{profile?.calculationMethod || 'MWL'}</p>
              </div>
            </div>
            <button 
              onClick={() => updateField('calculationMethod', profile?.calculationMethod || 'MWL')}
              className="text-[10px] font-black uppercase tracking-widest text-brand-gold"
            >
              Change
            </button>
          </div>

          <button 
            onClick={() => signOut()}
            className="w-full p-6 flex items-center gap-4 text-red-500 hover:bg-red-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <p className="font-black uppercase tracking-widest text-[10px]">Logout from Mizan</p>
          </button>
        </div>
      </section>
    </div>
  );
};
