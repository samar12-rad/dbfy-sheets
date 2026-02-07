
import { pool } from './db';

async function checkTables() {
    try {
        const [rows]: any = await pool.query('SHOW TABLES');
        console.log('Tables:', rows);
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}
checkTables();
