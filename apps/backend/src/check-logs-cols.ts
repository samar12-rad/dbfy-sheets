
import { pool } from './db';

async function checkCols() {
    try {
        const [rows] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'sheetdb' AND TABLE_NAME = 'activity_logs'
        `);
        console.log('--- LOGS COLUMNS ---');
        console.log(JSON.stringify(rows));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkCols();
