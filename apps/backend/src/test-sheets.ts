
// import fetch from 'node-fetch'; // Native fetch in Node 18+

async function testSheets() {
    const BASE_URL = 'http://localhost:4000';
    // Use a new email to avoid conflicts or reuse existing? New is safer.
    const email = `sheettest${Date.now()}@example.com`;
    const password = 'password123';
    let token = '';
    let sheetId = 0;

    try {
        // 1. Register & Login
        console.log('1. Registering user...');
        await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log('2. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginData: any = await loginRes.json();
        token = loginData.data.token;
        console.log('Token acquired.');

        // 2. Create Sheet
        console.log('3. Creating Sheet...');
        const createRes = await fetch(`${BASE_URL}/sheets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: 'My First Budget' })
        });
        const createData: any = await createRes.json();
        console.log('Create Sheet Status:', createRes.status, createData);
        sheetId = createData.data.id;

        // 3. List Sheets
        console.log('4. Listing Sheets...');
        const listRes = await fetch(`${BASE_URL}/sheets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        console.log('Sheets List:', listData);

        // 4. Get Sheet
        console.log('5. Get Sheet Details...');
        const getRes = await fetch(`${BASE_URL}/sheets/${sheetId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const getData = await getRes.json();
        console.log('Sheet Details:', getData);

    } catch (error) {
        console.error('Test failed:', error);
        if (error instanceof Error) console.error(error.stack);
    }
}

testSheets();
