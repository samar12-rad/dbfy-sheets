
import express, { Router, Request, Response } from 'express';
import { pool } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { sheetUpdates } from '../sse';

const router = express.Router();

// Helper to convert 1-based column index to letter (A, B, C...)
const columnToLetter = (idx: number): string => {
    let letter = '';
    idx--; // Convert to 0-based
    while (idx >= 0) {
        letter = String.fromCharCode((idx % 26) + 65) + letter;
        idx = Math.floor(idx / 26) - 1;
    }
    return letter;
};

router.post('/sheet', async (req: Request, res: Response) => {
    // Expected Payload:
    // {
    //   spreadsheetId: "...", // HIGHLY RECOMMENDED
    //   sheetName: "Sheet1",
    //   row: 1, (1-based)
    //   column: 1, (1-based)
    //   value: "New Value",
    //   time: "..."
    // }

    const { spreadsheetId, sheetName, row, column, value } = req.body;

    console.log('Webhook received:', req.body);

    if (!row || !column) {
        res.status(400).json({ error: 'Missing row/column' });
        return;
    }

    const connection = await pool.getConnection();

    try {
        let sheetId: number | null = null;
        let userId: number | null = null;

        // 1. Find Sheet
        if (spreadsheetId) {
            const [sheets] = await connection.query<RowDataPacket[]>('SELECT id, owner_id FROM sheets WHERE external_sheet_id = ?', [spreadsheetId]);
            if (sheets.length > 0) {
                sheetId = sheets[0].id;
                userId = sheets[0].owner_id;
            }
        }

        // Fallback: Try to find by name if multiple sheets exist? Dangerous.
        // For now, if no spreadsheetId, we might fail or try to find a single sheet with that name?
        // Given the user instructions, they might NOT be sending spreadsheetId yet.
        // If they don't send spreadsheetId, we can't reliably know WHICH sheet it is if they have multiple.
        // But for this "Demo", maybe we pick the most recently connected one? 
        // Or we just error and tell them to add it. 
        // I will assume they WILL add it because I will tell them to.
        // But to be nice, if they don't, I'll log a warning.

        if (!sheetId) {
            // Try finding by name (Limitation: picks first found)
            const [sheets] = await connection.query<RowDataPacket[]>('SELECT id, owner_id FROM sheets WHERE name = ? LIMIT 1', [sheetName || 'Untitled']);
            if (sheets.length > 0) {
                sheetId = sheets[0].id;
                userId = sheets[0].owner_id;
                console.warn('Webhook: Found sheet by NAME. This is unsafe if duplicates exist.');
            }
        }

        if (!sheetId) {
            res.status(404).json({ error: 'Sheet not found. Please include spreadsheetId in payload.' });
            return;
        }

        const rowIndex = row - 1; // 0-based
        const colKey = columnToLetter(column); // A, B, ...

        await connection.beginTransaction();

        // 2. Ensure Row Exists
        // Check if row exists
        const [rows] = await connection.query<RowDataPacket[]>('SELECT id FROM sheet_rows WHERE sheet_id = ? AND row_index = ?', [sheetId, rowIndex]);

        console.log(`[Webhook] Looking for row: sheetId=${sheetId}, rowIndex=${rowIndex}, found=${rows.length}`);

        let dbRowId: number;
        if (rows.length === 0) {
            const [r] = await connection.query<ResultSetHeader>('INSERT INTO sheet_rows (sheet_id, row_index) VALUES (?, ?)', [sheetId, rowIndex]);
            dbRowId = r.insertId;
            console.log(`[Webhook] Created new row with id=${dbRowId}`);
        } else {
            dbRowId = rows[0].id;
            console.log(`[Webhook] Using existing row with id=${dbRowId}`);
        }

        // 3. Update/Insert Cell
        const [cells] = await connection.query<RowDataPacket[]>('SELECT id, value FROM sheet_cells WHERE row_id = ? AND column_key = ?', [dbRowId, colKey]);

        console.log(`[Webhook] Looking for cell: rowId=${dbRowId}, colKey=${colKey}, found=${cells.length}`);

        let oldVal = null;
        let cellId: number;

        if (cells.length > 0) {
            oldVal = cells[0].value;
            cellId = cells[0].id;
            console.log(`[Webhook] Updating existing cell id=${cellId}, oldVal="${oldVal}" -> newVal="${value}"`);
            await connection.query('UPDATE sheet_cells SET value = ? WHERE id = ?', [value, cellId]);
        } else {
            const [c] = await connection.query<ResultSetHeader>('INSERT INTO sheet_cells (row_id, column_key, value) VALUES (?, ?, ?)', [dbRowId, colKey, value]);
            cellId = c.insertId;
            console.log(`[Webhook] Created new cell id=${cellId}, value="${value}"`);
        }

        // 4. Log Activity
        // We use a system user or valid owner_id
        if (userId) {
            await connection.query(
                `INSERT INTO activity_logs (user_id, sheet_id, action_type, entity_type, entity_id, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, sheetId, 'WEBHOOK_UPDATE', 'CELL', cellId, JSON.stringify({ value: oldVal }), JSON.stringify({ value })]
            );
        }

        await connection.commit();
        console.log(`[Webhook] Transaction committed successfully`);

        // Emit SSE event to notify connected clients
        sheetUpdates.emit('update', { sheetId });
        console.log(`[Webhook] SSE event emitted for sheetId=${sheetId}`);

        res.json({ status: 'ok', data: { row: rowIndex, col: colKey, value } });

    } catch (error) {
        await connection.rollback();
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal error' });
    } finally {
        connection.release();
    }
});

export default router;
