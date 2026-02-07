
import express, { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authenticateUser } from '../middlewares/auth';
import { validate, createSheetSchema, addRowSchema, updateCellSchema } from '../validators';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const router = express.Router();

router.use(authenticateUser);

// Create Sheet
router.post('/', validate(createSheetSchema), async (req: Request, res: Response) => {
    const { name } = req.body;
    const userId = req.user!.id;

    if (!name) {
        res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Name is required' } });
        return;
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Create Sheet
        const [sheetResult] = await connection.query<ResultSetHeader>(
            'INSERT INTO sheets (name, owner_id) VALUES (?, ?)',
            [name, userId]
        );
        const sheetId = sheetResult.insertId;

        // 2. Log Activity
        await connection.query(
            `INSERT INTO activity_logs 
            (user_id, sheet_id, action_type, entity_type, entity_id, new_value) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                sheetId,
                'SHEET_CREATE',
                'SHEET',
                sheetId,
                JSON.stringify({ name, owner_id: userId })
            ]
        );

        await connection.commit();

        res.status(201).json({
            data: {
                id: sheetId,
                name,
                owner_id: userId
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Create sheet error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create sheet' } });
    } finally {
        connection.release();
    }
});

// List Sheets
router.get('/', async (req: Request, res: Response) => {
    const userId = req.user!.id; // Filter by user? Or allow all? Assuming per-user for now based on "List all sheets for user" plan.
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM sheets WHERE owner_id = ?', [userId]);
        res.json({ data: rows });
    } catch (error) {
        console.error('List sheets error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sheets' } });
    }
});

// Get Sheet
router.get('/:id', async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sheetId = req.params.id;

    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM sheets WHERE id = ?', [sheetId]);
        if (rows.length === 0) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Sheet not found' } });
            return;
        }
        res.json({ data: rows[0] });
    } catch (error) {
        console.error('Get sheet error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sheet' } });
    }
});


// Get Sheet Data (Rows + Cells)
router.get('/:id/rows', async (req: Request, res: Response) => {
    const userId = req.user!.id; // TODO: Verify ownership logic if restricted
    const sheetId = req.params.id;

    try {
        // 1. Get Rows
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM sheet_rows WHERE sheet_id = ? ORDER BY row_index ASC',
            [sheetId]
        );

        // 2. Get Cells (only if we have rows)
        let cells: RowDataPacket[] = [];
        if (rows.length > 0) {
            const [cellRows] = await pool.query<RowDataPacket[]>(
                `SELECT c.* 
                 FROM sheet_cells c 
                 JOIN sheet_rows r ON c.row_id = r.id 
                 WHERE r.sheet_id = ?`,
                [sheetId]
            );
            cells = cellRows;
        }

        // Prevent caching to ensure fresh data
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.json({
            data: {
                rows,
                cells
            }
        });

    } catch (error) {
        console.error('Get sheet rows error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sheet data' } });
    }
});

// --- Data Mutation APIs ---

// Add Row
router.post('/:id/rows', validate(addRowSchema), async (req: Request, res: Response) => {
    const userId = req.user!.id; // TODO: Verify ownership/access if needed
    const sheetId = req.params.id;
    const { row_index } = req.body;

    if (row_index === undefined) {
        res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'row_index is required' } });
        return;
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert Row
        const [result] = await connection.query<ResultSetHeader>(
            'INSERT INTO sheet_rows (sheet_id, row_index) VALUES (?, ?)',
            [sheetId, row_index]
        );
        const rowId = result.insertId;

        // 2. Log Activity
        await connection.query(
            `INSERT INTO activity_logs 
            (user_id, sheet_id, action_type, entity_type, entity_id, new_value) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                sheetId,
                'ROW_CREATE',
                'ROW',
                rowId,
                JSON.stringify({ row_index })
            ]
        );

        await connection.commit();
        res.status(201).json({ data: { id: rowId, sheet_id: sheetId, row_index } });

    } catch (error) {
        await connection.rollback();
        console.error('Add row error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to add row' } });
    } finally {
        connection.release();
    }
});

// Update Cell
router.patch('/:id/cells', validate(updateCellSchema), async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sheetId = req.params.id;
    const { row_id, column_key, value } = req.body;

    if (!row_id || !column_key || value === undefined) {
        res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'row_id, column_key, value are required' } });
        return;
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Check Row Ownership/Existence & Validity (Optional but recommended)
        // Ignoring explicit checking for perf, assuming row_id is valid or FK will fail? 
        // FK failure on Insert/Update is acceptable.

        // 2. Get Old Value (and LOCK)
        // We select the specific cell. If it doesn't exist, we get nothing.
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT value, id FROM sheet_cells WHERE row_id = ? AND column_key = ? FOR UPDATE',
            [row_id, column_key]
        );

        let oldValue = null;
        let cellId = null;

        if (rows.length > 0) {
            oldValue = rows[0].value;
            cellId = rows[0].id;

            // Update
            await connection.query(
                'UPDATE sheet_cells SET value = ? WHERE id = ?',
                [value, cellId]
            );
        } else {
            // Insert
            const [result] = await connection.query<ResultSetHeader>(
                'INSERT INTO sheet_cells (row_id, column_key, value) VALUES (?, ?, ?)',
                [row_id, column_key, value]
            );
            cellId = result.insertId;
        }

        // --- GOOGLE SHEETS SYNC (PUSH) ---
        // Fetch tokens and row_index to construct A1 notation
        const [sheetInfo] = await connection.query<RowDataPacket[]>(
            `SELECT s.external_sheet_id, s.access_token, s.refresh_token, r.row_index 
             FROM sheet_rows r 
             JOIN sheets s ON r.sheet_id = s.id 
             WHERE r.id = ?`,
            [row_id]
        );

        if (sheetInfo.length > 0 && sheetInfo[0].external_sheet_id && sheetInfo[0].access_token) {
            const { external_sheet_id, access_token, refresh_token, row_index } = sheetInfo[0];

            // Google Sheets is 1-indexed for rows.
            // row_index is 0-indexed.
            const googleRow = row_index + 1;
            const range = `${column_key}${googleRow}`; // e.g., "A1", "B5"

            const oauth2Client = getOAuthClient();
            oauth2Client.setCredentials({ access_token, refresh_token });
            const sheetsClient = google.sheets({ version: 'v4', auth: oauth2Client });

            await sheetsClient.spreadsheets.values.update({
                spreadsheetId: external_sheet_id,
                range: range,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[value]]
                }
            });
        }
        // ---------------------------------

        // 3. Log Activity
        await connection.query(
            `INSERT INTO activity_logs 
            (user_id, sheet_id, action_type, entity_type, entity_id, old_value, new_value) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                sheetId,
                'CELL_UPDATE',
                'CELL',
                cellId,
                oldValue ? JSON.stringify({ value: oldValue }) : null,
                JSON.stringify({ value })
            ]
        );

        await connection.commit();
        res.json({ data: { id: cellId, row_id, column_key, value } });

    } catch (error) {
        await connection.rollback();
        console.error('Update cell error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update cell' } });
    } finally {
        connection.release();
    }
});

// Delete Row
router.delete('/:id/rows/:rowId', async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sheetId = req.params.id;
    const rowId = req.params.rowId;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get Row info for logging (and LOCK)
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM sheet_rows WHERE id = ? AND sheet_id = ? FOR UPDATE',
            [rowId, sheetId]
        );

        if (rows.length === 0) {
            await connection.rollback();
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Row not found' } });
            return;
        }

        const oldRowData = rows[0];

        // 2. Delete Row (Cascades to cells usually? If not we might leave orphans. 
        // Assumed schema handles cascade or we assume deletion of row implies deletion of cells. 
        // I will just delete the row. If FK constraint fails, I'll know.)
        // Ideally should delete cells first if no cascade.
        await connection.query('DELETE FROM sheet_cells WHERE row_id = ?', [rowId]);
        await connection.query('DELETE FROM sheet_rows WHERE id = ?', [rowId]);

        // 3. Log Activity
        await connection.query(
            `INSERT INTO activity_logs 
            (user_id, sheet_id, action_type, entity_type, entity_id, old_value) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                sheetId,
                'ROW_DELETE',
                'ROW',
                rowId,
                JSON.stringify(oldRowData)
            ]
        );

        await connection.commit();
        res.json({ data: { id: rowId, status: 'deleted' } });

    } catch (error) {
        await connection.rollback();
        console.error('Delete row error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete row' } });
    } finally {
        connection.release();
    }
});

// Delete Sheet
router.delete('/:id', async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sheetId = req.params.id;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get Sheet info for logging (and LOCK)
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM sheets WHERE id = ? AND owner_id = ? FOR UPDATE',
            [sheetId, userId]
        );

        if (rows.length === 0) {
            await connection.rollback();
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Sheet not found' } });
            return;
        }

        const oldSheetData = rows[0];

        // 2. Log Activity (Use NULL for sheet_id column to avoid FK issues during deletion)
        // We still keep the info in old_value and entity_id for records.
        await connection.query(
            `INSERT INTO activity_logs 
            (user_id, sheet_id, action_type, entity_type, entity_id, old_value) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                null, // sheet_id (FK) set to NULL because parent is being deleted
                'SHEET_DELETE',
                'SHEET',
                sheetId,
                JSON.stringify({
                    id: sheetId,
                    name: oldSheetData.name,
                    external_sheet_id: oldSheetData.external_sheet_id
                })
            ]
        );

        // 3. Delete Cells, Rows, and Sheet
        // Assuming no automated cascade in DB for safety, we delete manually
        await connection.query('DELETE FROM sheet_cells WHERE row_id IN (SELECT id FROM sheet_rows WHERE sheet_id = ?)', [sheetId]);
        await connection.query('DELETE FROM sheet_rows WHERE sheet_id = ?', [sheetId]);
        await connection.query('DELETE FROM sheets WHERE id = ?', [sheetId]);

        await connection.commit();
        res.json({ data: { id: sheetId, status: 'deleted' } });

    } catch (error) {
        await connection.rollback();
        console.error('Delete sheet error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete sheet' } });
    } finally {
        connection.release();
    }
});


// Get Sheet Logs
router.get('/:id/logs', async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sheetId = req.params.id;

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM activity_logs WHERE sheet_id = ? ORDER BY created_at DESC',
            [sheetId]
        );
        res.json({ data: rows });
    } catch (error) {
        console.error('Get sheet logs error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sheet logs' } });
    }
});


// --- Google Sheets Integration ---

import { google } from 'googleapis';

const getOAuthClient = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

const columnToLetter = (idx: number): string => {
    let letter = '';
    while (idx >= 0) {
        letter = String.fromCharCode((idx % 26) + 65) + letter;
        idx = Math.floor(idx / 26) - 1;
    }
    return letter;
};

// Connect (Store tokens)
router.post('/:id/connection', async (req: Request, res: Response) => {
    const userId = req.user!.id; // in real app query permissions
    const sheetId = req.params.id;
    const { external_sheet_id, access_token, refresh_token, token_expiry } = req.body;

    if (!external_sheet_id || !access_token) {
        res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Missing connection details' } });
        return;
    }

    try {
        await pool.query(
            `UPDATE sheets 
            SET external_sheet_id = ?, access_token = ?, refresh_token = ?, token_expiry = ? 
            WHERE id = ?`,
            [external_sheet_id, access_token, refresh_token, token_expiry, sheetId]
        );
        res.json({ data: { status: 'connected', sheetId, external_sheet_id } });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to connect sheet' } });
    }
});

// Import (Pull from Google)
router.post('/:id/import', async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sheetId = req.params.id;

    const connection = await pool.getConnection();
    try {
        // 1. Get Tokens (Check if connected)
        // Ensure to select refresh_token too
        const [sheets] = await connection.query<RowDataPacket[]>('SELECT external_sheet_id, access_token, refresh_token FROM sheets WHERE id = ?', [sheetId]);

        if (sheets.length === 0 || !sheets[0].external_sheet_id) {
            res.status(400).json({ error: { code: 'NOT_CONNECTED', message: 'Sheet not connected to Google' } });
            return;
        }

        const sheet = sheets[0];

        // 2. Fetch from Google
        const oauth2Client = getOAuthClient();
        oauth2Client.setCredentials({
            access_token: sheet.access_token,
            refresh_token: sheet.refresh_token
        });

        const sheetsClient = google.sheets({ version: 'v4', auth: oauth2Client });

        // Fetch values from first sheet, e.g. 'Sheet1'!A1:Z
        // We might need to handle sheet names dynamically. Defaults to first tab if Range is 'A1:Z'.
        // Or fetch metadata first to get sheet name.
        // For now, fetching simplified range 'A:Z' (all rows).

        const response = await sheetsClient.spreadsheets.values.get({
            spreadsheetId: sheet.external_sheet_id,
            range: 'A:Z'
        });

        const values = response.data.values || [];

        // Transform to internal format
        const importedRows = values.map((row, rowIndex) => {
            const cells: Record<string, string> = {};
            row.forEach((val, colIndex) => {
                const colKey = columnToLetter(colIndex);
                cells[colKey] = val as string;
            });
            return { row_index: rowIndex, cells };
        });

        await connection.beginTransaction();

        // 3. Clear Existing Data (Full Import strategy)
        await connection.query('DELETE FROM sheet_cells WHERE row_id IN (SELECT id FROM sheet_rows WHERE sheet_id = ?)', [sheetId]);
        await connection.query('DELETE FROM sheet_rows WHERE sheet_id = ?', [sheetId]);

        // 4. Bulk Insert
        for (const row of importedRows) {
            const [r] = await connection.query<ResultSetHeader>('INSERT INTO sheet_rows (sheet_id, row_index) VALUES (?, ?)', [sheetId, row.row_index]);
            const newRowId = r.insertId;

            for (const [col, val] of Object.entries(row.cells)) {
                await connection.query('INSERT INTO sheet_cells (row_id, column_key, value) VALUES (?, ?, ?)', [newRowId, col, val]);
            }
        }

        // 5. Log Activity
        await connection.query(
            `INSERT INTO activity_logs (user_id, sheet_id, action_type, entity_type, entity_id, new_value) VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, sheetId, 'SHEET_IMPORT', 'SHEET', sheetId, JSON.stringify({ count: importedRows.length })]
        );

        // 6. Update Sync Status
        await connection.query(
            'UPDATE sheets SET last_synced_at = NOW(), last_sync_status = ? WHERE id = ?',
            ['SUCCESS', sheetId]
        );

        await connection.commit();
        res.json({ data: { status: 'imported', rows: importedRows.length } });

    } catch (error: any) {
        await connection.rollback();
        console.error('Import error:', error);

        // Detailed Google Error handling
        if (error.code === 401 || error.code === 403) {
            res.status(401).json({ error: { code: 'AUTH_FAILED', message: 'Google Authentication failed. Please reconnect.' } });
            return;
        }

        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to import' } });
    } finally {
        connection.release();
    }
});


// Sync (Two-Way with Internal Wins)
router.post('/:id/sync', async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sheetId = req.params.id;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Check Connection
        const [sheets] = await connection.query<RowDataPacket[]>('SELECT external_sheet_id, access_token, refresh_token FROM sheets WHERE id = ?', [sheetId]);
        if (sheets.length === 0 || !sheets[0].external_sheet_id) {
            res.status(400).json({ error: { code: 'NOT_CONNECTED', message: 'Not connected' } });
            return;
        }
        const sheet = sheets[0];

        // 2. Fetch Google Data (Real)
        const oauth2Client = getOAuthClient();
        oauth2Client.setCredentials({
            access_token: sheet.access_token,
            refresh_token: sheet.refresh_token
        });
        const sheetsClient = google.sheets({ version: 'v4', auth: oauth2Client });
        const response = await sheetsClient.spreadsheets.values.get({
            spreadsheetId: sheet.external_sheet_id,
            range: 'A:Z'
        });
        const values = response.data.values || [];

        const googleRows = values.map((row, rowIndex) => {
            const cells: Record<string, string> = {};
            row.forEach((val, colIndex) => {
                const colKey = columnToLetter(colIndex);
                cells[colKey] = val as string;
            });
            return { row_index: rowIndex, cells };
        });

        // 3. Sync Logic (Pull New Rows)
        let added = 0;
        let updated = 0;

        for (const gRow of googleRows) {
            const [dbRows] = await connection.query<RowDataPacket[]>('SELECT id FROM sheet_rows WHERE sheet_id = ? AND row_index = ?', [sheetId, gRow.row_index]);

            let rowId: number;

            if (dbRows.length === 0) {
                // New Row from Google -> Insert
                const [r] = await connection.query<ResultSetHeader>('INSERT INTO sheet_rows (sheet_id, row_index) VALUES (?, ?)', [sheetId, gRow.row_index]);
                rowId = r.insertId;
                added++;
            } else {
                rowId = dbRows[0].id;
            }

            // Sync Cells (Google Wins)
            for (const [col, val] of Object.entries(gRow.cells)) {
                // Check if cell exists and is different
                const [cellRows] = await connection.query<RowDataPacket[]>('SELECT id, value FROM sheet_cells WHERE row_id = ? AND column_key = ?', [rowId, col]);

                if (cellRows.length === 0) {
                    // New Cell
                    await connection.query('INSERT INTO sheet_cells (row_id, column_key, value) VALUES (?, ?, ?)', [rowId, col, val]);
                    updated++;
                } else if (cellRows[0].value !== val) {
                    // Update existing cell
                    await connection.query('UPDATE sheet_cells SET value = ? WHERE id = ?', [val, cellRows[0].id]);
                    updated++;
                }
            }
        }

        // 4. Log Activity
        if (added > 0 || updated > 0) {
            await connection.query(
                `INSERT INTO activity_logs (user_id, sheet_id, action_type, entity_type, entity_id, new_value) VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, sheetId, 'SYNC_COMPLETE', 'SHEET', sheetId, JSON.stringify({ added, updated })]
            );
        }

        // 5. Update Sync Status (Success)
        await connection.query(
            'UPDATE sheets SET last_synced_at = NOW(), last_sync_status = ? WHERE id = ?',
            ['SUCCESS', sheetId]
        );

        await connection.commit();
        res.json({ data: { status: 'synced', stats: { added, updated } } });

    } catch (error) {
        await connection.rollback();
        console.error('Sync error:', error);

        try {
            const failConn = await pool.getConnection(); // New connection
            await failConn.query('UPDATE sheets SET last_sync_status = ? WHERE id = ?', ['FAILED', sheetId]);
            failConn.release();
        } catch (e) {
            console.error('Failed to record sync failure status:', e);
        }

        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to sync' } });
    } finally {
        connection.release();
    }
});

export default router;
