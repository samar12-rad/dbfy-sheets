
import { pool } from './db';

async function check() {
    try {
        const [rows] = await pool.query<any[]>(`
            SELECT TABLE_NAME, COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'sheetdb' AND TABLE_NAME IN ('sheet_rows', 'sheet_cells')
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);
        rows.forEach(r => console.log(`${r.TABLE_NAME}.${r.COLUMN_NAME}`));
    } catch (e) { console.error(e); }
    process.exit();
}
check();
