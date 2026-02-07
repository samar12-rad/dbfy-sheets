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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(__dirname, '../.env');
console.log(`Loading env from: ${envPath}`);
const result = dotenv_1.default.config({ path: envPath });
if (result.error) {
    console.error("Error loading .env file:", result.error);
}
console.log("Environment loaded.");
console.log(`DB_PASSWORD available: ${!!process.env.DB_PASSWORD}`);
if (process.env.DB_PASSWORD) {
    console.log(`DB_PASSWORD length: ${process.env.DB_PASSWORD.length}`);
    console.log(`DB_PASSWORD starts with: ${process.env.DB_PASSWORD.substring(0, 2)}`);
}
function testConnection(host) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`\nTesting connection to ${host}...`);
        try {
            const connection = yield promise_1.default.createConnection({
                host: host,
                user: "sheet_user",
                password: process.env.DB_PASSWORD,
                database: "sheetdb",
                connectTimeout: 5000
            });
            console.log(`SUCCESS: Connected to database on ${host}!`);
            yield connection.end();
            return true;
        }
        catch (error) {
            console.error(`FAILURE: Could not connect to ${host}.`);
            console.error("Error Code:", error.code);
            console.error("Error Message:", error.message);
            return false;
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield testConnection('localhost');
        yield testConnection('127.0.0.1');
    });
}
run();
