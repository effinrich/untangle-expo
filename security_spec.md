# Security Specification

## Data Invariants
1. Each user's data is strictly scoped under `/users/{userId}` where `userId == request.auth.uid`.
2. Tasks and Parking Lot items can only be read, written, updated, or deleted by their respective authenticated owner.
3. User profile data cannot be read by any user other than the owner (prevents PII exposure).
4. System-wide user listing is forbidden (`allow list: if false`).
5. Tasks require immutable `userId`, `id`, and `createdAt` timestamps.

## Dirty Dozen Payloads & Attack Scenarios
1. **Unauthenticated Read**: Attempting to read another user's tasks without authentication -> DENIED.
2. **Cross-Tenant Read**: Authenticated user A attempting to list or read user B's tasks -> DENIED.
3. **Cross-Tenant Write**: User A attempting to insert or edit a task in user B's subcollection -> DENIED.
4. **ID Spoofing**: Setting `incoming().userId` to an arbitrary string different from `request.auth.uid` -> DENIED.
5. **Path ID Mismatch**: Submitting a document with `incoming().id != taskId` in path -> DENIED.
6. **Huge Payload Denial of Wallet**: Injecting 1MB strings into task title or firstPhysicalStep -> DENIED.
7. **Ghost Fields / Shadow Update**: Adding unauthorized admin/secret privilege fields to Task or UserProfile -> DENIED.
8. **Immutable Field Tampering**: Attempting to change `createdAt` or `userId` on existing task -> DENIED.
9. **User Listing Harvest**: Querying the `/users` collection to scrape email addresses -> DENIED.
10. **Invalid Energy Enum**: Submitting `energyLevel: "nuclear"` instead of allowed "low" | "medium" | "high" -> DENIED.
11. **Excessive Substeps Array**: Sending an array with > 50 substeps -> DENIED.
12. **Malformed Document ID**: Document ID with invalid characters/length exceeding 128 chars -> DENIED.
