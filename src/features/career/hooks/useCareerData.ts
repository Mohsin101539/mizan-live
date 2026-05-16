import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useFirebase } from '../../../FirebaseContext';

export interface Goal { id: string; title: string; isCompleted: boolean; [key: string]: any; }
export interface SubGoal { id: string; goalId: string; title: string; isCompleted: boolean; [key: string]: any; }
export interface Task { id: string; subGoalId: string; title: string; isCompleted: boolean; [key: string]: any; }

export const useCareerData = () => {
  const { user } = useFirebase();

  const goalsQuery = useQuery({
    queryKey: ['career', 'goals', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(collection(db, 'goals'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Goal));
    },
    enabled: !!user,
  });

  const subgoalsQuery = useQuery({
    queryKey: ['career', 'subgoals', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(collection(db, 'subgoals'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubGoal));
    },
    enabled: !!user,
  });

  const tasksQuery = useQuery({
    queryKey: ['career', 'tasks', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
    },
    enabled: !!user,
  });

  return {
    goals: goalsQuery.data || [],
    subGoals: subgoalsQuery.data || [],
    tasks: tasksQuery.data || [],
    loading: goalsQuery.isLoading || subgoalsQuery.isLoading || tasksQuery.isLoading,
    refetchGoals: goalsQuery.refetch,
    refetchSubGoals: subgoalsQuery.refetch,
    refetchTasks: tasksQuery.refetch,
  };
};
