
import { pool } from './src/db';

async function run() {
    try {
        console.log('Ensure status column exists...');
        await pool.query("ALTER TABLE sheets ADD COLUMN status VARCHAR(50) DEFAULT 'connected'");
        console.log('Status column added.');
    } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Status column already exists.');
        } else {
            console.error('Error adding status column:', e.message);
        }
    }
    process.exit(0);
}

run();
