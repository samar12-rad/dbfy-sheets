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
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateUser);
// Global Logs
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const [rows] = yield db_1.pool.query('SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [userId]);
        res.json({ data: rows });
    }
    catch (error) {
        console.error('Fetch logs error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch logs' } });
    }
}));
exports.default = router;
// Also need to add sheet-specific logs to sheets.ts or here?
// The requirement was "per sheet logs page".
// I'll add `GET /sheets/:id/logs` in sheets.ts.
