# SPRINT 5 EXECUTION PLAN: Gamification & Automation (Drive Retention)

## Overview
Phase 2 focuses on retaining our users by lowering the effort required to use the app (Automation) and forgiving inevitable human lapses (Gamification). We will introduce a forgiving streak economy, automate prayer times via geolocation, and add a premium haptic-driven interaction for spiritual reflection.

---

## Step 5.1: The "Grace Module" (Streak Freeze Economy)

**Goal:**
Mitigate the "Abstinence Violation Effect" where a user abandons the app after a single missed day ruins a long streak. Implement a "Streak Freeze" system where users can purchase or earn grace modules using their accrued Mizan Points.

**Files Affected:**
- `src/types.ts` (Update `UserProfile` to include `streakFreezes` balance)
- `src/components/rewards/RewardsScreen.tsx` (Add purchase UI)
- `src/services/streakService.ts` (New/Modify) or Firebase Cloud Function (if server-side CRON)
- `src/contexts/FirebaseContext.tsx` or `useUserData` hook (Expose freeze balance)

**Logic / Dependencies:**
1. **Data Model:** Add `streakFreezes: number` to the user document in Firestore.
2. **Economy:** Create a UI component in the Rewards section allowing users to exchange Mizan Points (e.g., 2000 pts) for 1 Streak Freeze.
3. **Application Logic:** During the daily midnight CRON or local client-side startup check: If a user failed to complete their core daily tasks *and* has `streakFreezes > 0`, do NOT reset the streak to 0. Instead, deduct 1 Streak Freeze, keep the streak integer the same, and append a "frozen" status to that specific day's log.

---

## Step 5.2: Geo-Aware Spiritual Triggers (Athan Integration)

**Goal:**
Remove the friction of manual configuration for prayer times. Dynamically calculate exact prayer windows utilizing device geolocation and an offline calculation library, making the app highly contextual.

**Files Affected:**
- `package.json` (Install `adhan` library)
- `src/services/prayerService.ts` (Refactor to use live coordinates)
- `src/features/deen/components/SalatTracker.tsx` (Add permission prompt)
- `src/components/auth/Onboarding.tsx` (Optional: request location early)

**Logic / Dependencies:**
1. **Library:** Utilize `adhan.js` (or similar) for offline, on-device calculation (fast, no external API latency).
2. **Geolocation:** Use `navigator.geolocation.getCurrentPosition` to fetch coordinates. Handle permission denials gracefully by falling back to a default timezone/city or manual selection.
3. **Dynamic State:** Pass the Latitude, Longitude, and current Date into the `adhan.js` engine to generate precise `PrayerTimes`. Update the global or local state so the `SalatTracker` automatically highlights the "Current" prayer based on exact local time, eliminating manual schedule entry.

---

## Step 5.3: Haptic Vault (Hadith Micro-interactions)

**Goal:**
Elevate the daily Hadith reading from a passive scroll to an active, meaningful interaction. Implement a premium "Long-Press to Internalize" gesture that simulates haptic feedback and archives the reflection.

**Files Affected:**
- `src/features/deen/components/AdhkarSection.tsx` (or HadithCard)
- `src/components/vault/ReflectionsVault.tsx` (New)
- `src/services/firebase.ts` (Add vault collection logic)

**Logic / Dependencies:**
1. **Gesture Recognition:** Utilize Framer Motion's gestures or a custom touch event listener (`onTouchStart` / `onTouchEnd` with a `setTimeout`) to detect a long-press (e.g., 800ms).
2. **Haptic Feedback:** Trigger `navigator.vibrate([50, 50, 50])` upon successful long-press calculation to give the user physical confirmation.
3. **Animation & Storage:** Once the hold is complete, trigger a Framer Motion layout shift (e.g., the card shrinks slightly or glows gold) and write the Hadith payload to a new Firestore sub-collection: `users/{uid}/vault/`.
