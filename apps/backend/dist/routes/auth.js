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
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const validators_1 = require("../validators");
const router = express_1.default.Router();
// Ensure env vars are loaded if this file is imported early
if (!process.env.JWT_SECRET)
    require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';
// Login
router.post('/login', (0, validators_1.validate)(validators_1.loginSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email and password required' } });
        return;
    }
    try {
        const [rows] = yield db_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            res.status(401).json({ error: { code: 'AUTH_FAILED', message: 'Invalid credentials' } });
            return;
        }
        const user = rows[0];
        const validPassword = yield bcryptjs_1.default.compare(password, user.password_hash);
        if (!validPassword) {
            res.status(401).json({ error: { code: 'AUTH_FAILED', message: 'Invalid credentials' } });
            return;
        }
        const payload = { id: user.id, email: user.email };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '8h' });
        res.json({
            data: {
                token,
                user: { id: user.id, email: user.email }
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
    }
}));
// Register (Helper for development)
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email and password required' } });
        return;
    }
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const [result] = yield db_1.pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hashedPassword]);
        res.status(201).json({
            data: {
                id: result.insertId,
                email
            }
        });
    }
    catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: { code: 'CONFLICT', message: 'Email already exists' } });
            return;
        }
        console.error('Register error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
    }
}));
// Google OAuth
const googleapis_1 = require("googleapis");
const auth_1 = require("../middlewares/auth");
const getOAuthClient = () => {
    return new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/auth/google/callback');
};
router.post('/google/start', auth_1.authenticateUser, (req, res) => {
    var _a;
    const { spreadsheetId } = req.body;
    if (!spreadsheetId) {
        res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Spreadsheet ID required' } });
        return;
    }
    const state = Buffer.from(JSON.stringify({
        userId: req.user.id,
        spreadsheetId
    })).toString('base64');
    const scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
    const oauth2Client = getOAuthClient();
    console.log('OAuth Config Debug:', {
        clientId: ((_a = process.env.GOOGLE_CLIENT_ID) === null || _a === void 0 ? void 0 : _a.slice(0, 5)) + '...',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/auth/google/callback'
    });
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Crucial for refresh_token
        scope: scopes,
        state,
        prompt: 'consent' // Force consent to ensure refresh_token is returned
    });
    console.log('Generated Auth URL:', url);
    res.json({ url });
});
router.get('/google/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { code, state } = req.query;
    if (!code || !state) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?status=error&message=Missing_code_or_state`);
        return;
    }
    try {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        const { userId, spreadsheetId } = decodedState;
        const oauth2Client = getOAuthClient();
        const { tokens } = yield oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        // Fetch Spreadsheet Info (Name)
        const sheetsClient = googleapis_1.google.sheets({ version: 'v4', auth: oauth2Client });
        const sheetMetadata = yield sheetsClient.spreadsheets.get({ spreadsheetId });
        const sheetName = ((_a = sheetMetadata.data.properties) === null || _a === void 0 ? void 0 : _a.title) || 'Untitled Sheet';
        const connection = yield db_1.pool.getConnection();
        try {
            yield connection.beginTransaction();
            // Insert or Update Sheet
            // If sheet with this external_id exists for this user, update it? 
            // Or usually permit multiple connections? Plan implies "Connect New Sheet".
            // We'll insert a new record.
            const [result] = yield connection.query(`INSERT INTO sheets 
                (name, owner_id, external_sheet_id, access_token, refresh_token, token_expiry, status, last_sync_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                sheetName,
                userId,
                spreadsheetId,
                tokens.access_token,
                tokens.refresh_token, // Might be null if user didn't consent offline
                tokens.expiry_date || null,
                'connected',
                'PENDING'
            ]);
            // Log Activity
            yield connection.query(`INSERT INTO activity_logs (user_id, sheet_id, action_type, entity_type, entity_id, new_value) VALUES (?, ?, ?, ?, ?, ?)`, [userId, result.insertId, 'SHEET_CONNECT', 'SHEET', result.insertId, JSON.stringify({ external_sheet_id: spreadsheetId })]);
            yield connection.commit();
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?status=success`);
        }
        catch (dbError) {
            yield connection.rollback();
            console.error('DB Error in OAuth callback:', dbError);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?status=error&message=Database_error`);
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('OAuth Callback Error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?status=error&message=OAuth_failed`);
    }
}));
exports.default = router;
