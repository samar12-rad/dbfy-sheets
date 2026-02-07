
import { pool } from './db';

async function checkSheetsCols() {
    try {
        const [rows] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'sheetdb' AND TABLE_NAME = 'sheets'
        `);
        console.log('--- SHEETS COLUMNS ---');
        rows.forEach((r: any) => console.log(r.COLUMN_NAME));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkSheetsCols();
