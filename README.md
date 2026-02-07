# Sheet Connect

Sheet Connect is a high-performance synchronization engine between custom web-based data grids and Google Sheets. It features real-time concurrency protection via SSE, bi-directional sync, and comprehensive audit logging.

## Documentation

Detailed documentation is available in the `docs/` directory:

- [System Architecture](docs/SYSTEM_ARCHITECTURE.md) - High-level overview and data flow.
- [Backend Documentation](docs/BACKEND_DOCS.md) - API endpoints and database schema.
- [Frontend Documentation](docs/FRONTEND_DOCS.md) - Component structure and state management.
- [Submission Draft](docs/SUBMISSION_DRAFT.md) - Technical challenges and solutions.

## Getting Started

### Backend
1. `cd apps/backend`
2. `npm install`
3. Configure `.env`
4. `npm start`

### Frontend
1. `cd apps/frontend`
2. `npm install`
3. Configure `.env.local`
4. `npm run dev`
