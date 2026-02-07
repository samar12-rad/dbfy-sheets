# Frontend Documentation: Sheet Connect

The frontend is a modern React application built with Next.js 14, leveraging the App Router for efficient routing and server-side components where appropriate.

## Key Technologies
- **Next.js 14**: Framework for the UI and routing.
- **SWR (Stale-While-Revalidate)**: Used for data fetching, caching, and optimistic UI updates.
- **Tailwind CSS**: Utility-first styling for a custom, responsive design.
- **Shadcn UI**: High-quality UI components (Dialogs, Cards, Inputs).
- **Lucide React**: Icon library.
- **Sonner**: Toast notifications for user feedback.

## Essential Components

### 1. `SheetGrid`
The core component of the application. It renders the data grid and handles:
- **Real-time cell locking**: Prevents concurrent edits.
- **Optimistic Updates**: Changes are reflected in the UI immediately while the backend request is in progress.
- **Error Boundaries**: Handles network failures gracefully.

### 2. `ConnectSheetDialog`
A multi-step modal that guides users through:
- Providing a sheet name.
- Entering a Google Spreadsheet ID.
- Initiating the OAuth flow to connect the sheet.

### 3. `ActivityLogViewer`
A dedicated component for viewing audit logs, available both globally and filtered per sheet. Use consistent formatting for timestamps and action types.

## State Management & Authentication
- **AuthContext**: A React Context provider that manages JWT storage, user profile data, and route protection (redirecting unauthenticated users to `/login`).
- **SWR Config**: Global configuration for fetching, including automatic revalidation when the window focuses or the network reconnects.

## Real-time Integration
The frontend uses **Server-Sent Events (SSE)** to listen for updates from the backend.
- When an update event is received, SWR is instructed to `mutate` the local cache for that sheet, triggering a silent re-fetch to keep the data fresh.
