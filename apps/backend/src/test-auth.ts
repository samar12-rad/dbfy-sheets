
// import fetch from 'node-fetch'; // Native fetch in Node 18+

async function testAuth() {
    const BASE_URL = 'http://localhost:4000';
    const email = `test123456789${Date.now()}@example.com`;
    const password = 'password123';

    try {
        console.log('1. Health Check');
        const health = await fetch(`${BASE_URL}/health`);
        console.log('Health:', await health.json());

        console.log('\n2. Register');
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const regData = await regRes.json();
        console.log('Register:', regRes.status, regData);

        if (regRes.status !== 201) return;

        console.log('\n3. Login');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        console.log('Login:', loginRes.status, loginData.data ? 'Token received' : loginData);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testAuth();
