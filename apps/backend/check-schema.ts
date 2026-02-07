
import { pool } from './src/db';

async function run() {
    try {
        const [rows] = await pool.query("DESCRIBE sheets");
        console.log('Table Structure:', rows);
    } catch (e) {
        console.error('Describe error:', e);
    }
    process.exit(0);
}

run();
