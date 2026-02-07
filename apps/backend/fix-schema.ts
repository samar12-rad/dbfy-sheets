
import { pool } from './src/db';

async function run() {
    try {
        console.log('Adding missing columns...');
        await pool.query("ALTER TABLE sheets ADD COLUMN status VARCHAR(50) DEFAULT 'connected', ADD COLUMN last_sync_status VARCHAR(50) DEFAULT 'PENDING'");
        console.log('Columns added successfully');
    } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
        } else {
            console.log('Alter table error:', e.message);
        }
    }

    try {
        console.log('Deleting problematic sheet...');
        const [res] = await pool.query('DELETE FROM sheets WHERE external_sheet_id = ?', ['1AuWC4R5fKS_Dv_N2n59Yy-O9j2QMxHrzLcmFagC5LIA']);
        console.log('Deleted rows:', (res as any).affectedRows);
    } catch (e) {
        console.error('Delete error:', e);
    }
    process.exit(0);
}

run();
