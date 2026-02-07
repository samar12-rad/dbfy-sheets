"use strict";
// import fetch from 'node-fetch'; // Native in Node 18+
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function testMutations() {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield fetch(`${BASE_URL}/auth/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
            });
            const loginRes = yield fetch(`${BASE_URL}/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
            });
            const loginData = yield loginRes.json();
            token = loginData.data.token;
            // Create Sheet
            const createRes = yield fetch(`${BASE_URL}/sheets`, {
                method: 'POST', headers: headers(), body: JSON.stringify({ name: 'Mutation Test Sheet' })
            });
            const createData = yield createRes.json();
            sheetId = createData.data.id;
            console.log('Sheet ID:', sheetId);
            // 2. Add Row
            console.log('\n2. Adding Row...');
            const addRowRes = yield fetch(`${BASE_URL}/sheets/${sheetId}/rows`, {
                method: 'POST', headers: headers(), body: JSON.stringify({ row_index: 1 })
            });
            const addRowData = yield addRowRes.json();
            console.log('Add Row:', addRowRes.status, addRowData);
            rowId = addRowData.data.id;
            // 3. Update Cell (Insert)
            console.log('\n3. Update Cell (Insert)...');
            const insertCellRes = yield fetch(`${BASE_URL}/sheets/${sheetId}/cells`, {
                method: 'PATCH',
                headers: headers(),
                body: JSON.stringify({ row_id: rowId, column_key: 'A', value: 'Hello' })
            });
            const insertCellData = yield insertCellRes.json();
            console.log('Insert Cell:', insertCellRes.status, insertCellData);
            // 4. Update Cell (Update)
            console.log('\n4. Update Cell (Update)...');
            const updateCellRes = yield fetch(`${BASE_URL}/sheets/${sheetId}/cells`, {
                method: 'PATCH',
                headers: headers(),
                body: JSON.stringify({ row_id: rowId, column_key: 'A', value: 'World' })
            });
            const updateCellData = yield updateCellRes.json();
            console.log('Update Cell:', updateCellRes.status, updateCellData);
            // 5. Delete Row
            console.log('\n5. Delete Row...');
            const deleteRowRes = yield fetch(`${BASE_URL}/sheets/${sheetId}/rows/${rowId}`, {
                method: 'DELETE', headers: headers()
            });
            const deleteRowData = yield deleteRowRes.json();
            console.log('Delete Row:', deleteRowRes.status, deleteRowData);
        }
        catch (error) {
            console.error('Mutation Test Failed:', error);
            if (error instanceof Error)
                console.error(error.stack);
        }
    });
}
testMutations();
