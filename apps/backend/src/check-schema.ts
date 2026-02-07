
import { pool } from './db';
import fs from 'fs';
import path from 'path';

async function checkSchema() {
    try {
        const [users] = await pool.query('DESCRIBE users');
        const [sheets] = await pool.query('DESCRIBE sheets');

        const output = `
--- USERS ---
${JSON.stringify(users, null, 2)}

--- SHEETS ---
${JSON.stringify(sheets, null, 2)}
        `;

        fs.writeFileSync(path.join(__dirname, 'schema_dump.txt'), output);
        console.log('Schema dumped to schema_dump.txt');
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkSchema();
