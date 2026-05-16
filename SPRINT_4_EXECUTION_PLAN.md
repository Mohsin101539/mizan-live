# SPRINT 4 EXECUTION PLAN: High Impact UI/UX Polish

## Overview
This sprint focuses on elevating the application's perceived quality, performance, and user psychology. We are moving from a functional foundation to a premium, polished experience by focusing on typography, layout animations, perceived performance (Optimistic UI), and actual performance (Code-Splitting).

---

## Step 4.1: Typography Scale & Optical Harmony

**Goal:** 
Implement optical baseline alignment and scale harmony across multiple languages (English, Bengali, Arabic). The app must feel like a premium digital journal. Arabic text requires different line heights and padding to avoid feeling cramped compared to geometric sans-serif fonts used for English/Bengali.

**Files Affected:**
- `src/index.css` (or `tailwind.config.ts`)
- `src/features/deen/components/AdhkarCard.tsx` (and other components heavily featuring Arabic)

**Logic / Dependencies:**
1. **Typography Variables:** Define specific CSS custom properties/Tailwind classes for Arabic typography (e.g., `font-arabic`, `text-3xl`, `leading-[1.8]`).
2. **Font Loading:** Ensure a premium traditional Naskh or Kufic font is imported for Arabic, while maintaining a primary geometric sans-serif (e.g., `font-sans` with Outfit or Inter) for English/Bengali.
3. **Optical Adjustments:** Create utility wrapper classes that adjust padding dynamically based on the current locale (e.g., adding extra `py-2` when the text is Arabic to compensate for deep ascenders and descenders).

---

## Step 4.2: Progressive Disclosure (Framer Motion)

**Goal:** 
Reduce cognitive load by dynamically hiding or deprioritizing completed tasks. As tasks (prayers, habits, career goals) are completed, they should physically animate to the bottom of the list, creating a satisfying "clearing the desk" psychological effect.

**Files Affected:**
- `src/features/deen/components/SalatTracker.tsx`
- `src/features/health/components/HealthTracker.tsx` (Pending refactor)
- `src/features/career/components/TaskBoard.tsx` (Pending refactor)

**Logic / Dependencies:**
1. **Motion Setup:** Utilize `framer-motion` (or `motion/react`) `<AnimatePresence>` and `<motion.li>` / `<motion.div>` for list items.
2. **Sorting Logic:** Modify the rendering arrays to sort items: `incomplete` items first, `completed` items at the bottom. 
3. **Animation Configuration:** Apply a `layout` prop to the motion components so when their position in the DOM changes (due to the sort), they smoothly glide to their new position rather than snapping. Provide subtle `initial`, `animate`, and `exit` states for smooth staggered entrances.

---

## Step 4.3: Optimistic UI Rollout (Career & Health)

**Goal:** 
Scale the successful `useUpdatePrayer` optimistic mutation pattern to the rest of the application domains. Strip out blocking loading states (`Loader2`) for core actions, allowing the UI to react instantly while syncing to Firebase in the background.

**Files Affected:**
- `src/features/career/hooks/useUpdateCareerTask.ts` (New)
- `src/features/health/hooks/useUpdateHealthStat.ts` (New)
- `src/features/career/components/CareerTracker.tsx`
- `src/features/health/components/HealthTracker.tsx`

**Logic / Dependencies:**
1. **useUpdateCareerTask:** Map out the `useMutation` hook. Cancel outgoing refetches for career queries, snapshot previous tasks, optimistically append/update the task in the cache, and revert `onError`.
2. **useUpdateHealthStat:** Similar mapping for health metrics (e.g., checking off hydration, sleep). Update local query cache immediately on interaction.
3. **Component Refactoring:** Remove local `isLoading` tracking for these interactions. Bind the interactive elements directly to the `mutate` function, relying entirely on the visual feedback of Step 4.2 (layout shifts) and avoiding spinners.

---

## Step 4.4: Aggressive Code-Splitting

**Goal:** 
Ensure that parsing heavy libraries or specific charts required by the Career or Health pillars doesn't block the initial load when a user is only interacting with the Deen pillar.

**Files Affected:**
- `src/App.tsx` (or primary routing file)

**Logic / Dependencies:**
1. **Lazy Loading:** Replace standard static imports for the main pillar screens with `React.lazy()` (e.g., `const DeenScreen = React.lazy(() => import('@/features/deen/components/DeenScreen'))`).
2. **Suspense Boundaries:** Wrap the nested routes or pillar components inside a `<Suspense>` component.
3. **Fallback UI:** Provide a highly polished, branded loading skeleton or minimal spinner as the `fallback` for the Suspense boundary so perceived performance remains high during the micro-delay of fetching the chunked bundle.
