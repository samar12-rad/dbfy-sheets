
// import fetch from 'node-fetch';

async function verifyConsistency() {
    const BASE_URL = 'http://localhost:4000';
    const email = `audit${Date.now()}@example.com`;
    const password = 'password123';
    let token = '';

    try {
        console.log('Setup...');
        // Login/Register
        await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const loginRes = await fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        token = (await loginRes.json() as any).data.token;
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

        // 1. Create Sheet
        const sheetRes = await fetch(`${BASE_URL}/sheets`, { method: 'POST', headers, body: JSON.stringify({ name: 'Audit Sheet' }) });
        const sheetId = (await sheetRes.json() as any).data.id;
        console.log('1. Sheet Created:', sheetId);

        // 2. Add Row
        const rowRes = await fetch(`${BASE_URL}/sheets/${sheetId}/rows`, { method: 'POST', headers, body: JSON.stringify({ row_index: 0 }) });
        const rowId = (await rowRes.json() as any).data.id;
        console.log('2. Row Added:', rowId);

        // 3. Update Cell
        await fetch(`${BASE_URL}/sheets/${sheetId}/cells`, { method: 'PATCH', headers, body: JSON.stringify({ row_id: rowId, column_key: 'A', value: 'V1' }) });
        console.log('3. Cell Updated');

        // 4. Delete Row
        await fetch(`${BASE_URL}/sheets/${sheetId}/rows/${rowId}`, { method: 'DELETE', headers });
        console.log('4. Row Deleted');

        // 5. Verify Logs
        const logsRes = await fetch(`${BASE_URL}/sheets/${sheetId}/logs`, { headers });
        const logsData: any = await logsRes.json();
        console.log('5. Fetched Logs:', logsData.data.length);
        logsData.data.forEach((l: any) => console.log(`[${l.action_type}] ${l.entity_type} ID:${l.entity_id}`));

        if (logsData.data.length >= 4) {
            console.log('Consistency Verified: Logs present.');
        } else {
            console.log('Consistency Failed: Missing logs.');
        }

    } catch (e) {
        console.error(e);
    }
}
verifyConsistency();
