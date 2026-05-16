import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const checkAndMaintainStreak = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const data = userSnap.data();
  // Using local date for daily reset boundary
  const todayStr = new Date().toLocaleDateString('en-CA'); 
  const lastLoginStr = data.lastLoginDate || '';

  if (todayStr === lastLoginStr) {
    return; // Already checked today
  }

  const updates: any = {
    lastLoginDate: todayStr
  };

  let missedDays = 0;
  if (lastLoginStr) {
    const lastDate = new Date(lastLoginStr);
    const todayDate = new Date(todayStr);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    missedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) - 1;
  }

  if (missedDays === 0) {
    // Consecutive day
    updates.streak = data.streak ? data.streak + 1 : 1;
  } else if (missedDays > 0) {
    // Missed days! Check freezes
    const freezes = data.streakFreezes || 0;

    if (freezes >= missedDays) {
      // Consume freezes, maintain streak (DO NOT increment it, just maintain)
      updates.streakFreezes = freezes - missedDays;
      updates.streak = data.streak; // Maintain current count
      
      // Log the frozen days
      for (let i = 1; i <= missedDays; i++) {
        const frozenDate = new Date(new Date(lastLoginStr).getTime() + i * (1000 * 60 * 60 * 24));
        const frozenDateStr = frozenDate.toLocaleDateString('en-CA');
        
        await setDoc(doc(db, 'streak_logs', `${userId}_${frozenDateStr}`), {
          status: 'frozen',
          date: frozenDateStr,
          userId,
          timestamp: serverTimestamp()
        }, { merge: true });
      }
    } else {
      // Not enough freezes, streak resets to 1 (because they logged in today)
      updates.streak = 1;
      
      // Log the failed days
      for (let i = 1; i <= missedDays; i++) {
        const failedDate = new Date(new Date(lastLoginStr).getTime() + i * (1000 * 60 * 60 * 24));
        const failedDateStr = failedDate.toLocaleDateString('en-CA');
        
        await setDoc(doc(db, 'streak_logs', `${userId}_${failedDateStr}`), {
          status: 'failed',
          date: failedDateStr,
          userId,
            timestamp: serverTimestamp()
        }, { merge: true });
      }
    }
  }

  // Ensure they get credit for today's login logging
  await setDoc(doc(db, 'streak_logs', `${userId}_${todayStr}`), {
    status: 'active',
    date: todayStr,
    userId,
    timestamp: serverTimestamp()
  }, { merge: true });

  await updateDoc(userRef, updates);
};
