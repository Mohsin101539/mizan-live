import { useQuery } from '@tanstack/react-query';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirebase } from '../../../FirebaseContext';

export const useDeenStats = () => {
  const { user } = useFirebase();

  const fetchLogs = async () => {
    if (!user) return [];
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'salat_logs'),
      where('userId', '==', user.uid),
      where('date', '==', today)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().prayerName as string);
  };

  const { data: donePrayers = [], isLoading: loading, error } = useQuery({
    queryKey: ['salatLogs', user?.uid],
    queryFn: fetchLogs,
    enabled: !!user,
  });

  return { 
    donePrayers, 
    loading, 
    error: error ? error.message : null 
  };
};
