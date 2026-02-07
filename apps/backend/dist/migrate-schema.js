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
const db_1 = require("./db");
function migrate() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Migrating sheets table...');
            const queries = [
                `ALTER TABLE sheets ADD COLUMN external_sheet_id VARCHAR(255) NULL`,
                `ALTER TABLE sheets ADD COLUMN access_token TEXT NULL`,
                `ALTER TABLE sheets ADD COLUMN refresh_token TEXT NULL`,
                `ALTER TABLE sheets ADD COLUMN token_expiry BIGINT NULL`,
                `CREATE INDEX idx_external_sheet_id ON sheets(external_sheet_id)`
            ];
            for (const q of queries) {
                try {
                    yield db_1.pool.query(q);
                    console.log(`Executed: ${q}`);
                }
                catch (err) {
                    if (err.code === 'ER_DUP_FIELDNAME') {
                        console.log(`Skipped (already exists): ${q}`);
                    }
                    else if (err.code === 'ER_DUP_KEYNAME') {
                        console.log(`Skipped (index exists): ${q}`);
                    }
                    else {
                        console.error(`Failed: ${q}`, err);
                    }
                }
            }
            console.log('Migration complete.');
        }
        catch (error) {
            console.error('Migration failed:', error);
        }
        finally {
            process.exit();
        }
    });
}
migrate();
