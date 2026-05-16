# Technical Execution Blueprint

*Prepared by: Principal Frontend Architect & Technical Project Manager*

This document outlines the strategic and technical execution plan for elevating the application's architecture, localization, and user experience. 

---

## Sprint 1: Deep i18n Localization & Typography

### Step 1.1: Standardized i18n Key Management & Types
*   **The Goal:** Eliminate hardcoded strings and migrate to a strictly typed, deeply nested localization schema for both `bn` (Bangla) and `en` (English), ensuring no fallback leakage.
*   **Files Affected:**
    *   `src/i18n.ts`
    *   `src/types/i18n.d.ts` (New)
    *   `src/locales/en.json`, `src/locales/bn.json`
*   **The Logic/Dependencies:** 
    *   Install/Configure: `i18next`, `react-i18next`, `i18next-browser-languagedetector`.
    *   Logic: Map out namespaces (e.g., `common`, `auth`, `pillars`, `hadith`). Create TypeScript definitions inferred from the English JSON to catch missing keys at compile time.

### Step 1.2: Premium Typography & Font Hierarchy
*   **The Goal:** Implement a multi-font design system that pairs premium Latin fonts (e.g., *Inter* or *Outfit*) with legible and elegant Bengali (e.g., *Hind Siliguri* or *Noto Sans Bengali*) and classical Arabic fonts (e.g., *Amiri* or *KFGQPC Uthmanic Script*).
*   **Files Affected:**
    *   `src/index.css`
    *   `tailwind.config.ts` (or Vite config equivalent)
    *   `src/components/ui/` (base text components)
*   **The Logic/Dependencies:**
    *   Dependencies: `@fontsource` packages or Google Fonts configurations.
    *   Logic: Define specific CSS variables for `--font-arabic`, `--font-bangla`, and `--font-sans`. Update Tailwind configuration to inject these custom font families seamlessly.

### Step 1.3: RTL & Arabic Alignment Adjustments
*   **The Goal:** Programmatically control layout directions, ensuring Arabic text (Adhkar, Hadith) is correctly formatted (RTL, centered or justified based on content length) without breaking the primary UI container boundaries.
*   **Files Affected:**
    *   `src/components/deen/AdhkarSection.tsx`
    *   `src/components/deen/PrayerSummary.tsx`
*   **The Logic/Dependencies:**
    *   Logic: Create a custom `<ArabicText>` wrapper component that automatically assigns the `dir="rtl"` attribute and applies the correct typography scaling, line-height (leading-loose), and layout constraints based on device sizes.

---

## Sprint 2: Domain-Driven Folder Restructure

### Step 2.1: Dismantling Monolithic App.tsx (Routing & Layouts)
*   **The Goal:** Break down the bloated `App.tsx` file by introducing dedicated routing and abstracting layouts. This isolates the concerns of the Dashboard, Onboarding, and distinct Pillar views.
*   **Files Affected:**
    *   `src/App.tsx`
    *   `src/routes/` (New directory)
    *   `src/layouts/MainLayout.tsx` (New)
    *   `src/layouts/AuthLayout.tsx` (New)
*   **The Logic/Dependencies:**
    *   Dependencies: `react-router` (or `react-router-dom`).
    *   Logic: Establish a Router provider. Abstract the BottomNav and Header into `MainLayout.tsx`. Map individual screens (HomeScreen, HealthScreen, DeenScreen) to distinct route paths instead of relying entirely on conditional rendering.

### Step 2.2: Isolating Domain Modules (Feature Slices)
*   **The Goal:** Migrate from a flat component structure to a feature-sliced design (Domain-Driven Design). Each pillar (Deen, Career, Health) should encapsulate its own components, hooks, and localized Firebase logic.
*   **Files Affected:**
    *   `src/features/deen/` (Migrated from `src/components/deen/`)
    *   `src/features/career/` (Migrated from `src/components/career/`)
    *   `src/features/health/` (Migrated from `src/components/health/`)
    *   `src/services/firebase.ts`
*   **The Logic/Dependencies:**
    *   Logic: Group files by feature rather than type. A feature folder will contain its own components, specific types, and API hooks (e.g., `useDeenStats.ts`). Deprecate generic service files in favor of domain-specific data access objects.

---

## Sprint 3: Optimistic UI & Firestore Syncing

### Step 3.1: Global Server-State Management Setup
*   **The Goal:** Replace manual `useEffect` fetching and local `useState` synchronization with an enterprise-grade async state manager to handle data fetching, caching, and background syncing.
*   **Files Affected:**
    *   `src/main.tsx`
    *   `src/lib/queryClient.ts` (New)
*   **The Logic/Dependencies:**
    *   Dependencies: `@tanstack/react-query` (React Query).
    *   Logic: Initialize the `QueryClient` with default stale times and retry logic. Wrap the application root in the Provider.

### Step 3.2: Implementing Optimistic Mutators
*   **The Goal:** Ensure user interactions (like checking off a prayer or claiming a reward) feel instant, updating the UI before the Firestore network request completes.
*   **Files Affected:**
    *   `src/features/deen/hooks/useUpdatePrayer.ts` (New)
    *   `src/features/health/hooks/useUpdateHealthStat.ts` (New)
*   **The Logic/Dependencies:**
    *   Logic: Map out the React Query `useMutation` hook. 
        1. On `onMutate`: Snapshot the previous data, then aggressively update the local cache with the newly predicted state.
        2. On `onError`: Roll back the cache to the snapshot.
        3. On `onSettled`: Invalidate queries to forcefully re-sync authoritative data from Firestore in the background.

### Step 3.3: Bulletproofing the Offline Firebase Capabilities
*   **The Goal:** Handle network disruption gracefully, leveraging Firestore's offline persistence combined with our optimistic UI layer so the user can continue logging habits offline without data loss.
*   **Files Affected:**
    *   `src/FirebaseContext.tsx`
    *   `src/services/firebase.ts`
*   **The Logic/Dependencies:**
    *   Logic: Ensure `enableIndexedDbPersistence` or standard offline capabilities are explicitly activated on the Firestore instance wrapper. Set up listeners to display a subtle UI indicator when writes are queued locally.
