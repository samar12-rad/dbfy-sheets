
// import fetch from 'node-fetch';
import { pool } from './db';

async function verifySyncStatus() {
    const BASE_URL = 'http://localhost:4000';
    const email = `statuscheck${Date.now()}@example.com`;
    const password = 'password123';
    let token = '';
    let sheetId = 0;

    const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

    try {
        console.log('Setup...');
        // Login/Register/Create/Connect
        await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const loginRes = await fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        token = (await loginRes.json() as any).data.token;
        const sheetRes = await fetch(`${BASE_URL}/sheets`, { method: 'POST', headers: headers(), body: JSON.stringify({ name: 'Status Check Sheet' }) });
        sheetId = (await sheetRes.json() as any).data.id;

        await fetch(`${BASE_URL}/sheets/${sheetId}/connection`, {
            method: 'POST', headers: headers(), body: JSON.stringify({ external_sheet_id: 'EXT_ID', access_token: 'TOK' })
        });

        // Sync
        console.log('Triggering Sync...');
        await fetch(`${BASE_URL}/sheets/${sheetId}/sync`, { method: 'POST', headers: headers() });

        // Verify DB
        console.log('Checking DB Status...');
        const [rows]: any = await pool.query('SELECT last_synced_at, last_sync_status FROM sheets WHERE id = ?', [sheetId]);
        console.log('Sheet Status:', rows[0]);

        if (rows[0].last_sync_status === 'SUCCESS' && rows[0].last_synced_at) {
            console.log('Verification Passed: Sync status updated.');
        } else {
            console.log('Verification Failed.');
        }

    } catch (e) {
        console.error('Verification Failed:', e);
        if (e instanceof Error) console.error(e.stack);
    } finally {
        process.exit();
    }
}
verifySyncStatus();
