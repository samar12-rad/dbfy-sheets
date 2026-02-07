
import { pool } from './db';

async function checkLogsSchema() {
    try {
        const [logs] = await pool.query('DESCRIBE activity_logs');
        console.log('--- ACTIVITY_LOGS TABLE ---');
        console.log(JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkLogsSchema();
