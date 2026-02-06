import mysql from "mysql2/promise";
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
console.log(`Loading env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env file:", result.error);
}

console.log("Environment loaded.");
console.log(`DB_PASSWORD available: ${!!process.env.DB_PASSWORD}`);
if (process.env.DB_PASSWORD) {
    console.log(`DB_PASSWORD length: ${process.env.DB_PASSWORD.length}`);
    console.log(`DB_PASSWORD starts with: ${process.env.DB_PASSWORD.substring(0, 2)}`);
}

async function testConnection(host: string) {
    console.log(`\nTesting connection to ${host}...`);
    try {
        const connection = await mysql.createConnection({
            host: host,
            user: "sheet_user",
            password: process.env.DB_PASSWORD,
            database: "sheetdb",
            connectTimeout: 5000
        });
        console.log(`SUCCESS: Connected to database on ${host}!`);
        await connection.end();
        return true;
    } catch (error: any) {
        console.error(`FAILURE: Could not connect to ${host}.`);
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        return false;
    }
}

async function run() {
    await testConnection('localhost');
    await testConnection('127.0.0.1');
}

run();
