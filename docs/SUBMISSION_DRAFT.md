# Project Submission: Sheet Connect

## Overview
Sheet Connect is a high-performance synchronization engine between custom web interfaces and Google Sheets. It addresses the common problem of data silos by allowing users to manage data in a structured web environment while maintaining a perfect mirror in a Google Spreadsheet for collaboration and reporting.

## Key Features
- **Bi-Directional Sync**: Changes in the Web UI reflect in Google Sheets immediately, and vice versa via Apps Script webhooks.
- **Concurrency Protection**: Real-time cell locking via Server-Sent Events (SSE) ensures data integrity during multi-user sessions.
- **Audit Trails**: Every modification, sync, and connection event is logged with old and new values for complete transparency.
- **Scalable Architecture**: Decoupled frontend/backend with a relational MySQL core optimized for complex data relationships.

## Challenges & Solutions

### 1. The "Free Tier" Memory Constraint
**Problem**: During deployment to Render's free tier, the application initially crashed due to OOM (Out of Memory) errors because it was running `ts-node` in production.
**Solution**: We implemented a multi-stage deployment build process. The TypeScript code is compiled to highly efficient JavaScript (`dist/`) before execution, significantly reducing memory overhead.

### 2. Schema Evolution Mismatches
**Problem**: As features like audit logging and OAuth were added, the database schema required frequent updates. Deploying to Aiven Cloud revealed mismatches between the local dev environment and production SQL.
**Solution**: We transitioned to a script-based migration approach to normalize the production database, ensuring all required columns (e.g., `owner_id`, `access_token`) were present and strictly typed.

### 3. Real-time Feedback Loop
**Problem**: Traditional polling for updates is inefficient and creates lag.
**Solution**: We chose Server-Sent Events (SSE) over WebSockets for its simplicity and robustness in read-heavy scenarios. The frontend uses SSE to trigger smart revalidation via SWR, creating a "live" feel without the complexity of a full duplex connection.

## Trade-offs & Decisions

- **Sync Policy (Internal Wins)**: We chose an "Internal Wins" strategy for synchronization. While bi-directional, if a conflict occurs during a manual sync, the platform state is prioritized to ensure the "Source of Truth" remains consistent with the audit logs.
- **MySQL vs. NoSQL**: We opted for MySQL to leverage relational foreign keys (`ON DELETE CASCADE`). This ensures that deleting a sheet automatically cleans up all associated rows, cells, and logs, preventing orphaned data.
- **JWT + Google OAuth**: Combining custom JWT for app access with Google OAuth for data access provides a layered security model where user identity and data authorization are decoupled.

## Future Roadmap
- Implementation of batch updates for massive data imports (10,000+ rows).
- Column-level permissioning for multi-tenant organizations.
- Predictive caching for the data grid to improve horizontal scroll performance on low-end devices.
