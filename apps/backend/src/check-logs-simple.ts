
import { pool } from './db';

async function check() {
    try {
        const [rows] = await pool.query<any[]>('DESCRIBE activity_logs');
        rows.forEach(r => console.log('COL:', r.Field));
    } catch (e) { console.error(e); }
    process.exit();
}
check();
