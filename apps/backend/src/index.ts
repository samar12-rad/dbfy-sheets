import dotenv from 'dotenv';
const result = dotenv.config();

if (result.error) {
  console.error('Error loading .env file:', result.error);
}

import express, { Request, Response } from 'express';
import cors from 'cors';
import { pool } from './db';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/error';
import authRouter from './routes/auth';
import sheetsRouter from './routes/sheets';
import logsRouter from './routes/logs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Trust proxy for ngrok/reverse proxies
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit for development
  skip: (req) => {
    // Skip rate limiting for SSE and webhook endpoints
    return req.path.startsWith('/events/') || req.path === '/sheet';
  },
});
app.use(limiter);

app.use('/auth', authRouter);
app.use('/oauth', authRouter); // Alias for Google OAuth callback matching Console config
app.use('/sheets', sheetsRouter);
app.use('/logs', logsRouter);
import webhookRouter from './routes/webhook';
app.use('/', webhookRouter); // Mounts /sheet

// SSE Endpoint for real-time updates
import { sheetUpdates } from './sse';
app.get('/events/:sheetId', (req: Request, res: Response) => {
  const sheetId = req.params.sheetId;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const onUpdate = (data: { sheetId: number }) => {
    if (String(data.sheetId) === sheetId) {
      res.write(`data: ${JSON.stringify({ type: 'update', sheetId: data.sheetId })}\n\n`);
    }
  };

  sheetUpdates.on('update', onUpdate);

  req.on('close', () => {
    sheetUpdates.off('update', onUpdate);
  });
});

// Global Error Handler (Must be last)
app.use(errorHandler);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test DB Connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
