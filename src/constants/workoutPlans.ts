import { WorkoutPlan } from '../types';
import { EXERCISE_LIBRARY } from './exercises';

export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'beginner',
    name: 'MIZAN Beginner',
    description: 'No equipment · 3 days/week · Perfect to start',
    daysPerWeek: 3,
    schedule: [
      { dayOfWeek: 0, isRestDay: true, workoutName: 'Rest Day', exercises: [] },
      { dayOfWeek: 1, isRestDay: false, workoutName: 'Upper Body',
        exercises: ['push-ups','pike-push-ups','tricep-dips','superman-hold','plank']
          .map(id => EXERCISE_LIBRARY.find(e => e.id === id)!) },
      { dayOfWeek: 2, isRestDay: true, workoutName: 'Rest Day', exercises: [] },
      { dayOfWeek: 3, isRestDay: false, workoutName: 'Lower Body + Core',
        exercises: ['squats','lunges','glute-bridges','calf-raises','crunches']
          .map(id => EXERCISE_LIBRARY.find(e => e.id === id)!) },
      { dayOfWeek: 4, isRestDay: true, workoutName: 'Rest Day', exercises: [] },
      { dayOfWeek: 5, isRestDay: false, workoutName: 'Full Body Circuit',
        exercises: ['jumping-jacks','burpees','mountain-climbers','high-knees','wall-sit','plank']
          .map(id => EXERCISE_LIBRARY.find(e => e.id === id)!) },
      { dayOfWeek: 6, isRestDay: true, workoutName: 'Active Recovery', exercises: [] },
    ]
  },
  {
    id: 'intermediate',
    name: 'MIZAN Intermediate',
    description: 'No equipment · 5 days/week · Push your limits',
    daysPerWeek: 5,
    schedule: [
      { dayOfWeek: 0, isRestDay: true, workoutName: 'Rest Day', exercises: [] },
      { dayOfWeek: 1, isRestDay: false, workoutName: 'Upper Body Strength',
        exercises: ['push-ups','diamond-push-ups','pike-push-ups','tricep-dips','superman-hold']
          .map(id => EXERCISE_LIBRARY.find(e => e.id === id)!) },
      { dayOfWeek: 2, isRestDay: false, workoutName: 'Lower Body Power',
        exercises: ['squats','jump-squats','lunges','glute-bridges','calf-raises']
          .map(id => EXERCISE_LIBRARY.find(e => e.id === id)!) },
      { dayOfWeek: 3, isRestDay: false, workoutName: 'Core & Cardio',
        exercises: ['plank','crunches','leg-raises','russian-twists','mountain-climbers']
          .map(id => EXERCISE_LIBRARY.find(e => e.id === id)!) },
      { dayOfWeek: 4, isRestDay: true, workoutName: 'Rest Day', exercises: [] },
      { dayOfWeek: 5, isRestDay: false, workoutName: 'Full Body Burn',
        exercises: ['burpees','high-knees','jumping-jacks','jump-squats','mountain-climbers','plank']
          .map(id => EXERCISE_LIBRARY.find(e => e.id === id)!) },
      { dayOfWeek: 6, isRestDay: false, workoutName: 'Active Recovery',
        exercises: ['childs-pose']
          .map(id => EXERCISE_LIBRARY.find(e => e.id === id)!) },
    ]
  },
  {
    id: 'sunnah',
    name: 'Sunnah Fitness',
    description: 'Walking-based · Gentle · Prophetic tradition',
    daysPerWeek: 3,
    schedule: [
      { dayOfWeek: 0, isRestDay: true, workoutName: 'Rest Day', exercises: [] },
      { dayOfWeek: 1, isRestDay: false, workoutName: 'Walk + Core',
        exercises: ['squats','plank','crunches','glute-bridges']
          .map(id => EXERCISE_LIBRARY.find(e => e.id === id)!) },
      { dayOfWeek: 2, isRestDay: true, workoutName: 'Rest Day', exercises: [] },
      { dayOfWeek: 3, isRestDay: false, workoutName: 'Walk + Upper Body',
        exercises: ['push-ups','superman-hold','tricep-dips']
          .map(id => EXERCISE_LIBRARY.find(e => e.id === id)!) },
      { dayOfWeek: 4, isRestDay: true, workoutName: 'Rest Day', exercises: [] },
      { dayOfWeek: 5, isRestDay: false, workoutName: 'Walk + Full Body',
        exercises: ['lunges','squats','wall-sit','childs-pose']
          .map(id => EXERCISE_LIBRARY.find(e => e.id === id)!) },
      { dayOfWeek: 6, isRestDay: true, workoutName: 'Rest Day', exercises: [] },
    ]
  }
];
