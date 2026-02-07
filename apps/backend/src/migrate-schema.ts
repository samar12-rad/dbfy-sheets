
import { pool } from './db';

async function migrate() {
    try {
        console.log('Migrating sheets table...');

        const queries = [
            `ALTER TABLE sheets ADD COLUMN external_sheet_id VARCHAR(255) NULL`,
            `ALTER TABLE sheets ADD COLUMN access_token TEXT NULL`,
            `ALTER TABLE sheets ADD COLUMN refresh_token TEXT NULL`,
            `ALTER TABLE sheets ADD COLUMN token_expiry BIGINT NULL`,
            `CREATE INDEX idx_external_sheet_id ON sheets(external_sheet_id)`
        ];

        for (const q of queries) {
            try {
                await pool.query(q);
                console.log(`Executed: ${q}`);
            } catch (err: any) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipped (already exists): ${q}`);
                } else if (err.code === 'ER_DUP_KEYNAME') {
                    console.log(`Skipped (index exists): ${q}`);
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
