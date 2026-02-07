
import { pool } from './src/db';

async function run() {
    try {
        console.log('Checking columns in sheets table...');
        const [rows] = await pool.query("SHOW COLUMNS FROM sheets");
        const columns = (rows as any[]).map(r => r.Field);
        console.log('Found columns:', columns);

        if (columns.includes('status')) {
            console.log('✅ Status column exists.');
        } else {
            console.log('❌ Status column MISSING.');
        }

        if (columns.includes('last_sync_status')) {
            console.log('✅ last_sync_status column exists.');
        } else {
            console.log('❌ last_sync_status column MISSING.');
        }

    } catch (e) {
        console.error('Error checking schema:', e);
    }
    process.exit(0);
}

run();
