"use strict";
// import fetch from 'node-fetch';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function verifyIntegration() {
    return __awaiter(this, void 0, void 0, function* () {
        const BASE_URL = 'http://localhost:4000';
        const email = `integ${Date.now()}@example.com`;
        const password = 'password123';
        let token = '';
        let sheetId = 0;
        const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
        try {
            console.log('Setup... (Login/Register/Create)');
            yield fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const loginRes = yield fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            token = (yield loginRes.json()).data.token;
            const sheetRes = yield fetch(`${BASE_URL}/sheets`, { method: 'POST', headers: headers(), body: JSON.stringify({ name: 'Integration Sheet' }) });
            sheetId = (yield sheetRes.json()).data.id;
            // 1. Connect
            console.log('1. Connecting to Google Sheet...');
            const connectRes = yield fetch(`${BASE_URL}/sheets/${sheetId}/connection`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({
                    external_sheet_id: 'SPREADSHEET_ID_123',
                    access_token: 'mock_access_token',
                    refresh_token: 'mock_refresh_token',
                    token_expiry: Date.now() + 3600000
                })
            });
            console.log('Connect Status:', connectRes.status, yield connectRes.json());
            // 2. Import
            console.log('2. Importing Data...');
            const importRes = yield fetch(`${BASE_URL}/sheets/${sheetId}/import`, { method: 'POST', headers: headers() });
            const importData = yield importRes.json();
            console.log('Import Result:', importData);
            // 3. Sync
            console.log('3. Syncing Data...');
            const syncRes = yield fetch(`${BASE_URL}/sheets/${sheetId}/sync`, { method: 'POST', headers: headers() });
            const syncData = yield syncRes.json();
            console.log('Sync Result:', syncData);
        }
        catch (e) {
            console.error('Integration Test Failed:', e);
            if (e instanceof Error)
                console.error(e.stack);
        }
    });
}
verifyIntegration();
