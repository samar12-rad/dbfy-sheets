# Backend Documentation: Sheet Connect

The backend is a robust RESTful API built with Node.js, Express, and TypeScript. It manages state between the database and external Google Sheets via OAuth and Webhooks.

## Directory Structure

- `/src/routes/`: API endpoint definitions (Auth, Sheets, Logs, Webhooks).
- `/src/middlewares/`: JWT authentication and Global Error Handling.
- `/src/db.ts`: MySQL connection pool configuration.
- `/src/sse.ts`: Real-time event broadcasting logic.

## Database Schema (MySQL)

### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary Key |
| email | VARCHAR | User email |
| password_hash | VARCHAR | BCrypt hashed password |

### `sheets`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary Key |
| owner_id | INT | Foreign Key (users.id) |
| name | VARCHAR | Display name |
| external_sheet_id | VARCHAR | Google Spreadsheet ID |
| access_token | TEXT | Encrypted/Stored Google Access Token |
| refresh_token | TEXT | Stored Google Refresh Token |
| token_expiry | BIGINT | Timestamp for token expiry |
| status | VARCHAR | Connection status (connected/disconnected) |

### `sheet_rows`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary Key |
| sheet_id | INT | Foreign Key (sheets.id) |
| row_index | INT | Position in the sheet |

### `sheet_cells`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary Key |
| row_id | INT | Foreign Key (sheet_rows.id) |
| column_key | VARCHAR | Column header (e.g., 'A', 'Name') |
| value | TEXT | Cell content |

### `activity_logs`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary Key |
| user_id | INT | Who performed the action |
| sheet_id | INT | Which sheet was affected |
| action_type | VARCHAR | e.g., 'CELL_UPDATE', 'SHEET_SYNC' |
| entity_id | INT | Affected row/cell ID |
| old_value | TEXT | Previous value |
| new_value | TEXT | New value |

## API Endpoints

### Authentication
- `POST /auth/register`: Create a new user.
- `POST /auth/login`: authenticate and receive JWT.
- `GET /auth/google/start`: Initiate Google OAuth flow.
- `GET /auth/google/callback`: Handle Google OAuth redirect.

### Sheet Management
- `GET /sheets`: List all sheets for the logged-in user.
- `POST /sheets`: Create a new virtual sheet.
- `GET /sheets/:id`: Get sheet metadata and data (rows/cells).
- `POST /sheets/:id/import`: Force pull data from Google Sheets.
- `POST /sheets/:id/sync`: Bi-directional sync.

### Data Operations
- `POST /sheets/:id/cell`: Update a single cell value.
- `POST /sheets/:id/row`: Add a new row.
- `DELETE /sheets/:id/row/:rowId`: Remove a row.

### Logs
- `GET /logs`: Global activity logs for the user.
- `GET /sheets/:id/logs`: Activity logs specifically for one sheet.

## Webhooks (Apps Script)
The backend exposes `POST /sheet` as an unauthenticated endpoint (secured by logic/origin) to receive notifications from the Google Apps Script trigger.
