import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db, handleFirestoreError, OperationType } from '../../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../../../FirebaseContext';

export const useUpdatePrayer = () => {
  const { user } = useFirebase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prayerName: string) => {
      if (!user) throw new Error('User not logged in');

      try {
        await addDoc(collection(db, 'salat_logs'), {
          userId: user.uid,
          prayerName,
          date: new Date().toISOString().split('T')[0],
          points: 30,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'salat_logs');
      }
    },
    onMutate: async (prayerName: string) => {
      if (!user) return;

      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['salatLogs', user.uid] });

      // Snapshot the previous value
      const previousPrayers = queryClient.getQueryData<string[]>(['salatLogs', user.uid]);

      // Optimistically update to the new value
      if (previousPrayers && !previousPrayers.includes(prayerName)) {
        queryClient.setQueryData<string[]>(['salatLogs', user.uid], [...previousPrayers, prayerName]);
      }

      // Return a context object with the snapshotted value
      return { previousPrayers };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newPrayer, context) => {
      console.error('Mutation failed, rolling back', err);
      if (user && context?.previousPrayers) {
        queryClient.setQueryData(['salatLogs', user.uid], context.previousPrayers);
      }
    },
    // Always refetch after error or success to synchronize with the server
    onSettled: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['salatLogs', user.uid] });
      }
    },
  });
};
