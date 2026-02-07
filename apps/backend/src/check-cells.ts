
import { pool } from './db';

async function check() {
    try {
        const [rows] = await pool.query<any[]>(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'sheetdb' AND TABLE_NAME = 'sheet_cells'
        `);
        rows.forEach(r => console.log(r.COLUMN_NAME));
    } catch (e) { console.error(e); }
    process.exit();
}
check();
