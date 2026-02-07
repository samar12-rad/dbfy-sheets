import mysql from "mysql2/promise";
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "sheet_user",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "sheetdb",
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    // SSL required for cloud databases like Aiven
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});
