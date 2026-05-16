# PROJECT_CONTEXT_HANDOFF

## 1. App Vision & Core Product Strategy

**Mizan** is a holistic life-tracking application meticulously designed to balance three critical pillars of a fulfilling life: **Deen (Faith)**, **Health**, and **Career**. It serves as an integrated companion for users striving for holistic growth, connecting spiritual habits with physical vitality and professional accountability.

**Target Psychological Feel:**
- **Premium:** Mizan eschews generic templates for a distinctive, polished aesthetic. It employs a cohesive, earthy color palette (deep forest greens, warm golds, and cream backgrounds) paired with elegant typography (Playfair Display for editorial headings, Inter for clean UI, and JetBrains Mono for technical/data displays).
- **Offline-First:** Core to the Mizan experience is a sense of instantaneous feedback. Utilizing an optimistic UI model powered by Firebase's persistent local cache, the app eradicates loading spinners, delivering a fluid, uninterrupted experience regardless of network conditions.
- **Haptic-Driven:** The interaction design encourages tactile engagement. From micro-interactions such as holding down a button to save a hadith, to buttons that physically compress on press (`scale: 0.95`), and smooth layout transitions via Framer Motion, it establishes a visceral connection between the user and their progress.

## 2. Complete Feature Inventory (The MVP State)

The Minimum Viable Product (MVP) encompasses functional systems across all three pillars, featuring several custom mechanics:

- **The "Grace Module" (Streak Freezes & Mizan Points economy):** Instead of a rigid, punishing streak system, Mizan introduces a forgiving economy. Users earn "Mizan Points" through consistent habits across all domains. These points can be spent to purchase "Streak Freezes," allowing users to maintain their streaks during genuine rest days or missed logs, emphasizing consistency over perfection.
- **The "Haptic Vault" (Long-press to save Hadith):** A tactile reflection system. Users can interact with daily Hadith or Quranic insights by long-pressing an insight card. This micro-interaction triggers haptic-style visual feedback and instantly saves the content into a personal, encrypted "Vault" for future reflection.
- **Geo-Aware Athan Integration:** The Deen pillar calculates and displays daily prayer times offline. It leverages local, device-based calculations based on the user's coordinates. If geolocation fails, is denied, or the device is offline, it utilizes a reliable fallback coordinate (e.g., Dhaka) to ensure the user always has access to times.
- **Cross-Pillar AI Insights:** The application employs a local correlation engine (with synthesized data via Gemini) synthesizing cross-domain behavior to generate personalized daily insights (e.g., correlating sleep debt logged in the Health pillar with difficulty waking up for Fajr logged in the Deen pillar), providing actionable wisdom rather than raw data.
- **Accountability Circles:** A social layer for shared accountability. Users can form groups using secure, unique 6-character short-codes. Circles feature a shared Mizan Scoreboard where friends can gently compete or keep each other on track. Strict Firestore rules govern these groups (e.g., ensuring users can only edit their own scores while reading aggregates).
- **Wearable Mock Integration:** A forward-looking, simulated interface modeling future smart-device integrations (like Apple Watch or Garmin rings). It populates the health dashboard with simulated step counts, heart rate averages, and sleep data patterns to validate the UI architecture before hardware APIs are connected.

## 3. System Architecture & Tech Stack

- **Framework & Build:** React 18+ orchestrated with Vite. TypeScript is strictly used for end-to-end type safety and domain modeling.
- **Styling, UI, & Animation:** Tailwind CSS provides utility-first styling. Framer Motion (imported as `motion/react`) powers layout animations, drag-and-drop mechanics, and micro-interactions (like `AnimatePresence` for modals and dynamic layout shifts). Recharts is utilized for charting data.
- **State Management & Data Fetching:** A combination of native React state patterns and React Query (for isolated async state) operating alongside a custom `FirebaseProvider` context.
- **Backend & Database:** Firebase v9+ Modular SDK. Firebase Authentication (Google Sign-In) handles identity. Firestore serves as the NoSQL document database.
- **Optimistic UI & Offline-First Strategy:** The app heavily relies on Firestore's `persistentMultipleTabManager` and local caching strategies. By utilizing snapshot listeners (`onSnapshot`) tied to the local cache, user inputs instantly reflect on the screen without waiting for network validation (eradicating loading spinners), while Firebase silently handles the background synchronization to the cloud.

## 4. Directory Structure & File Manifest

```text
/src
├── components/          # Domain-specific UI components
│   ├── layout/          # App Layouts, Sidebar, Navigation wrappers
│   ├── dashboard/       # Holistic dashboard, AI Insights, Daily Activity Feed
│   ├── deen/            # Salat forms, Adhkar logs, Athan times
│   ├── health/          # Smart Workout builder, dynamic timer session, water/wearable mocks
│   ├── career/          # Goaling systems, Focus Timer, task lists
│   ├── social/          # Accountability Circles, leaderboards, join codes
│   ├── ui/              # Reusable atomic baseline UI elements (buttons, inputs)
├── services/            # Backend integration, global business logic
│   ├── firebase.ts      # Core Firebase init & offline persistence setup
│   ├── socialService.ts # Accountability Circle operations (create, join, leave)
│   ├── aiService.ts     # Gemini API Prompts and data synthesis formatting
├── types/               # Global TypeScript Interfaces
├── constants/           # Shared static values, global enums
├── lib/                 # Utility functions (e.g., classname merging / tailwind twMerge)
├── FirebaseContext.tsx  # Centralized React Context providing db/auth connections
├── App.tsx              # Main Routing, Layout wrapping, and Route Protection logic
├── index.css            # Tailwind directives and core design token CSS variables
└── main.tsx             # Standard entry point and root rendering
```

**Critical Files Purpose:**
*   `src/types.ts`: Provides the strict TS interfaces representing our NoSQL schemas. Ensures domain integrity across independent modules.
*   `src/App.tsx`: Manages the overall routing orchestration. It acts as the gatekeeper, verifying authentication states before transitioning users from the landing page to the main isolated pillar dashboards.
*   `src/features/`: Ensures domain isolation by encapsulating complex logic, reducers, and hooks outside of raw UI components.
*   `src/services/firebase.ts`: The lifeblood of the offline-first capability. It bootstraps Firebase, initializes the local cache persistence, and wraps operations to provide standardized error handling and offline robustness.

## 5. Database Schema & State Management

**Firestore Blueprint Overview:**

Following a strict access control paradigm, each data segment is isolated into carefully guarded collections, with a heavy emphasis on subcollections to scope access:

*   `users/{userId}`: Root document for the user profile storing points, streak, Grace Module freezes, and generic metadata. **Rules:** `isOwner(userId)` strictly enforced.
*   `users/{userId}/vault/{id}`: Subcollection for the **Haptic Vault** storing saved insights and Hadith. **Rules:** Read/write locked exclusively to the owner.
*   `groups/{groupId}`: The core **Accountability Circle** document housing the group name, unique short-code, and `adminUid`. **Rules:** Read-only for authenticated users; modifications restricted to the admin.
*   `groups/{groupId}/members/{userId}`: Subcollection mapping individuals to a group, mirroring their cached points and active streaks. **Rules:** Members can read the entire subcollection to render aggregate scoreboard UI, but a member can only mutate their specific user document.
*   `salat_logs`, `health_daily`, `goals`: Flat collections queried via `where("userId", "==", auth.uid)`. **Rules:** Fully isolated; all CRUD operations are restricted to `request.auth.uid`.

**Strict Security & Constraints:**
Firestore rules govern these access pathways (e.g., Vault logs are `isOwner` locked, while Group members can strictly read aggregate score summaries). List queries enforce schema boundaries, type validations, and identity correlation directly inside the rules engine.

## 6. The User Flow

This captures the typical step-by-step user journey, emphasizing fluidity and instantaneous feedback:

1.  **Authentication & Boot (Dashboard):** The user launches the app and authenticates smoothly via Google Sign-In. Thanks to the offline-first architecture, the application instantly pulls local cache data, dropping the user immediately into the Dashboard. They view their current Streak and Mizan Points.
2.  **Checking Rewards & AI Insights:** The user reads a personalized Cross-Pillar AI Insight synthesis (e.g., "You missed Fajr today but crushed your focus timer; prioritize sleep tonight via the Health tab").
3.  **Logging a Habit:** The user navigates to a specific pillar. In the Health tab, they might launch a workout or log water. In the Deen tab, they mark prayers as completed.
4.  **Triggering an Animation (Optimistic UI):** When the user taps a completion button, there is zero latency. The button haptically depresses, state updates immediately, and milestone completions trigger gratifying animations (like confetti bursts). Firebase flawlessly handles network syncing invisibly in the background.
5.  **Social Validation & The Vault:** The user switches to the Social tab to view their Accountability Circle. The UI seamlessly pulls the group subcollection and updates the leaderboard. Later, if they discover a profound reflection, they perform a long-press on the insight card—triggering the Haptic Vault animation to instantly save the memory to their collection.
