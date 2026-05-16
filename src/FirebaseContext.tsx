import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, loginWithGoogle, handleFirestoreError, OperationType } from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import i18n from './i18n';

import { checkAndMaintainStreak } from './services/streakService';

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: any | null;
  loading: boolean;
  isDeleting: boolean;
  isOffline: boolean;
  setIsDeleting: (val: boolean) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
      
      if (!authenticatedUser) {
        setIsDeleting(false); // Reset on logout
      }

      if (authenticatedUser) {
        checkAndMaintainStreak(authenticatedUser.uid).catch(console.error);
        const userRef = doc(db, 'users', authenticatedUser.uid);
        
        // Clean up previous profile listener if it exists
        if (unsubscribeProfile) unsubscribeProfile();

        // Use onSnapshot for real-time updates
        unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            if (data.language && data.language !== i18n.language) {
              i18n.changeLanguage(data.language);
            }
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${authenticatedUser.uid}`);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = undefined;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signIn = async () => {
    await loginWithGoogle();
  };

  const signOut = async () => {
    setIsDeleting(true);
    try {
      await auth.signOut();
    } catch (e) {
      console.error("Sign out failed:", e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, profile, loading, isDeleting, isOffline, setIsDeleting, signIn, signOut }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
