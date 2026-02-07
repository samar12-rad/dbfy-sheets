
import { pool } from './db';

async function checkDataSchema() {
    try {
        const [rows] = await pool.query(`
            SELECT TABLE_NAME, COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'sheetdb' AND TABLE_NAME IN ('sheet_rows', 'sheet_cells')
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);
        console.log('--- DATA COLUMNS ---');
        console.log(JSON.stringify(rows));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}
checkDataSchema();
