"use strict";
// import fetch from 'node-fetch'; // Native fetch in Node 18+
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function testSheets() {
    return __awaiter(this, void 0, void 0, function* () {
        const BASE_URL = 'http://localhost:4000';
        // Use a new email to avoid conflicts or reuse existing? New is safer.
        const email = `sheettest${Date.now()}@example.com`;
        const password = 'password123';
        let token = '';
        let sheetId = 0;
        try {
            // 1. Register & Login
            console.log('1. Registering user...');
            yield fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            console.log('2. Logging in...');
            const loginRes = yield fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = yield loginRes.json();
            token = loginData.data.token;
            console.log('Token acquired.');
            // 2. Create Sheet
            console.log('3. Creating Sheet...');
            const createRes = yield fetch(`${BASE_URL}/sheets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: 'My First Budget' })
            });
            const createData = yield createRes.json();
            console.log('Create Sheet Status:', createRes.status, createData);
            sheetId = createData.data.id;
            // 3. List Sheets
            console.log('4. Listing Sheets...');
            const listRes = yield fetch(`${BASE_URL}/sheets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const listData = yield listRes.json();
            console.log('Sheets List:', listData);
            // 4. Get Sheet
            console.log('5. Get Sheet Details...');
            const getRes = yield fetch(`${BASE_URL}/sheets/${sheetId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const getData = yield getRes.json();
            console.log('Sheet Details:', getData);
        }
        catch (error) {
            console.error('Test failed:', error);
            if (error instanceof Error)
                console.error(error.stack);
        }
    });
}
testSheets();
