# MIZAN Security Specification

## Data Invariants
1. A user can only read and write their own profile (`users/{userId}`).
2. Logs (`salat_logs`, `adhkar_logs`, `career_tasks`, `water_logs`) must have a `userId` matching the authenticated user.
3. Points and rewards can only be updated by the owner, and certain fields (like `points`) should ideally be server-side but for this MVP we'll enforce that they can't be set to arbitrary values without ownership.
4. Timestamps must be validated using `request.time`.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Spoofing**: Create a `User` doc with `userId` "other_user" while authenticated as "my_user".
2. **Point Injection**: Update `rewards/{my_user}` with `points: 9999999`.
3. **Ghost Task**: Create a `career_tasks` doc with someone else's `userId`.
4. **Timestamp Fraud**: Create a log with a `createdAt` date in the past or future manually.
5. **Collection Scraping**: Attempt to list all `users` without a specific filter.
6. **ID Poisoning**: Create a doc with an ID that is 2MB long.
7. **Relational Orphan**: Create a `SalatLog` with a non-existent `prayerName` or invalid status.
8. **Owner Hijack**: Update another user's `water_logs`.
9. **Email Spoofing**: Attempt to access data using an unverified email (if we enforce verification).
10. **State Skipping**: Manually setting a task to `isCompleted: true` without having the task exist first (handled by create/update).
11. **Shadow Field**: Adding a `isAdmin: true` field to a `User` document.
12. **Recursive Cost Attack**: Making a complex query that forces deep `get()` lookups in a list.

## Security Rules Strategy
We will use:
- `isValidId()` for path variables.
- `isValid[Entity]()` for schema validation.
- `isOwner()` for all user-specific data.
- `hasOnly()` for updates to prevent shadow fields.
