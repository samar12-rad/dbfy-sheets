
import { pool } from './db';

async function migrate() {
    try {
        console.log('Migrating sheets table (Sync Observability)...');

        const queries = [
            `ALTER TABLE sheets ADD COLUMN last_synced_at TIMESTAMP NULL`,
            `ALTER TABLE sheets ADD COLUMN last_sync_status VARCHAR(50) NULL`
        ];

        for (const q of queries) {
            try {
                await pool.query(q);
                console.log(`Executed: ${q}`);
            } catch (err: any) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipped (already exists): ${q}`);
                } else {
                    console.error(`Failed: ${q}`, err);
                }
            }
        }

        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
