
// import fetch from 'node-fetch'; // Native in Node 18+

async function testMutations() {
    const BASE_URL = 'http://localhost:4000';
    const email = `mutator${Date.now()}@example.com`;
    const password = 'password123';
    let token = '';
    let sheetId = 0;
    let rowId = 0;
    let cellId = 0;

    const headers = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    });

    try {
        console.log('1. Setup (Register/Login/Create Sheet)');
        // Register & Login
        await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
        });
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
        });
        const loginData: any = await loginRes.json();
        token = loginData.data.token;

        // Create Sheet
        const createRes = await fetch(`${BASE_URL}/sheets`, {
            method: 'POST', headers: headers(), body: JSON.stringify({ name: 'Mutation Test Sheet' })
        });
        const createData: any = await createRes.json();
        sheetId = createData.data.id;
        console.log('Sheet ID:', sheetId);

        // 2. Add Row
        console.log('\n2. Adding Row...');
        const addRowRes = await fetch(`${BASE_URL}/sheets/${sheetId}/rows`, {
            method: 'POST', headers: headers(), body: JSON.stringify({ row_index: 1 })
        });
        const addRowData: any = await addRowRes.json();
        console.log('Add Row:', addRowRes.status, addRowData);
        rowId = addRowData.data.id;

        // 3. Update Cell (Insert)
        console.log('\n3. Update Cell (Insert)...');
        const insertCellRes = await fetch(`${BASE_URL}/sheets/${sheetId}/cells`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify({ row_id: rowId, column_key: 'A', value: 'Hello' })
        });
        const insertCellData: any = await insertCellRes.json();
        console.log('Insert Cell:', insertCellRes.status, insertCellData);

        // 4. Update Cell (Update)
        console.log('\n4. Update Cell (Update)...');
        const updateCellRes = await fetch(`${BASE_URL}/sheets/${sheetId}/cells`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify({ row_id: rowId, column_key: 'A', value: 'World' })
        });
        const updateCellData: any = await updateCellRes.json();
        console.log('Update Cell:', updateCellRes.status, updateCellData);

        // 5. Delete Row
        console.log('\n5. Delete Row...');
        const deleteRowRes = await fetch(`${BASE_URL}/sheets/${sheetId}/rows/${rowId}`, {
            method: 'DELETE', headers: headers()
        });
        const deleteRowData = await deleteRowRes.json();
        console.log('Delete Row:', deleteRowRes.status, deleteRowData);

    } catch (error) {
        console.error('Mutation Test Failed:', error);
        if (error instanceof Error) console.error(error.stack);
    }
}

testMutations();
