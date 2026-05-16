# EXERCISE MODULE V2 BLUEPRINT

## 1. Competitive UX Benchmarking & Core Philosophy

### Benchmarking Insights
- **Hevy:** Excels at data density without feeling cluttered. It uses a spreadsheet-like grid for sets/reps that is satisfying to tap through.
- **Apple Fitness:** Masters the "glanceable" UI. Massive, bold typography, glowing rings, and stark black backgrounds make the active workout state unmistakable.
- **Nike Training Club:** Shines in its guided experience. Fluid transitions between exercises, clear video/audio cues, and a strong sense of pacing.

### Core Philosophy: "Progressive Disclosure & Fluidity"
The overarching goal is to minimize friction while maximizing capability.
- **The Casual User:** Needs a "One-Tap Start." For a quick "15-minute walk" or "Quick Run," the UI should be immediately accessible from the dashboard without entering a deep builder flow.
- **The Power User:** Needs a "Deep Canvas." Building a "Custom Push-Day Routine" requires drag-and-drop reordering, superset grouping, and granular set/rep tracking.

**Micro-interactions (The "Premium Feel"):**
- **Haptic Feedback (Simulated via visuals):** Buttons that compress on press (`scale: 0.95`).
- **Layout Animations:** Exercises smoothly gliding into place when added or removed, rather than instantly snapping.
- **Satisfying Completion:** Fulfilling a set or completing a workout should trigger rewarding visual feedback (e.g., subtle confetti, color bursts).

## 2. The "Smart Timer" & Interactive Session UI

### The Problem
Static, rigid timers cause anxiety or frustration when real-life interruptions occur. If a user needs 10 more seconds to finish a rep, the timer shouldn't cut them off abruptly.

### The Solution: "Dynamic Workout Player"
The Active Session UI should feel like a media player (like Spotify's now-playing screen) rather than a rigid stopwatch.

**UX Flow & Visuals:**
- **The Countdown:** A massive, bold, monospaced typography (e.g., `JetBrains Mono`) for the time.
- **The Progress Ring:** A glowing, smoothly animated SVG circle stroke that depletes or fills as time passes.
- **Controls at the Thumb:** Large, easily tappable buttons at the bottom of the screen (Play/Pause, Skip to Next, End Workout).

**Flexibility & Error Recovery:**
- **On-the-Fly Adjustments:** Quick tap buttons to add `+30s` or `-10s` directly beside the timer.
- **Auto-Pause & Background Resilence:** If the app is backgrounded, the timer must sync accurately via timestamps when reopened.
- **Manual Override:** If the user forgot to start the timer, a simple "Edit Duration" input at the summary screen allows them to log the correct time before saving.

## 3. The Custom Exercise Engine (Data & Component Architecture)

### Customization Flow (Creating an Exercise)
1.  **Tap "Add Custom Exercise"** inside the library view.
2.  **Input Form (Bottom Sheet/Modal):**
    -   *Name:* (e.g., "Bulgarian Split Squats")
    -   *Category:* Selector pill buttons (Cardio, Strength, Flexibility, Mobility).
    -   *Tracking Type:* Reps & Weight, Duration, or Bodyweight.
    -   *Default Settings:* (Optional) Sets, Reps, Time.
3.  **Haptic/Visual Validation:** The sheet slides down, and the new exercise animates into the top of the library list.

### Component Structure
-   `HealthScreen.tsx` (Entry point, renders Quick Actions & saved routines)
    -   `RoutineBuilder_v2.tsx` (The deep canvas for creating routines)
        -   `ExerciseDraggableList.tsx` (Framer Motion `Reorder.Group`)
        -   `ExerciseLibraryModal.tsx` (Searchable database of predefined and custom exercises)
    -   `ActiveSessionPlayer.tsx` (The "Now Playing" workout screen)
        -   `SmartTimerRing.tsx` (The glowing SVG component)
        -   `SetTrackerRow.tsx` (For logging reps/weight dynamically)
    -   `WorkoutSummary.tsx` (Post-workout form with manual time override)

### Framer Motion Integration
-   **AnimatePresence:** Used on all Modals and Bottom Sheets for smooth entry (`y: 100%` to `y: 0`) and exit.
-   **Layout Animations (`layout` prop):** Used on Exercise cards within a routine. When an exercise is deleted, the remaining list gracefully slides up.
-   **Reorder.Group:** For drag-and-drop reordering of exercises within a routine.

## 4. Scalable Firestore Schema

To support offline access and complex queries, we will use a flattened, scalable structure within the user's document or as subcollections.

### `health_exercise_library` (Subcollection under `/users/{uid}/`)
Stores user-created exercises.
```typescript
{
  id: string; // Auto-generated
  name: string;
  category: "strength" | "cardio" | "flexibility" | "mobility";
  trackingType: "reps_weight" | "duration" | "bodyweight";
  defaultSets?: number;
  defaultReps?: number;
  defaultDurationSeconds?: number;
  createdAt: number; // Timestamp
}
```

### `health_routines` (Subcollection under `/users/{uid}/`)
Saved combinations of exercises.
```typescript
{
  id: string;
  name: string; // e.g., "Pull Day", "Morning Yoga"
  description: string;
  exercises: {
    exerciseId: string; // Ref to library or hardcoded ID
    customName?: string; // If renaming for this routine
    targetSets?: number;
    targetReps?: number;
    targetDurationSeconds?: number;
    restBetweenSetsSeconds?: number;
    order: number;
  }[];
  createdAt: number;
  lastPerformedAt?: number;
}
```

### `health_workout_logs` (Subcollection under `/users/{uid}/`)
The actual completed sessions, optimized for AI processing and history charting.
```typescript
{
  id: string;
  routineId?: string; // If it was based on a saved routine
  name: string; // Snapshot of routine name or custom name
  startTime: number; // Timestamp
  endTime: number; // Timestamp
  totalDurationSeconds: number; // Manually editable
  category: string; // Derived or primary category
  completedExercises: {
    exerciseId: string;
    name: string;
    metrics: { // Array for sets
      setNumber: number;
      reps?: number;
      weight?: number;
      durationSeconds?: number;
    }[];
  }[];
}
```
