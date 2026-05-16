import { useQuery } from '@tanstack/react-query';
import { useFirebase } from '../../../FirebaseContext';
import { getHealthDaily, createHealthDaily, HealthDaily } from '../../../services/healthService';
import { format } from 'date-fns';

export const useHealthDaily = () => {
  const { user } = useFirebase();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['healthDaily', user?.uid, today],
    queryFn: async () => {
      if (!user) return null;
      let data = await getHealthDaily(user.uid, today);
      if (!data) {
        data = await createHealthDaily(user.uid, today);
      }
      return data;
    },
    enabled: !!user,
  });
};
