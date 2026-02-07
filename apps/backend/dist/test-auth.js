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
function testAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        const BASE_URL = 'http://localhost:4000';
        const email = `test123456789${Date.now()}@example.com`;
        const password = 'password123';
        try {
            console.log('1. Health Check');
            const health = yield fetch(`${BASE_URL}/health`);
            console.log('Health:', yield health.json());
            console.log('\n2. Register');
            const regRes = yield fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const regData = yield regRes.json();
            console.log('Register:', regRes.status, regData);
            if (regRes.status !== 201)
                return;
            console.log('\n3. Login');
            const loginRes = yield fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = yield loginRes.json();
            console.log('Login:', loginRes.status, loginData.data ? 'Token received' : loginData);
        }
        catch (error) {
            console.error('Test failed:', error);
        }
    });
}
testAuth();
