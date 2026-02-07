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
function check() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [rows] = yield db_1.pool.query('SELECT * FROM sheets LIMIT 1');
            if (rows.length > 0) {
                console.log('Keys:', Object.keys(rows[0]));
            }
            else {
                console.log('No sheets found. Creating one to check keys.');
                yield db_1.pool.query('INSERT INTO sheets (name, owner_id) VALUES (?, ?)', ['Temp Check', 1]); // Assuming user 1 exists
                const [newRows] = yield db_1.pool.query('SELECT * FROM sheets ORDER BY id DESC LIMIT 1');
                console.log('Keys:', Object.keys(newRows[0]));
            }
        }
        catch (e) {
            console.error(e);
        }
        process.exit();
    });
}
check();
