# SPRINT 6 EXECUTION PLAN: Advanced Automation & Analytics (The Flywheel)

## Overview
Phase 3 (Sprint 6) focuses on "The Flywheel" — automating data entry through wearables, providing cross-pillar insights to drive behavioral change, and introducing social accountability circles to maintain long-term engagement.

---

## Step 6.1: Wearable Ecosystem Integration (Health Automation)

**Goal:**
Remove the friction of manual data entry for the Health Pillar by connecting to device health ecosystems (Apple HealthKit / Google Fit) via modern Web APIs (or API wrappers) to automatically sync daily steps and sleep duration.

**Files Affected:**
- `src/services/wearableService.ts` (New integration service)
- `src/features/health/components/FitnessTracker.tsx` (Add sync/connect buttons)
- `src/components/settings/SettingsScreen.tsx` (Add wearable toggles)
- `src/types.ts` (Update user profile with wearable integration status)

**Logic / Dependencies:**
1.  **Architecture Pipeline:** Implement a wrapper that attempts to use the Web Health API (if available) or falls back to guiding the user to authorize a fitness API (e.g., Google Fit REST API via OAuth).
2.  **Data Syncing:** Create an automatic background sync (or on-app-mount sync) that requests `steps` and `sleep_hours` for the last 24 hours.
3.  **Opt-in Flow:** Prompt users with a clear privacy disclaimer before requesting access to health data. Once authorized, store the provider token/status in the Firestore user document.

---

## Step 6.2: Cross-Pillar AI Insights Engine

**Goal:**
Move beyond passive tracking by algorithmically identifying patterns between a user's physical habits and spiritual adherence. Deliver proactive, highly personalized nudges (e.g., "Your Fajr adherence drops by 40% when you sleep less than 6 hours").

**Files Affected:**
- `src/services/insightsEngine.ts` (New algorithmic correlation service)
- `src/components/dashboard/AIInsightCard.tsx` (New UI component)
- `src/App.tsx` (or Dashboard view to render the insight)
- `package.json` (Optional: Install a lightweight stats library if needed)

**Logic / Dependencies:**
1.  **Data Aggregation:** Fetch the last 14-30 days of data from both `health_logs` (sleep, steps) and `salat_logs` (prayer completion times).
2.  **Correlation Logic:** Run lightweight local statistical comparisons (e.g., calculating the average sleep hours on days Fajr was missed vs. completed).
3.  **Nudge Generation:** Translate statistical thresholds into human-readable text strings. If a clear correlation (e.g., > 20% variance) is found, surface the `AIInsightCard` prominently on the dashboard.

---

## Step 6.3: Accountability Circles (Social Graph)

**Goal:**
Leverage positive peer pressure to sustain the habit flywheel. Allow users to create private groups using secure invite codes to view aggregated daily scores of their friends, without exposing private journal entries or vault reflections.

**Files Affected:**
- `src/components/social/AccountabilityCircles.tsx` (New view)
- `src/services/socialService.ts` (New service for group management)
- `firestore.rules` (Crucial: Secure group reads)
- `src/types.ts` (Add `Group` and `GroupMember` schemas)

**Logic / Dependencies:**
1.  **Database Schema:**
    *   `groups/{groupId}`: Details like `name`, `inviteCode`, `adminUid`.
    *   `groups/{groupId}/members/{uid}`: Stores current daily scores and streaks.
2.  **Invite Flow:** Generate a unique, short alphanumeric invite code when a user creates a group. Other users can input this code in the UI to join.
3.  **Privacy & Rules:** Update `firestore.rules` to allow users to read member scores *only* if they belong to the same group. Vault data and personal logs remain strictly locked to `isOwner(userId)`.
