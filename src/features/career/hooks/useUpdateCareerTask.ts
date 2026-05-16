import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db, handleFirestoreError, OperationType } from '../../../services/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../../../FirebaseContext';
import { MIZAN_POINTS } from '../../../constants/points';
import confetti from 'canvas-confetti';
import { Task, Goal, SubGoal } from './useCareerData';

export const useUpdateCareerTask = () => {
  const { user } = useFirebase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id, current }: { type: 'goals' | 'subgoals' | 'tasks'; id: string; current: boolean }) => {
      if (!user) throw new Error('User not logged in');

      const pointsMap = {
        goals: 500,
        subgoals: 100,
        tasks: MIZAN_POINTS.CAREER_TASK
      };
      const points = pointsMap[type];

      try {
        await updateDoc(doc(db, type, id), { isCompleted: !current });
        if (!current) {
          await updateDoc(doc(db, 'users', user.uid), { 
            points: increment(points),
            lastActive: serverTimestamp() 
          });
          confetti({ particleCount: Math.min(100, points / 5), spread: 70 });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `${type}/${id}`);
      }
    },
    onMutate: async ({ type, id, current }) => {
      if (!user) return;
      const queryKey = ['career', type, user.uid];

      // Cancel outgoing
      await queryClient.cancelQueries({ queryKey });

      // Snapshot
      const previousData = queryClient.getQueryData<any[]>(queryKey);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<any[]>(queryKey, previousData.map(item => 
          item.id === id ? { ...item, isCompleted: !current } : item
        ));
      }

      return { previousData, queryKey };
    },
    onError: (err, variables, context) => {
      console.error('Failed to update career item, rolling back', err);
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSettled: (data, error, variables) => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['career', variables.type, user.uid] });
      }
    },
  });
};
