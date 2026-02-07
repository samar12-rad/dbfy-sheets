
import { pool } from './src/db';

async function run() {
    try {
        console.log('Deleting sheet with ID 7...');
        const [res] = await pool.query('DELETE FROM sheets WHERE id = ?', [7]);
        console.log('Deleted rows:', (res as any).affectedRows);
    } catch (e) {
        console.error('Delete error:', e);
    }
    process.exit(0);
}

run();
