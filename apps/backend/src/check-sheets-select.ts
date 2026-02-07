
import { pool } from './db';

async function check() {
    try {
        const [rows]: any = await pool.query('SELECT * FROM sheets LIMIT 1');
        if (rows.length > 0) {
            console.log('Keys:', Object.keys(rows[0]));
        } else {
            console.log('No sheets found. Creating one to check keys.');
            await pool.query('INSERT INTO sheets (name, owner_id) VALUES (?, ?)', ['Temp Check', 1]); // Assuming user 1 exists
            const [newRows]: any = await pool.query('SELECT * FROM sheets ORDER BY id DESC LIMIT 1');
            console.log('Keys:', Object.keys(newRows[0]));
        }
    } catch (e) { console.error(e); }
    process.exit();
}
check();
