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
function verifyConsistency() {
    return __awaiter(this, void 0, void 0, function* () {
        const BASE_URL = 'http://localhost:4000';
        const email = `audit${Date.now()}@example.com`;
        const password = 'password123';
        let token = '';
        try {
            console.log('Setup...');
            // Login/Register
            yield fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const loginRes = yield fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            token = (yield loginRes.json()).data.token;
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
            // 1. Create Sheet
            const sheetRes = yield fetch(`${BASE_URL}/sheets`, { method: 'POST', headers, body: JSON.stringify({ name: 'Audit Sheet' }) });
            const sheetId = (yield sheetRes.json()).data.id;
            console.log('1. Sheet Created:', sheetId);
            // 2. Add Row
            const rowRes = yield fetch(`${BASE_URL}/sheets/${sheetId}/rows`, { method: 'POST', headers, body: JSON.stringify({ row_index: 0 }) });
            const rowId = (yield rowRes.json()).data.id;
            console.log('2. Row Added:', rowId);
            // 3. Update Cell
            yield fetch(`${BASE_URL}/sheets/${sheetId}/cells`, { method: 'PATCH', headers, body: JSON.stringify({ row_id: rowId, column_key: 'A', value: 'V1' }) });
            console.log('3. Cell Updated');
            // 4. Delete Row
            yield fetch(`${BASE_URL}/sheets/${sheetId}/rows/${rowId}`, { method: 'DELETE', headers });
            console.log('4. Row Deleted');
            // 5. Verify Logs
            const logsRes = yield fetch(`${BASE_URL}/sheets/${sheetId}/logs`, { headers });
            const logsData = yield logsRes.json();
            console.log('5. Fetched Logs:', logsData.data.length);
            logsData.data.forEach((l) => console.log(`[${l.action_type}] ${l.entity_type} ID:${l.entity_id}`));
            if (logsData.data.length >= 4) {
                console.log('Consistency Verified: Logs present.');
            }
            else {
                console.log('Consistency Failed: Missing logs.');
            }
        }
        catch (e) {
            console.error(e);
        }
    });
}
verifyConsistency();
