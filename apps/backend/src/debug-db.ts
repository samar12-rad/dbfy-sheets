import { pool } from './db';

async function debugRows() {
    console.log('--- Database Debug ---');
    try {
        const [sheets] = await pool.query('SELECT id, name, external_sheet_id FROM sheets');
        console.log('--- SHEETS ---');
        console.log(JSON.stringify(sheets, null, 2));

        for (const s of (sheets as any)) {
            const [rCount] = await pool.query('SELECT COUNT(*) as count FROM sheet_rows WHERE sheet_id = ?', [s.id]);
            console.log(`Sheet "${s.name}" (ID: ${s.id}): ${(rCount as any)[0].count} rows`);
        }

    } catch (error) {
        console.error('Debug error:', error);
    } finally {
        process.exit(0);
    }
}

debugRows();
