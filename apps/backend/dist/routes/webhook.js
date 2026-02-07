"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const sse_1 = require("../sse");
const router = express_1.default.Router();
// Helper to convert 1-based column index to letter (A, B, C...)
const columnToLetter = (idx) => {
    let letter = '';
    idx--; // Convert to 0-based
    while (idx >= 0) {
        letter = String.fromCharCode((idx % 26) + 65) + letter;
        idx = Math.floor(idx / 26) - 1;
    }
    return letter;
};
router.post('/sheet', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const connection = yield db_1.pool.getConnection();
    try {
        let sheetId = null;
        let userId = null;
        // 1. Find Sheet
        if (spreadsheetId) {
            const [sheets] = yield connection.query('SELECT id, owner_id FROM sheets WHERE external_sheet_id = ?', [spreadsheetId]);
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
            const [sheets] = yield connection.query('SELECT id, owner_id FROM sheets WHERE name = ? LIMIT 1', [sheetName || 'Untitled']);
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
        yield connection.beginTransaction();
        // 2. Ensure Row Exists
        // Check if row exists
        const [rows] = yield connection.query('SELECT id FROM sheet_rows WHERE sheet_id = ? AND row_index = ?', [sheetId, rowIndex]);
        console.log(`[Webhook] Looking for row: sheetId=${sheetId}, rowIndex=${rowIndex}, found=${rows.length}`);
        let dbRowId;
        if (rows.length === 0) {
            const [r] = yield connection.query('INSERT INTO sheet_rows (sheet_id, row_index) VALUES (?, ?)', [sheetId, rowIndex]);
            dbRowId = r.insertId;
            console.log(`[Webhook] Created new row with id=${dbRowId}`);
        }
        else {
            dbRowId = rows[0].id;
            console.log(`[Webhook] Using existing row with id=${dbRowId}`);
        }
        // 3. Update/Insert Cell
        const [cells] = yield connection.query('SELECT id, value FROM sheet_cells WHERE row_id = ? AND column_key = ?', [dbRowId, colKey]);
        console.log(`[Webhook] Looking for cell: rowId=${dbRowId}, colKey=${colKey}, found=${cells.length}`);
        let oldVal = null;
        let cellId;
        if (cells.length > 0) {
            oldVal = cells[0].value;
            cellId = cells[0].id;
            console.log(`[Webhook] Updating existing cell id=${cellId}, oldVal="${oldVal}" -> newVal="${value}"`);
            yield connection.query('UPDATE sheet_cells SET value = ? WHERE id = ?', [value, cellId]);
        }
        else {
            const [c] = yield connection.query('INSERT INTO sheet_cells (row_id, column_key, value) VALUES (?, ?, ?)', [dbRowId, colKey, value]);
            cellId = c.insertId;
            console.log(`[Webhook] Created new cell id=${cellId}, value="${value}"`);
        }
        // 4. Log Activity
        // We use a system user or valid owner_id
        if (userId) {
            yield connection.query(`INSERT INTO activity_logs (user_id, sheet_id, action_type, entity_type, entity_id, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?, ?)`, [userId, sheetId, 'WEBHOOK_UPDATE', 'CELL', cellId, JSON.stringify({ value: oldVal }), JSON.stringify({ value })]);
        }
        yield connection.commit();
        console.log(`[Webhook] Transaction committed successfully`);
        // Emit SSE event to notify connected clients
        sse_1.sheetUpdates.emit('update', { sheetId });
        console.log(`[Webhook] SSE event emitted for sheetId=${sheetId}`);
        res.json({ status: 'ok', data: { row: rowIndex, col: colKey, value } });
    }
    catch (error) {
        yield connection.rollback();
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal error' });
    }
    finally {
        connection.release();
    }
}));
exports.default = router;
