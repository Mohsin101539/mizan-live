import React, { useState } from 'react';
import { useFirebase } from '../../FirebaseContext';
import { Trophy, Star, Medal, Target, Flame, Moon, Book, Heart, Settings, MapPin, LogOut, Edit3, Trash2, Mail, Snowflake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../../services/firebase';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch, updateDoc, increment } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { calculateLevel } from '../../constants/points';
import { BADGES } from '../../constants/badges';
import { ProfileEditor } from './ProfileEditor';
import { useTranslation } from 'react-i18next';
import { AccountabilityCircles } from '../social/AccountabilityCircles';

export const RewardsScreen: React.FC = () => {
  const { user, profile, signOut, setIsDeleting } = useFirebase();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const points = profile?.points || 0;

  const levelInfo = calculateLevel(points);
  const currentLevelIndex = Math.min(5, levelInfo.level - 1);
  const progress = Math.min(100, (points / levelInfo.next) * 100);

  const STREAK_FREEZE_COST = 2000;
  const streakFreezes = profile?.streakFreezes || 0;
  const [buyingFreeze, setBuyingFreeze] = useState(false);

  const buyStreakFreeze = async () => {
    if (!user || points < STREAK_FREEZE_COST || buyingFreeze) return;
    setBuyingFreeze(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(-STREAK_FREEZE_COST),
        streakFreezes: increment(1)
      });
    } catch (e) {
      console.error(e);
    } finally {
      setBuyingFreeze(false);
    }
  };

  return (
    <div className="pt-4 space-y-12 pb-24 text-brand-forest">
      <header className="pr-14 lg:pr-0">
        <h1 className="text-4xl font-display font-black text-brand-forest italic leading-none">{t('profile.title', 'Profile')}</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/30 mt-2">{t('profile.subtitle', 'Achievements & Account Settings')}</p>
      </header>

      <section className="bg-brand-forest text-white rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 -mr-12 -mt-12 scale-150 rotate-12">
            <Trophy size={160} />
        </div>
        
        <div className="relative z-10 text-center space-y-4">
          <div className="flex flex-col items-center">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">{t('profile.authUser', 'Authenticated User')}</p>
             <p className="text-xl font-bold text-white mb-2 bg-white/10 px-6 py-2 rounded-full border border-white/10">{profile?.name || user?.displayName || 'User'}</p>
             <div className="flex items-center gap-2 text-[10px] font-black text-brand-gold bg-black/20 px-4 py-1.5 rounded-full border border-brand-gold/20">
                <Mail size={12} />
                <span className="tracking-widest uppercase">{user?.email}</span>
             </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t('profile.currentTitle', 'Your Current Title')}</p>
          <h2 className="text-4xl md:text-6xl font-display font-black italic text-brand-gold tracking-tighter">{t(`profile.titles.${levelInfo.title.toLowerCase().replace(/ /g, '_')}`, levelInfo.title)}</h2>
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">{t('profile.level', 'Level')} {levelInfo.level}</p>
          
          <div className="pt-8 space-y-3">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-brand-gold">{points} {t('profile.xp', 'XP')}</span>
                <span className="opacity-40">{levelInfo.next - points > 0 ? `${levelInfo.next - points} ${t('profile.xpForNextLevel', 'XP For Next Level')}` : t('profile.maxLevel', 'Max Level')}</span>
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
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/40 mb-6 px-2">{t('profile.graceModule', 'Grace Module')}</h3>
        <div className="bg-blue-500/10 rounded-3xl p-6 md:p-8 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex flex-col items-center justify-center text-blue-600 relative">
              <Snowflake size={32} />
              {streakFreezes > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                  {streakFreezes}
                </div>
              )}
            </div>
            <div className="text-left flex-1">
              <h4 className="font-black text-brand-forest text-lg">{t('profile.streakFreeze', 'Streak Freeze')}</h4>
              <p className="text-xs font-medium text-brand-forest/60 mt-1">
                {t('profile.streakFreezeDesc', 'Miss a day? Automatically consumes 1 Freeze to protect your streak. No questions asked.')}
              </p>
            </div>
          </div>
          <button
            onClick={buyStreakFreeze}
            disabled={buyingFreeze || points < STREAK_FREEZE_COST}
            className="w-full md:w-auto flex-shrink-0 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all active:scale-95"
          >
            {buyingFreeze ? t('profile.purchasing', 'PURCHASING...') : `${t('profile.buyFor', 'BUY FOR')} ${STREAK_FREEZE_COST} XP`}
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/40 mb-6 px-2">{t('profile.badgeCollection', 'Badge Collection')}</h3>
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
                <h4 className="font-black text-[10px] md:text-sm text-brand-forest leading-tight uppercase tracking-widest">{t(`profile.badges.${badge.id}.name`, badge.name)}</h4>
                <p className="text-[8px] md:text-[9px] font-bold text-brand-forest/40 uppercase tracking-tight mt-1">{t(`profile.badges.${badge.id}.desc`, badge.desc)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <AccountabilityCircles />
      </section>

      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/40 px-2 flex items-center gap-2">
          <Settings size={14} /> {t('profile.accountSettings', 'Account Settings')}
        </h3>
        
        <div className="bg-white rounded-3xl border border-brand-forest/10 overflow-hidden divide-y divide-brand-forest/5">
          <button 
            onClick={() => setIsEditing(true)}
            className="w-full p-6 flex items-center justify-between hover:bg-brand-forest/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                <Edit3 size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('profile.personalization', 'Personalization')}</p>
                <p className="font-bold text-brand-forest">{t('profile.customizeProfile', 'Customize Profile & Location')}</p>
              </div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity">
              {t('profile.editAll', 'Edit All')}
            </div>
          </button>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-forest/5 flex items-center justify-center text-brand-forest/40">
                <MapPin size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('profile.activeLocation', 'Active Location')}</p>
                <p className="font-bold text-brand-forest leading-tight">
                  {profile?.city || t('profile.city', 'City')}, {profile?.country || t('profile.country', 'Country')}
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => signOut()}
            className="w-full p-6 flex items-center gap-4 text-brand-forest hover:bg-brand-forest/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-forest/5 flex items-center justify-center text-brand-forest/60">
              <LogOut size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('profile.session', 'Session')}</p>
              <p className="font-bold">{t('profile.logout', 'Logout from Mizan')}</p>
            </div>
          </button>

          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full p-6 flex items-center gap-4 text-red-500 hover:bg-red-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Trash2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('profile.dangerZone', 'Danger Zone')}</p>
              <p className="font-bold">{t('profile.deleteAccount', 'Delete Account & Data')}</p>
            </div>
          </button>
        </div>
      </section>

      <AnimatePresence>
        {isEditing && (
          <ProfileEditor 
            userId={user?.uid || ''} 
            profile={profile} 
            onClose={() => setIsEditing(false)} 
          />
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-brand-forest/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto">
                <Trash2 size={40} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-brand-forest italic">{t('profile.deleteConfirmTitle', 'Delete Account?')}</h3>
                <p className="text-sm text-brand-forest/60 font-medium">
                  {t('profile.deleteConfirmDesc', 'This is permanent. All your points, streaks, and personalized data will be erased forever.')}
                </p>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 rounded-xl text-[10px] text-red-600 font-bold uppercase tracking-wider">
                  {deleteError}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button 
                  onClick={async () => {
                    if (deleteLoading) return;
                    if (!user) return;
                    
                    setDeleteLoading(true);
                    setDeleteError(null);
                    setIsDeleting(true); 
                    
                    try {
                      // 1. Delete user profile (UI starts seeing profile as null, but isDeleting protects us)
                      await deleteDoc(doc(db, 'users', user.uid));
                      
                      // 2. Clear related data collections (best effort)
                      const collectionsToClear = ['salat_logs', 'goals', 'subgoals', 'tasks', 'health_daily', 'daily_logs', 'adhkar_logs', 'badges'];
                      
                      for (const collectionName of collectionsToClear) {
                        try {
                          const q = query(collection(db, collectionName), where('userId', '==', user.uid));
                          const snapshot = await getDocs(q);
                          if (!snapshot.empty) {
                            const batch = writeBatch(db);
                            snapshot.docs.forEach(doc => batch.delete(doc.ref));
                            await batch.commit();
                          }
                        } catch (err) {
                          console.warn(`Failed to clear collection ${collectionName}:`, err);
                        }
                      }
                      
                      // 3. Delete Auth Account 
                      try {
                        await deleteUser(user);
                      } catch (authError: any) {
                        console.error("Auth Deletion Failed:", authError);
                      }

                      // 4. Hard sign out regardless of previous success/failure
                      // This ensures that the user session is completely killed. 
                      // The onAuthStateChanged listener will catch the null user and reset isDeleting.
                      await signOut();

                    } catch (error: any) {
                      console.error("Critical Deletion Failure:", error);
                      
                      // Try a hard emergency sign out
                      try {
                        await signOut();
                      } catch (e) {
                        console.error("Emergency signout failed:", e);
                        // Only unblock UI if absolutely everything failed
                        setDeleteLoading(false);
                        setIsDeleting(false);
                        setDeleteError("Deletion encountered an error. Please reload the page.");
                      }
                    }
                  }}
                  disabled={deleteLoading}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {deleteLoading ? t('profile.deleting', 'Deleting...') : t('profile.yesDelete', 'Yes, Delete Everything')}
                </button>
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteError(null);
                  }}
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-brand-forest/40 hover:bg-brand-forest/5 transition-colors"
                >
                  {t('profile.noKeepProgress', 'No, Keep My Progress')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
