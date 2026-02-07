
import { pool } from './db';

async function check() {
    try {
        const query = `
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'sheetdb' AND TABLE_NAME = 'sheets'
        `;
        const [rows]: any = await pool.query(query);
        console.log('--- COLUMNS ---');
        if (Array.isArray(rows)) {
            rows.forEach(r => console.log(r.COLUMN_NAME));
        } else {
            console.log('Rows is not array:', rows);
        }
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
check();
