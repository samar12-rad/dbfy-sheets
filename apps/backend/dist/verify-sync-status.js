"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// import fetch from 'node-fetch';
const db_1 = require("./db");
function verifySyncStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        const BASE_URL = 'http://localhost:4000';
        const email = `statuscheck${Date.now()}@example.com`;
        const password = 'password123';
        let token = '';
        let sheetId = 0;
        const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
        try {
            console.log('Setup...');
            // Login/Register/Create/Connect
            yield fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const loginRes = yield fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            token = (yield loginRes.json()).data.token;
            const sheetRes = yield fetch(`${BASE_URL}/sheets`, { method: 'POST', headers: headers(), body: JSON.stringify({ name: 'Status Check Sheet' }) });
            sheetId = (yield sheetRes.json()).data.id;
            yield fetch(`${BASE_URL}/sheets/${sheetId}/connection`, {
                method: 'POST', headers: headers(), body: JSON.stringify({ external_sheet_id: 'EXT_ID', access_token: 'TOK' })
            });
            // Sync
            console.log('Triggering Sync...');
            yield fetch(`${BASE_URL}/sheets/${sheetId}/sync`, { method: 'POST', headers: headers() });
            // Verify DB
            console.log('Checking DB Status...');
            const [rows] = yield db_1.pool.query('SELECT last_synced_at, last_sync_status FROM sheets WHERE id = ?', [sheetId]);
            console.log('Sheet Status:', rows[0]);
            if (rows[0].last_sync_status === 'SUCCESS' && rows[0].last_synced_at) {
                console.log('Verification Passed: Sync status updated.');
            }
            else {
                console.log('Verification Failed.');
            }
        }
        catch (e) {
            console.error('Verification Failed:', e);
            if (e instanceof Error)
                console.error(e.stack);
        }
        finally {
            process.exit();
        }
    });
}
verifySyncStatus();
