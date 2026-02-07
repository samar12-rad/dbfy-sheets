
// import fetch from 'node-fetch';

async function verifyIntegration() {
    const BASE_URL = 'http://localhost:4000';
    const email = `integ${Date.now()}@example.com`;
    const password = 'password123';
    let token = '';
    let sheetId = 0;

    const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

    try {
        console.log('Setup... (Login/Register/Create)');
        await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const loginRes = await fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        token = (await loginRes.json() as any).data.token;
        const sheetRes = await fetch(`${BASE_URL}/sheets`, { method: 'POST', headers: headers(), body: JSON.stringify({ name: 'Integration Sheet' }) });
        sheetId = (await sheetRes.json() as any).data.id;

        // 1. Connect
        console.log('1. Connecting to Google Sheet...');
        const connectRes = await fetch(`${BASE_URL}/sheets/${sheetId}/connection`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
                external_sheet_id: 'SPREADSHEET_ID_123',
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                token_expiry: Date.now() + 3600000
            })
        });
        console.log('Connect Status:', connectRes.status, await connectRes.json());

        // 2. Import
        console.log('2. Importing Data...');
        const importRes = await fetch(`${BASE_URL}/sheets/${sheetId}/import`, { method: 'POST', headers: headers() });
        const importData = await importRes.json();
        console.log('Import Result:', importData);

        // 3. Sync
        console.log('3. Syncing Data...');
        const syncRes = await fetch(`${BASE_URL}/sheets/${sheetId}/sync`, { method: 'POST', headers: headers() });
        const syncData = await syncRes.json();
        console.log('Sync Result:', syncData);

    } catch (e) {
        console.error('Integration Test Failed:', e);
        if (e instanceof Error) console.error(e.stack);
    }
}
verifyIntegration();
