import mysql from "mysql2/promise";
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
    host: "localhost",
    user: "sheet_user",
    password: process.env.DB_PASSWORD,
    database: "sheetdb",
    waitForConnections: true,
    connectionLimit: 10
});
