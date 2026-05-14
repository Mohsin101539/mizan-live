import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, loginWithGoogle, handleFirestoreError, OperationType } from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          // Sync profile
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            const newProfile = {
              name: user.displayName || 'Traveler',
              email: user.email,
              createdAt: serverTimestamp(),
              points: 0,
              level: 1,
              streak: 0,
              onboardingComplete: false
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(userDoc.data());
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Firebase profile sync error:', error);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const signIn = async () => {
    await loginWithGoogle();
  };

  const signOut = () => auth.signOut();

  return (
    <FirebaseContext.Provider value={{ user, profile, loading, signIn, signOut }}>
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
