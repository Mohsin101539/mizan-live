export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  tip: string;
}

export const EXERCISES: Record<string, Exercise> = {
  pushups: { id: 'pushups', name: 'Push-Ups', sets: 3, reps: '12', tip: 'Lower chest to near floor, elbows at 45°' },
  squats: { id: 'squats', name: 'Squats', sets: 3, reps: '15', tip: 'Sit back, knees behind toes, chest up' },
  plank: { id: 'plank', name: 'Plank', sets: 3, reps: '45s', tip: "Straight line head to heels, don't let hips drop" },
  glute_bridges: { id: 'glute_bridges', name: 'Glute Bridges', sets: 3, reps: '15', tip: 'Drive hips up and squeeze at the top' },
  crunches: { id: 'crunches', name: 'Crunches', sets: 3, reps: '15', tip: "Lift shoulder blades only, don't pull your neck" },
  lunges: { id: 'lunges', name: 'Lunges', sets: 3, reps: '12', tip: 'Step forward, lower back knee toward floor' },
  jumping_jacks: { id: 'jumping_jacks', name: 'Jumping Jacks', sets: 3, reps: '45s', tip: 'Arms fully extended overhead, land softly' },
  high_knees: { id: 'high_knees', name: 'High Knees', sets: 3, reps: '30s', tip: 'Drive knees to hip height, pump arms' },
  calf_raises: { id: 'calf_raises', name: 'Calf Raises', sets: 3, reps: '20', tip: 'Rise fully on toes, hold 1 second at top' },
  superman: { id: 'superman', name: 'Superman', sets: 3, reps: '30s', tip: 'Lift arms and legs simultaneously, squeeze glutes' },
  wall_sit: { id: 'wall_sit', name: 'Wall Sit', sets: 3, reps: '45s', tip: 'Back flat, thighs parallel to floor, hold' },
  diamond_pushups: { id: 'diamond_pushups', name: 'Diamond Push-Ups', sets: 3, reps: '8', tip: 'Thumbs and index fingers form a diamond' },
  pike_pushups: { id: 'pike_pushups', name: 'Pike Push-Ups', sets: 3, reps: '10', tip: 'Inverted V shape, lower head toward floor' },
  tricep_dips: { id: 'tricep_dips', name: 'Tricep Dips', sets: 3, reps: '12', tip: 'Use chair, back close to surface' },
  leg_raises: { id: 'leg_raises', name: 'Leg Raises', sets: 3, reps: '12', tip: 'Lower back pressed into floor throughout' },
  russian_twists: { id: 'russian_twists', name: 'Russian Twists', sets: 3, reps: '20', tip: 'Rotate torso, keep feet off the floor' },
  mountain_climbers: { id: 'mountain_climbers', name: 'Mountain Climbers', sets: 3, reps: '30s', tip: 'Drive knees to chest, maintain plank' },
  jump_squats: { id: 'jump_squats', name: 'Jump Squats', sets: 3, reps: '10', tip: 'Squat to 90°, explode up, land softly' },
  burpees: { id: 'burpees', name: 'Burpees', sets: 3, reps: '8', tip: 'Squat, jump back to plank, jump up with arms overhead' },
  childs_pose: { id: 'childs_pose', name: "Child's Pose", sets: 1, reps: '60s', tip: 'Kneel, sit back, extend arms, breathe deeply' }
};

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  schedule: Record<number, string[]>; // 0 (Sun) to 6 (Sat)
  banner?: string;
}

export const WORKOUT_PLANS: Record<string, WorkoutPlan> = {
  beginner: {
    id: 'beginner',
    name: 'Beginner',
    description: '3 days/week, no equipment',
    schedule: {
      1: ['pushups', 'squats', 'plank', 'glute_bridges', 'crunches'], // Mon
      3: ['jumping_jacks', 'lunges', 'calf_raises', 'superman', 'crunches'], // Wed
      5: ['high_knees', 'pushups', 'wall_sit', 'glute_bridges', 'plank'] // Fri
    }
  },
  intermediate: {
    id: 'intermediate',
    name: 'Intermediate',
    description: '5 days/week',
    schedule: {
      1: ['pushups', 'diamond_pushups', 'pike_pushups', 'tricep_dips', 'superman'], // Upper
      2: ['squats', 'lunges', 'jump_squats', 'glute_bridges', 'calf_raises'], // Lower
      3: ['plank', 'crunches', 'leg_raises', 'mountain_climbers', 'burpees'], // Core
      5: ['jumping_jacks', 'high_knees', 'burpees', 'squats', 'pushups'] // Full
    }
  },
  sunnah: {
    id: 'sunnah',
    name: 'Sunnah Fitness',
    description: 'walking-focused, gentle',
    banner: 'The Prophet ﷺ encouraged walking. This plan honors that tradition.',
    schedule: {
      1: ['squats', 'plank', 'crunches'], // Mon (plus Walk 20 min)
      3: ['pushups', 'glute_bridges', 'superman'], // Wed (plus Walk 20 min)
      5: ['lunges', 'plank'] // Fri (plus Walk 20 min)
    }
  }
};
