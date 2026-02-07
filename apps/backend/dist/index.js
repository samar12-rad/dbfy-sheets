"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const result = dotenv_1.default.config();
if (result.error) {
    console.error('Error loading .env file:', result.error);
}
console.log('Dotenv loaded:', result.parsed);
console.log('Current Env Vars:', {
    DB_PASSWORD: process.env.DB_PASSWORD ? 'REDACTED' : 'MISSING',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'PRESENT' : 'MISSING',
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI
});
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const error_1 = require("./middlewares/error");
const auth_1 = __importDefault(require("./routes/auth"));
const sheets_1 = __importDefault(require("./routes/sheets"));
const logs_1 = __importDefault(require("./routes/logs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Trust proxy for ngrok/reverse proxies
app.set('trust proxy', 1);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased limit for development
    skip: (req) => {
        // Skip rate limiting for SSE and webhook endpoints
        return req.path.startsWith('/events/') || req.path === '/sheet';
    },
});
app.use(limiter);
app.use('/auth', auth_1.default);
app.use('/oauth', auth_1.default); // Alias for Google OAuth callback matching Console config
app.use('/sheets', sheets_1.default);
app.use('/logs', logs_1.default);
const webhook_1 = __importDefault(require("./routes/webhook"));
app.use('/', webhook_1.default); // Mounts /sheet
// SSE Endpoint for real-time updates
const sse_1 = require("./sse");
app.get('/events/:sheetId', (req, res) => {
    const sheetId = req.params.sheetId;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();
    const onUpdate = (data) => {
        if (String(data.sheetId) === sheetId) {
            res.write(`data: ${JSON.stringify({ type: 'update', sheetId: data.sheetId })}\n\n`);
        }
    };
    sse_1.sheetUpdates.on('update', onUpdate);
    req.on('close', () => {
        sse_1.sheetUpdates.off('update', onUpdate);
    });
});
// Global Error Handler (Must be last)
app.use(error_1.errorHandler);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Test DB Connection
db_1.pool.getConnection()
    .then(connection => {
    console.log('Database connected successfully');
    connection.release();
})
    .catch(err => {
    console.error('Database connection failed:', err);
});
app.listen(PORT, () => {
    console.log(`Server running smoooothly on http://localhost:${PORT}`);
});
