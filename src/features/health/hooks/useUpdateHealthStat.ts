import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateHealthDaily, HealthDaily } from '../../../services/healthService';
import { useFirebase } from '../../../FirebaseContext';
import { format } from 'date-fns';

export const useUpdateHealthStat = () => {
  const { user } = useFirebase();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useMutation({
    mutationFn: async ({ updates, points }: { updates: Partial<HealthDaily>; points?: number }) => {
      if (!user) throw new Error('User not logged in');
      await updateHealthDaily(user.uid, today, updates, points || 0);
    },
    onMutate: async ({ updates, points }) => {
      if (!user) return;
      const queryKey = ['healthDaily', user.uid, today];

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous
      const previousData = queryClient.getQueryData<HealthDaily>(queryKey);

      // Optimistically update
      if (previousData) {
        const newData = { ...previousData, ...updates };
        if (points && points > 0) {
          newData.points_today = (newData.points_today || 0) + points;
        }
        queryClient.setQueryData<HealthDaily>(queryKey, newData);
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      console.error('Failed to update health stat, rolling back', err);
      if (user && context?.previousData) {
        queryClient.setQueryData(['healthDaily', user.uid, today], context.previousData);
      }
    },
    onSettled: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['healthDaily', user.uid, today] });
      }
    },
  });
};
